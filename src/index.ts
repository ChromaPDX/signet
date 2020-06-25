import * as Layer2 from "./layer2";

export { Layer2 };

import { MultiCodec, auto } from "./multicodec";

import { VarInt } from "./varint";
export { VarInt };

const encode = (obj) => auto(obj).toBuffer();
const decode = (buffer) => MultiCodec.FromBuffer(buffer).toObject();

export { MultiCodec, auto, encode, decode };