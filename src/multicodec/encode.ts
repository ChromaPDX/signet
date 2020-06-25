import { encode as cbor } from "cbor";
import { stringify } from "typed-json-transform/esm";

export { cbor }

export const json = (o) => Buffer.from(stringify(o), "utf8");
