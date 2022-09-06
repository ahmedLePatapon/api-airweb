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

DB.schema.hasTable('basket').then(function(exists) {
    if (!exists) {
        return DB.schema.createTable('basket', function(table) {
            table.increments('id').primary();
            table.string('user_id', 100);
            table.integer('product_id', 10);
            table.timestamps();
        });
    }
});

const app = express();

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send('API AIRWEB');
});

app.post('/login', async (req, res) => {
    const { body } = req;

    if (!body.email) {
        res.status(200).send({status: 'KO'});
        return;
    }
    let user = await DB('users').where("email", body.email);
    res.status(200).send({status: 'OK', user});
});

app.get('/catalogue', async (req, res) => {
    const products = await DB('products').select();
    res.status(200).json({status: 'OK', products});
});

app.get('/panier', async (req, res) => {
    const panier = await DB('basket').select();
    res.status(200).json({status: 'OK', panier});
});

app.listen(PORT, () => {
    console.log(`API is listening on http://localhost:${PORT}`);
});