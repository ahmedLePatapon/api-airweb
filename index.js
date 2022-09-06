const express = require('express');
const app = express();

const PORT = '8080';

app.get('/', (req, res) => {
    res.status(200).send('API AIRWEB');
});

app.listen(PORT, () => {
    console.log(`API is listening on http://localhost:${PORT}`);
});