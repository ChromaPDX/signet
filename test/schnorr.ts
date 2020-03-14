const BigInteger = require('bigi');
const schnorr = require('bip-schnorr');
const convert = schnorr.convert;
import { assert } from 'chai';

import { extractPubkey } from '../src/schnorr';

import { fixtures } from './curve';

describe('Schnorr', () => {
    let createdSignature: any;
    const privateKey = BigInteger.fromHex(fixtures.privateKey);
    it('privateKey is 32 bytes', () => {
        const buffer = Buffer.from('B7E151628AED2A6ABF7158809CF4F3C762E7160F38B4DA56A784D9045190CFEF', 'hex');
        assert.equal(buffer.length, 32, 'private key is not 32 bytes');
    });

    const message = Buffer.from(fixtures.message, 'hex');
    const publicKey = Buffer.from(fixtures.publicKey, 'hex');

    it('recover pub key', () => {
        const extracted = extractPubkey(privateKey);
        assert.equal(extracted, fixtures.publicKey, `${extracted} != ${fixtures.publicKey} : not recovered correctly`);
    });

    const signatureToVerify = Buffer.from(fixtures.signature, 'hex');

    it('sign and verify', () => {
        createdSignature = schnorr.sign(privateKey, message);
        assert.ok(createdSignature.equals(signatureToVerify), `${createdSignature} != ${signatureToVerify} : signature does not match fixture`);
        schnorr.verify(publicKey, message, createdSignature);
    });

    it('signature is idempote', () => {
        const duplicateSignature = schnorr.sign(privateKey, message);
        schnorr.verify(publicKey, message, duplicateSignature);
        assert.ok(createdSignature.equals(duplicateSignature), `${duplicateSignature} != ${createdSignature}`)
    });

    const publicKeys = [
        Buffer.from('02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659', 'hex'),
        Buffer.from('03FAC2114C2FBB091527EB7C64ECB11F8021CB45E8E7809D3C0938E4B8C0E5F84B', 'hex'),
        Buffer.from('026D7F1D87AB3BBC8BC01F95D9AECE1E659D6E33C880F8EFA65FACF83E698BBBF7', 'hex'),
    ];
    const messages = [
        Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex'),
        Buffer.from('5E2D58D8B3BCDF1ABADEC7829054F90DDA9805AAB56C77333024B9D0A508B75C', 'hex'),
        Buffer.from('B2F0CD8ECB23C1710903F872C31B0FD37E15224AF457722A87C5E0C7F50FFFB3', 'hex'),
    ];
    const signatures = [
        Buffer.from('2A298DACAE57395A15D0795DDBFD1DCB564DA82B0F269BC70A74F8220429BA1D1E51A22CCEC35599B8F266912281F8365FFC2D035A230434A1A64DC59F7013FD', 'hex'),
        Buffer.from('00DA9B08172A9B6F0466A2DEFD817F2D7AB437E0D253CB5395A963866B3574BE00880371D01766935B92D2AB4CD5C8A2A5837EC57FED7660773A05F0DE142380', 'hex'),
        Buffer.from('68CA1CC46F291A385E7C255562068357F964532300BEADFFB72DD93668C0C1CAC8D26132EB3200B86D66DE9C661A464C6B2293BB9A9F5B966E53CA736C7E504F', 'hex'),
    ];

    it('batch verify', () => {
        schnorr.batchVerify(publicKeys, messages, signatures);
    });

    it('aggregatedSignature', () => {
        // aggregating signatures (naive Schnorr key aggregation, not part of BIP, not safe against rogue-key-attack!)
        const privateKey1 = BigInteger.fromHex('B7E151628AED2A6ABF7158809CF4F3C762E7160F38B4DA56A784D9045190CFEF');
        const privateKey2 = BigInteger.fromHex('C90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B14E5C7');
        const message = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
        const aggregatedSignature = schnorr.naiveKeyAggregation([privateKey1, privateKey2], message);

        // verifying an aggregated signature
        const publicKey1 = Buffer.from('02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659', 'hex');
        const publicKey2 = Buffer.from('03FAC2114C2FBB091527EB7C64ECB11F8021CB45E8E7809D3C0938E4B8C0E5F84B', 'hex');
        const sumOfPublicKeys = convert.pubKeyToPoint(publicKey1).add(convert.pubKeyToPoint(publicKey2));

        schnorr.verify(convert.pointToBuffer(sumOfPublicKeys), message, aggregatedSignature);
    });
});
