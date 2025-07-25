import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { createSigner, createVerifier } from 'fast-jwt';

const privateKey = fs.readFileSync(path.resolve(config.jwtPrivateKeyPath));
const publicKey = fs.readFileSync(path.resolve(config.jwtPublicKeyPath));

export const signJwt = createSigner({
  algorithm: 'RS256',
  key: privateKey,
});

export const verifyJwt = createVerifier({ key: publicKey, algorithms: ['RS256'] });
