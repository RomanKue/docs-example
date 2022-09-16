export const base64 = (s: string) => Buffer.from(s).toString('base64');
export const base64Decode = (s: string) => Buffer.from(s, 'base64').toString();
