import * as crypto from 'crypto';
import config from 'src/config';

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', config.encKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return Buffer.from(
    JSON.stringify({
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    }),
    'utf8',
  );
};

export const decrypt = (hashString: Buffer) => {
  const hash = JSON.parse(hashString.toString('utf8'));

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    config.encKey,
    Buffer.from(hash.iv, 'hex'),
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
  ]);

  return decrypted.toString();
};

export function excludeField<T, Key extends keyof T>(
  obj: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete obj[key];
  }

  return obj;
}
