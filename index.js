const express = require('express');
const knex = require('knex');

const PORT = '8080';

const DB = knex({
    client: 'sqlite3',
    connection: {
      filename: "./DATABASE.sqlite"
    },
    useNullAsDefault: true
});

const app = express();

app.get('/', async (req, res) => {
    res.status(200).send('API AIRWEB');
});

app.get('/catalogue', async (req, res) => {
    const products = await DB('products').select();
    res.status(200).json({status: 'OK', products});
});

app.listen(PORT, () => {
    console.log(`API is listening on http://localhost:${PORT}`);
});