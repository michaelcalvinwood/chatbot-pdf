require('dotenv').config();

const listenPort = 6256;
const privateKeyPath = `/home/sslkeys/instantchatbot.net.key`;
const fullchainPath = `/home/sslkeys/instantchatbot.net.pem`;

const express = require('express');
const https = require('https');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const jwt = require('./utils/jwt');

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

    res.status(200).json('ok');
}

app.post('/convertPdfToText', (req, res) => convertPdfToText(req, res));
const httpsServer = https.createServer({
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(fullchainPath),
  }, app);
  

  httpsServer.listen(listenPort, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${listenPort}`);
});
