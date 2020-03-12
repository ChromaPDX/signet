import { decode, encode } from 'varint';

export const join = (...varints: VarInt[]) => {
    return varints.map(v => v.toHexString()).join('');
}

export class VarInt {
    bytes: Buffer;
    value: number;

    toHexString = () => this.bytes.toString('hex')

    constructor(source: Buffer | number) {
        if (typeof source == 'number') {
            this.value = source;
            this.bytes = Buffer.from(encode(source));
        } else {
            try {
                this.value = decode(source);
                const length = decode.bytes;
                this.bytes = source.slice(0, length);
            } catch (e) {
                console.error(source, e);
                throw new Error('failed to construct VarInt');
            }
        }
    }
}