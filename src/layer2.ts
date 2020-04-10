import { sha3_256 } from "js-sha3";
import { MultiCodec, encode, shiftMultiCodec } from "./multicodec";

export const hash = (content: Buffer) => {
  return "1b" + sha3_256(content);
};

export const verify = (buffer: Buffer) => {
  const codecs = decode(buffer);
  for (const c of codecs) {
    console.log(c);
  }
};

export const decode = (buffer: Buffer) => {
  const codecs: MultiCodec[] = [];
  for (let i = 0; i < buffer.length; i++) {
    const res = shiftMultiCodec(buffer);
    codecs.push(res.multiCodec);
    buffer = res.data;
    if (!res.data.length) return codecs;
  }
  throw new Error(
    `${
      codecs.length
    } codecs parsed, hit end of buffer with unterminated codec or bytes: ${buffer.toString(
      "hex"
    )}`
  );
};

export { encode };
