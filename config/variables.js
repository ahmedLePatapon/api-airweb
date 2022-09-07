require('dotenv').config();

const PORT = process.env.PORT || 5000;
const CLIENT_DB = process.env.CLIENT_DB || 'sqlite3';
const FILE_NAME_DB = process.env.FILE_NAME_DB || "./DATABASE.sqlite";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret_Acces_Token';
const TTL_SESSION = process.env.TTL_SESSION * 1 || 60000 ;
const SALT = process.env.SALT * 1 || 24;
const EXPIREIN = process.env.EXPIREIN || '5m';
const SECRET_KEY = process.env.SECRET_KEY || 'cle_secrete';
const ALGORITHM = process.env.ALGORITHM || 'aes-192-cbc';

module.exports = {
    PORT,
    ACCESS_TOKEN_SECRET,
    CLIENT_DB,
    FILE_NAME_DB,
    TTL_SESSION,
    SALT,
    SECRET_KEY,
    EXPIREIN,
    ALGORITHM
};