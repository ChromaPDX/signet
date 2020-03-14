
import { assert } from 'chai';
// const BigInteger = require('bigi');
// const schnorr = require('../src/bip-schnorr/src');

import { fixtures } from './curve';
import { getWallet, verify, sign, Signature } from '../src/zilliqa';

describe('Zilliqa', () => {
    it('generates a privateKey of 32 bytes', () => {
        const { key } = getWallet();
        assert.equal(Buffer.from(key, 'hex').length, 32, 'private key is not 32 bytes');
    });

    it('extracts correct compressed public key', () => {
        const { key, pubKey } = getWallet(fixtures.privateKey);
        assert.equal(pubKey, fixtures.publicKey, 'private key is not 32 bytes');
    });

    it('signs and verifies', () => {
        const { message, privateKey, publicKey } = fixtures;
        const sig = sign({ message, key: privateKey, publicKey });
        const verified = verify(sig,
            Buffer.from(message, 'hex'),
            Buffer.from(publicKey, 'hex')
        );
        assert.ok(verified, 'signature did not match');
    });
});

// describe('cross-lib test', () => {
//     it('verify Zilliqa sig with bip-schnorr', () => {
//         const { message, privateKey, publicKey } = fixtures;
//         const sig = sign({ message, key: privateKey, publicKey });
        
//         const zilVerified = verify(sig,
//             Buffer.from(message, 'hex'),
//             Buffer.from(publicKey, 'hex')
//         );
//         const signature = Buffer.from(
//             sig.r.toBuffer().toString('hex') + sig.s.toBuffer().toString('hex'),
//             'hex'
//         );
//         schnorr.verify(Buffer.from(publicKey, 'hex'), Buffer.from(message, 'hex'), signature);
//     });

//     it('verify bip-schnorr signature with Zilliqa', () => {
//         const { privateKey } = fixtures;
//         const publicKey = Buffer.from(fixtures.publicKey, 'hex');
//         const message = Buffer.from(fixtures.message, 'hex')
//         const createdSignature = schnorr.sign(BigInteger.fromHex(privateKey), message);
//         // console.log({ createdSignature });
//         schnorr.verify(publicKey, message, createdSignature);

//         const r = createdSignature.slice(0, 32).toString('hex');
//         const s = createdSignature.slice(32, 64).toString('hex');
//         const sig = new Signature({ r, s });
//         const verified = verify(sig, message, publicKey);
//         assert.ok(verified, 'signature did not match');
//     });
// });