const express = require('express');
const fetch = require('isomorphic-unfetch');
const spotifyUrlInfo = require('spotify-url-info');
const getColors = require('get-image-colors');
const { json } = require('body-parser');
const cors = require('cors');

const app = express();
const { getData } = spotifyUrlInfo(fetch);

app.use(cors());
app.use(json());

app.post('/fetch', async (req, res) => {
    try {
        const data = await getData(req.body.url);

        const cover = data.images[0].url;
        const colors = (await getColors(cover)).map(it => ({ hex: it.hex() }));

        const tracks = data.tracks.items.reduce(
            (result, it) => ({
                count: result.count + 1,
                duration: result.duration + it.duration_ms,
                items: [...result.items, { index: it.track_number, name: it.name }]
            }),
            {
                count: 0,
                items: [],
                duration: 0,
            }
        );

        tracks.duration = parseInt(tracks.duration / 1000);

        return res.status(200).send({
            artist: data.artists[0].name,
            release: data.release_date,
            name: data.name,
            colors,
            tracks,
            cover,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
});

app.listen(5000, () => console.log('Server listen on :5000'));
