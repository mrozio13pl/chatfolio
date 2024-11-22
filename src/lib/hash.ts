import crypto from 'node:crypto';

const algorithm = 'aes-256-ctr';

function genKey() {
    return crypto
        .createHash('sha256')
        .update(process.env.SECRET!)
        .digest('base64')
        .slice(0, 32);
}

export function encrypt(text: string): string {
    const key = genKey();
    const iv = crypto.createHash('md5').update(key).digest();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, genKey(), iv);
    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
