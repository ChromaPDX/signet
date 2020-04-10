import { decode, encode } from "varint";

export const join = (...varints: VarInt[]) => {
  return varints.map((v) => v.toHexString()).join("");
};

export const shiftVarInt = (data: Buffer): { data: Buffer; varInt: VarInt } => {
  const varInt = new VarInt(data);
  data = data.slice(varInt.length());
  return { data, varInt };
};

export class VarInt {
  private bytes: Buffer;
  value: number;

  toHexString = () => this.bytes.toString("hex");

  length = () => this.bytes.length;
  data = () => this.bytes;

  constructor(source: Buffer | number) {
    if (typeof source == "number") {
      this.value = source;
      this.bytes = Buffer.from(encode(source));
    } else {
      try {
        this.value = decode(source);
        const length = decode.bytes;
        this.bytes = source.slice(0, length);
      } catch (e) {
        console.error(source, e);
        throw new Error("failed to construct VarInt");
      }
    }
  }
}
