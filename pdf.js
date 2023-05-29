require('dotenv').config();

const listenPort = 6256;
const privateKeyPath = `/home/sslkeys/instantchatbot.net.key`;
const fullchainPath = `/home/sslkeys/instantchatbot.net.pem`;

const express = require('express');
const https = require('https');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const jwt = require('./utils/jwt');
const parser = require('./utils/pdf-parse');

const app = express();
app.use(express.static('public'));
app.use(express.json({limit: '500mb'})); 
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const convertPdfToText = async (req, res) => {
    console.log('convertPdfToText', req.query);
    const { t } = req.query;

    if (!t) return res.status(400).json('bad request 1');

    const token = jwt.getToken(t);

    if (token === false) res.status(400).json('bad request 2');

    console.log('convertPdfToText token', token);

    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, data) {
        //console.log('form data', data);
        if (err) {
            console.error(err);
            return res.status(500).json('form error');
            
        }
        const fileName = data['File[]'].filepath;
        const origName = data['File[]'].originalFilename;
        // let input = fs.readFileSync(fileName, "utf-8");
        // if (!input) {
        //     return res.status(400).json('no input')
        // }

        const text = await parser.extractPdf(fileName);

        console.log('text', text);
        // remove file
        fs.unlinkSync(fileName);

        return res.status(200).json('ok');
       
    });


}

app.post('/convertPdfToText', (req, res) => convertPdfToText(req, res));
const httpsServer = https.createServer({
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(fullchainPath),
  }, app);
  

  httpsServer.listen(listenPort, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${listenPort}`);
});
