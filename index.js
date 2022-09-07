const { Buffer } = require('node:buffer');
const {
    createCipheriv,
    createDecipheriv,
    scryptSync
} = require('node:crypto');
const express = require('express');
const knex = require('knex');

const jwt = require('./middleware/jwt');
const { variables } = require('./config');

const key = scryptSync(variables.SECRET_KEY, 'salt', variables.SALT);
const iv = Buffer.alloc(16, 0);

// return decrypted password
function decrypt(passwordCrypted) {
    const decipher = createDecipheriv(variables.ALGORITHM, key, iv);
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
            table.integer('quantity', 100);
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
        authenticated: true
    };
    let accessToken = jwt.generateAccessToken(payload);
    res.status(200).send({status: 'OK', accessToken: `Bearer ${accessToken}`});
});

app.get('/catalogue', jwt.checkAuthentication, async (req, res) => {
    let query = {
        visible_public: 1,
        visible_authenticated: 0
    };
    if (req.user.authenticated) {
        query = {
            visible_public: 0,
            visible_authenticated: 1
        };
    }
    const products = await DB('products').where(query);
    res.status(200).json({status: 'OK', products});
});

app.get('/panier', jwt.checkAuthentication, async (req, res) => {
    const { user } = req;
    if (user) {
        res.status(200).json({status: 'KO', panier: []});
        return;
    }
    const panier = await DB('basket').where('user_id', user.id);
    res.status(200).json({status: 'OK', panier});
});

app.put('/panier', jwt.checkAuthentication, async (req, res) => {
    const { body, user } = req;
    if (user && user.authenticated) {
        let [inTable] = await DB('basket').where({
            user_id: user.id,
            product_id: body.productId,
        });
        if (inTable) {
            await DB('basket').update({
                user_id: user.id,
                product_id: body.productId,
                quantity: body.quantity
            });
        } else {
            await DB('basket').insert({
                user_id: user.id,
                product_id: body.productId,
                quantity: body.quantity || 1
            });
        }
    }
    const panier = await DB('basket').select();
    res.status(200).json({status: 'OK', panier});
});

app.patch('/panier', jwt.checkAuthentication, async (req, res) => {
    const { body, user } = req;
    
    if (user && user.authenticated) {
        await DB('basket').insert({
            user_id: user.id,
            product_id: body.productId,
            quantity: body.quantity || 1
        });
    }
    const panier = await DB('basket').select();
    res.status(200).json({status: 'OK', panier});
});

app.listen(variables.PORT, () => {
    console.log(`API is listening on http://localhost:${variables.PORT}`);
});