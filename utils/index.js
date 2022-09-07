const { Buffer } = require('node:buffer');
const {
    createCipheriv,
    createDecipheriv,
    scryptSync
} = require('node:crypto');

const { variables } = require('../config');

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
    const cipher = createCipheriv(variables.ALGORITHM, key, iv);
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

module.exports = {
    decrypt,
    encrypt,
    verifyPwd
}