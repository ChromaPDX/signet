import { MultiCodec } from "./muilticodec";

export * from "./muilticodec";
export * from "./table";

export const encode = (...codecs: MultiCodec[]) => {
  return Buffer.concat(codecs.map((c) => c.toBuffer()));
};
