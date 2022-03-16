import { encode as cbor } from "cbor";
import { encode as encodeDagPb, prepare as prepareDagPb } from '@ipld/dag-pb'
import { stringify } from "typed-json-transform";

export { cbor }
export const dagPb = (d) => {
    return encodeDagPb(prepareDagPb(d));
}
export const json = (o) => Buffer.from(stringify(o), "utf8");

