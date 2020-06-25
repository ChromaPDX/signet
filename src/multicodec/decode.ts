import { decode as cbor } from "cbor";
import { stringify } from "typed-json-transform";

export { cbor }

export const json = (o) => stringify(o);
