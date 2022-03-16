import { decode as cbor } from "cbor";
import { stringify } from "typed-json-transform";

export { cbor }

export const json = (b) => {
    try {
        return JSON.parse(typeof b === 'string' ? b : b.toString('utf8'));
    } catch (e) {
        console.log('bad json', e, 'in buffer', b)
        return {};
    }
}
