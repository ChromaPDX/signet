const BigInteger = require('bigi');
// const schnorr = require('bip-schnorr');

import { getCurveByName } from 'ecurve';
const ecparams = getCurveByName('secp256k1');


export const extractPubkey = (privateKey: Buffer | BigInteger, compressed = true) => {
    let bigi: BigInteger;
    if (Buffer.isBuffer(privateKey)) {
        bigi = BigInteger.fromBuffer(privateKey);
    } else {
        bigi = privateKey
    }
    const curvePt = ecparams.G.multiply(bigi);
    return curvePt.getEncoded(compressed).toString('hex');
}

