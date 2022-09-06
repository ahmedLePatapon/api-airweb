const { Buffer } = require('node:buffer');
const {
    createCipheriv,
    createDecipheriv,
    scryptSync
} = require('node:crypto');
const express = require('express');
const knex = require('knex');
const jwt = require('jsonwebtoken');

const PORT = '8080';

const SALT = 24;
const SECRET_KEY = 'secret_key';
const algorithm = 'aes-192-cbc';

const ACCESS_TOKEN_SECRET = 'secret_Acces_Token';

const key = scryptSync(SECRET_KEY, 'salt', SALT);
const iv = Buffer.alloc(16, 0);

// return decrypted password
function decrypt(passwordCrypted) {
    const decipher = createDecipheriv(algorithm, key, iv);
    const encryptedText = Buffer.from(passwordCrypted, 'hex');
    // Updating encrypted text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}

// return encrypt password
function encrypt(password) {
    const cipher = createCipheriv(algorithm, key, iv);
    let cipherText = cipher.update(password);
    cipherText = Buffer.concat([cipherText, cipher.final()]);
    return cipherText.toString('hex');
}

// compare password & encryptedPassword if password match return 'true' else 'false'
function verifyPwd(password, encryptedPassword) {
    try {
        let decrypted = decrypt(encryptedPassword);
        return decrypted === password; 
    } catch (error) {
        return false;
    }
}

function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

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
        res.status(200).send({status: 'Merci de renseigner le login'});
        return;
    }

    let [user] = await DB('users').where("email", body.email);
    if (!user) {
        res.status(200).send({status: 'login ou mot de passe incorrect'});
        return;
    }

    let veryfiedPwd = verifyPwd(body.password, user.password_hash);
    if (!veryfiedPwd) {
        // isNotAuth
        res.status(200).send({status: 'login ou mot de passe incorrect'});
        return;
    }
    // implementation du JWT
    delete user.password_hash;
    let payload = {
        ...user,
        isAuth: true
    };
    let accessToken = generateAccessToken(payload);
    res.status(200).send({status: 'OK', accessToken});
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