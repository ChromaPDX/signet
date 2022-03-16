import * as Layer2 from "./layer2";

export { Layer2 };

import { MultiCodec, auto, versions } from "./multicodec";

import { VarInt } from "./varint";
export { VarInt };

const encode = (obj) => auto(obj).toBuffer();
const decode = (buffer) => MultiCodec.FromBuffer(buffer).toObject();

export { MultiCodec, auto, encode, decode, versions };

import { sign, getWallet, getPublicKey } from './zilliqa';
export { sign, getWallet, getPublicKey }