
import { assert } from 'chai';

import { fixtures } from './curve';
import { getWallet, verify, sign, Signature } from '../src/zilliqa';
const schnorr = require('bip-schnorr');

describe('Zilliqa', () => {
    it('generates a privateKey of 32 bytes', () => {
        const { key } = getWallet();
        assert.equal(Buffer.from(key, 'hex').length, 32, 'private key is not 32 bytes');
    });

    it('extracts correct compressed public key', () => {
        const { key, pubKey } = getWallet(fixtures.privateKey);
        assert.equal(pubKey, fixtures.publicKey, 'private key is not 32 bytes');
    });

    it('verify a bip-schnorr signature', () => {
        const { message, privateKey, publicKey } = fixtures;
        const createdSignature = schnorr.sign(privateKey, message);
        schnorr.verify(publicKey, message, createdSignature);

        const r = Buffer.from(createdSignature, 'hex').slice(0, 32).toString('hex');
        const s = Buffer.from(createdSignature, 'hex').slice(32, 64).toString('hex');
        const sig = new Signature({ r, s });
        const verified = verify(sig, Buffer.from(message, 'hex'), Buffer.from(publicKey, 'hex'));
        assert.ok(verified, 'signature did not match');
    });

    it('produce a signature that can be verified by bip-schnorr', () => {
        const { message, privateKey, publicKey } = fixtures;
        const { r, s } = sign({ message, key: privateKey });
        const signature = Buffer.concat([r.toBuffer(), s.toBuffer()]);
        schnorr.verify(Buffer.from(publicKey, 'hex'), Buffer.from(message, 'hex'), signature);
    });
});