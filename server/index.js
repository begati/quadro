const express = require('express');
const fetch = require('isomorphic-unfetch');
const spotifyUrlInfo = require('spotify-url-info');
const getColors = require('get-image-colors');
const { json } = require('body-parser');
const cors = require('cors');
const { readFileSync, createWriteStream } = require('fs');
const { join } = require('path');
const nodeHtmlToImage = require('node-html-to-image');
const Handlebars = require("handlebars");
const Jimp = require('jimp');
const PDFDocument = require('pdfkit');

const app = express();
const { getData } = spotifyUrlInfo(fetch);

app.use(cors());
app.use(json());

const WIDTH = 1024;
const ASPECT_RATIO = 1.41391106;
const FIT = { fit: [595.28, 841.89] };

Handlebars.registerHelper('year', date => date.split('-')[0]);

const genImage = content => {
    const html = readFileSync(join(__dirname, 'templates/template_a.html'), { encoding: 'utf8', flag: 'r' });
    return nodeHtmlToImage({
        content,
        puppeteerArgs: {
            defaultViewport: {
                width: WIDTH,
                height: parseInt(WIDTH * ASPECT_RATIO),
            }
        },
        html,
    });
};

app.post('/fetch', async (req, res) => {
    try {
        const data = await getData(req.body.url);

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

        return res.status(200).send({
            copyrights: copyrights.text.substr(copyrights.text.indexOf('(C)') === -1 ? 6 : 9),
            artist: data.artists[0].name,
            release: data.release_date,
            tracks: tracks.items,
            duration: tracks.duration,
            name: data.name,
            colors,
            cover,
        });
    } catch (e) {
        return res.status(500).send();
    }
});

// app.post('/preview', async (req, res) => {
//     const image = await genImage(req.body);
//     return res.status(200).send({
//         image: `data:image/png;base64,${image.toString('base64')}`,
//     });
// });

app.post('/preview', async (req, res) => {
    const image = await genImage(req.body);
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
                            .rotate(270)
                            .getBufferAsync(Jimp.MIME_PNG);


    

    const doc = new PDFDocument({ margin: 0, size: 'A4' });

    doc.pipe(createWriteStream('./output.pdf'));
    doc.image(halfUp, 0, 0, FIT);
    doc.addPage();
    doc.image(halfDown, 0, 0, FIT);
    doc.end();

    return res.status(200).send({
        image: `data:image/png;base64,${image.toString('base64')}`,
    });
});

app.listen(5000, () => console.log('Server listen on :5000'));
