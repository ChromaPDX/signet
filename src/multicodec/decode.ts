import { decode as cbor } from "cbor";
import { stringify } from "typed-json-transform";
import * as dagPB from '@ipld/dag-pb'

export { cbor }

export const dagPb = (b) => {
    const decoded = dagPB.decode(b)
    return decoded;
}

export const json = (b) => {
    try {
        return JSON.parse(typeof b === 'string' ? b : b.toString('utf8'));
    } catch (e) {
        console.log('bad json', e, 'in buffer', b)
        return {};
    }
}
