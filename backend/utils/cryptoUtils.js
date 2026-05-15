const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
// .env ENCRYPTION_KEY should 32 chars
const key = Buffer.from(process.env.ENCRYPTION_KEY || 'mehera_intl_secret_key_32chars!!' ).slice(0, 32);
const iv = Buffer.from(process.env.ENCRYPTION_KEY || 'mehera_intl_secret_key_16chars!!' ).slice(0, 16);

const encrypt = (text) => {
    if (!text) return text;
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text) return text;
    try {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        console.error("Decryption Error:", err.message); 
        return text; 
    }
};

module.exports = { encrypt, decrypt };