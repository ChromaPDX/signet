import { decode as cbor } from "cbor";
import { stringify } from "typed-json-transform/esm";

export { cbor }

export const json = (o) => stringify(o);
