import * as crypto from 'crypto';

export const randomCryptoString = (size: number) => {
  //  each byte is encoded in two characters in hex
  return crypto.randomBytes(size / 2).toString('hex');
};

