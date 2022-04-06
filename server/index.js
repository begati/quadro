const express = require('express');
const fetch = require('isomorphic-unfetch');
const spotifyUrlInfo = require('spotify-url-info');
const getColors = require('get-image-colors');
const { json } = require('body-parser');
const cors = require('cors');
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const nodeHtmlToImage = require('node-html-to-image');
const Handlebars = require("handlebars");
const Jimp = require('jimp');
const PDFDocument = require('pdfkit');
const stream = require('stream');

const app = express();
const { getData } = spotifyUrlInfo(fetch);

app.use(cors());
app.use(json());

const ASPECT_RATIO_A3 = 1.41391106;
const ASPECT_RATIO_A4 = 1.41427563;

const WIDTH_IMAGE = 1024;
const WIDTH_PDF_A4 = 580;
const WIDTH_PDF_A3 = 841.89;

const FIT_A4 = { fit: [WIDTH_PDF_A4, WIDTH_PDF_A4 * ASPECT_RATIO_A4] };
const FIT_A3 = { fit: [WIDTH_PDF_A3, WIDTH_PDF_A3 * ASPECT_RATIO_A3] };

Handlebars.registerHelper('year', date => date.split('-')[0]);
Handlebars.registerHelper('part', (arr, size) => Array.from(Array(size), (_, k) => arr[k]));

const genImage = content => {
    const html = readFileSync(
        join(__dirname, `templates/template_${content.type}_${content.template}.html`),
        { encoding: 'utf8', flag: 'r' }
    );
    return nodeHtmlToImage({
        content,
        puppeteerArgs: {
            defaultViewport: {
                width: WIDTH_IMAGE,
                height: parseInt(WIDTH_IMAGE * ASPECT_RATIO_A3),
            }
        },
        html,
    });
};

const capitalize = value => value.charAt(0).toUpperCase() + value.substr(1);

const getTemplates = type => {
    const dir = readdirSync(join(__dirname, 'templates'));
    return dir.filter(it => it.indexOf(`template_${type}_`) === 0)
        .map(it => {
            const regEx = new RegExp(`template_${type}_(.*?)\.html`, 'g');
            const value = it.replace(regEx, "$1");
            return { value, label: `${capitalize(type)} ${value.toUpperCase()}` };
        });
};

const getCopyrights = value => {
    let result = null;

    if (isNaN(value.substr(0, 4))) {
        result = value.substr(value.indexOf('(C)') === -1 ? 6 : 9);
    } else {
        result = value.substr(5);
    }

    return result;
};

const parseAlbum = async data => {
    const cover = data.images[0].url;
    const colors = (await getColors(cover)).map(it => it.hex());

    const tracks = data.tracks.items.reduce(
        (result, it) => ({
            duration: result.duration + it.duration_ms,
            items: [...result.items, { index: it.track_number, name: it.name }]
        }),
        {
            items: [],
            duration: 0,
        }
    );

    tracks.duration = parseInt(tracks.duration / 1000);

    const copyrights = data.copyrights.find(it => it.type === 'C');
    const templates = getTemplates('album');

    return {
        model: 'A4',
        type: 'album',
        copyrights: getCopyrights(copyrights.text),
        artist: data.artists[0].name,
        release: data.release_date,
        tracks: tracks.items,
        duration: tracks.duration,
        name: data.name,
        template: templates[0].value,
        templates,
        colors,
        cover,
    };
};

const parseTrack = async data => {
    const cover = data.album.images[0].url;
    const colors = (await getColors(cover)).map(it => it.hex());
    const templates = getTemplates('track');
    return {
        model: 'A4',
        type: 'track',
        album_index: data.track_number,
        artist: data.artists[0].name,
        album: data.album.name,
        release: data.album.release_date,
        duration: parseInt(data.duration_ms / 1000),
        name: data.name,
        current_time: 0,
        template: templates[0].value,
        templates,
        colors,
        cover,
    };
};

app.post('/fetch', async (req, res) => {
    try {
        const data = await getData(req.body.url);
        let response;

        switch (data.type) {
            case 'track':
                response = res.status(200).send(await parseTrack(data));
                break;
            case 'album':
                response = res.status(200).send(await parseAlbum(data));
                break;
            default:
                response = res.status(500).send();
                break;
        }

        return response;
    } catch (e) {
        return res.status(500).send();
    }
});

app.post('/preview', async (req, res) => {
    const image = await genImage(req.body);
    return res.status(200).send({
        image: `data:image/png;base64,${image.toString('base64')}`,
    });
});

app.post('/generate', async (req, res) => {
    const image = await genImage(req.body);

    const buff = [];
    const writter = new stream.Writable();

    writter._write = function (chunk, _, done) {
        buff.push(chunk);
        done();
    };

    const doc = new PDFDocument({ margin: 0, size: req.body.model });
    doc.pipe(writter);

    if (req.body.model === 'A4') {
        const img = await Jimp.read(image);

        const half = img.bitmap.height / 2;
    
        const heightUp = Math.ceil(half);
        const heightDown = Math.floor(half);
    
        const halfUp = await img.clone()
                                .crop(0, 0, img.bitmap.width, heightUp)
                                .rotate(90)
                                .getBufferAsync(Jimp.MIME_PNG);
    
        const halfDown = await img.clone()
                                .crop(0, heightUp, img.bitmap.width, heightDown)
                                .rotate(90)
                                .getBufferAsync(Jimp.MIME_PNG);

        doc.image(halfUp, 10, 10, FIT_A4);
        doc.addPage();
        doc.image(halfDown, 10, 10, FIT_A4);
    } else {
        doc.image(image, 0, 0, FIT_A3);
    }
    
    doc.end();

    const buffer = await new Promise(resolve => writter.on('close', () => resolve(Buffer.concat(buff))));

    return res.status(200).send({
        file: buffer.toString("base64"),
    });
});

app.listen(5000, () => console.log('Server listen on :5000'));
