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

    // 💡 FIX: Check if the text is a valid hex string and has a plausible length for encrypted data.
    // An unencrypted 10-digit phone number will fail this check and be returned directly.
    // A valid AES-256-CBC encrypted string will be a hex string of at least 32 characters.
    const isLikelyEncrypted = /^[0-9a-fA-F]+$/.test(text) && text.length >= 32;

    if (!isLikelyEncrypted) {
        return text; // 🛡️ It's likely plain text, return it as is without trying to decrypt.
    }

    try {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        console.warn("Decryption failed for a seemingly encrypted string, returning original hex:", text, "| Error:", err.message); 
        return text; // If decryption still fails, return the original hex string to prevent crashes.
    }
};

module.exports = { encrypt, decrypt };