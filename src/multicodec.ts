import * as assert from 'assert';
import { VarInt, join as joinVarInts } from "./varint";
import * as cbor from 'cbor';

export const encode = (...codecs: MultiCodec[]) => {
    return Buffer.concat(codecs.map(c => c.encode()));
}

export class MultiCodec {
    version: VarInt;
    data: Buffer;
    // container type
    blob: MultiCodec
    index: number;
    list: MultiCodec[];
    pointer: boolean;
    length: number;

    constructor(data: Buffer) {
        try {
            this.version = new VarInt(data);
            this.length = this.version.bytes.length;
            data = data.slice(this.version.bytes.length);
        } catch (e) {
            throw new Error('failed to parse MultiCodec version ' + data);
        }
        switch (this.version.value) {
            case 0x1b:
            case 0x3c:
            case 0xbb:
                this.length += 32;
                break;
            case 0x3a: { // blob
                let blobLength: VarInt;
                try {
                    blobLength = new VarInt(data);
                    this.length += blobLength.bytes.length;
                    data = data.slice(blobLength.bytes.length);
                } catch (e) {
                    throw new Error('failed decoding blobLength ' + data)
                }
                const blobData = data.slice(0, blobLength.value)
                this.blob = new MultiCodec(blobData);
                assert(this.blob.length == blobLength.value, `${this.blob.length} != ${blobLength.value}`);
                data = data.slice(blobLength.value);
                this.length += this.blob.length;
                break;
            }
            case 0x3b: {// index 
                const index = new VarInt(data);
                this.length += index.bytes.length;
                this.index = index.value;
                break;
            }
            case 0x3c: { // pointer
                break;
            }
            case 0x3d: { // tuple
                break;
            }
            case 0x3e: { // list
                const listLength = new VarInt(data);
                this.length += listLength.bytes.length;
                data = data.slice(listLength.bytes.length);
                this.list = [];
                for (let i = 0; i < listLength.value; i++) {
                    const subcodec = new MultiCodec(data);
                    this.length += subcodec.length;
                    data = data.slice(subcodec.length);
                    this.list.push(subcodec);
                }
                break;
            }
            default:
                this.length += data.length;
                break;
        }
        this.data = data;
    }

    decode = (): any => {
        switch (this.version.value) {
            case 0x3a: { // blob
                return this.blob.decode();
            }
            case 0x51: { // cbor
                return cbor.decode(this.data);
            }
            case 0x3d: { // tuple
                const map = new Map();
                map.set(this.list[0].decode(), this.list[1].decode());
                return map;
            }
            case 0x3e: { // list
                return this.list.map((c) => c.decode());
            }
            default: {
                return this.version.value;
            }
        }
    }

    encode = (): Buffer => {
        switch (this.version.value) {
            case 0x3a: { // blob
                const blob = this.blob.encode();
                const length = new VarInt(blob.length);
                return Buffer.concat([this.version.bytes, length.bytes, blob]);
            }
            default: { // version + data
                return Buffer.concat([this.version.bytes, this.data]);
            }
        }
    }
}
