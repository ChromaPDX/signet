import * as cbor from 'cbor';
import { assert } from 'chai';

import { decode, encode } from '../src/layer2';
import { VarInt, join } from '../src/varint';
import { MultiCodec } from '../src/multicodec';

const helloWorld = { hello: 'world' }
const helloWorldSignetBuffer = '3a0e51a16568656c6c6f65776f726c64';

describe('Fixtures', () => {
    it('check VarInt', () => {
        const single = new VarInt(0x3a);
        const double = new VarInt(150);
        assert.equal(single.toHexString(), '3a');
        assert.equal(double.toHexString(), '9601');
    });

    it('produces test fixtures', () => {
        const blobWrapper = new VarInt(0x3a);
        const blobProtocol = new VarInt(0x51);
        const blobData = cbor.encode(helloWorld);
        const blobLength = new VarInt(blobProtocol.bytes.length + blobData.length);
        testMessage = Buffer.concat([blobWrapper.bytes, blobLength.bytes, blobProtocol.bytes, blobData]);
        assert.equal(testMessage.toString('hex'), helloWorldSignetBuffer);
    });
});

let testMessage: Buffer;
let layer2: MultiCodec[];

describe('Decode', () => {
    it('can produce MultiCodec objects from buffer', () => {
        layer2 = decode(testMessage);
        assert.ok(layer2[0].blob.data.length);
    });

    it('can produce a JS object from CBOR', () => {
        const js = layer2[0].decode();
        assert.deepEqual(js, helloWorld);
    });
});

describe('Encode', () => {
    it('can encode Multiprotocol objects into signet binary', () => {
        const encoded = encode(...layer2);
        assert(!testMessage.compare(encoded), `\n${testMessage.toString('hex')} !=\n${encoded.toString('hex')}`);
    });
});