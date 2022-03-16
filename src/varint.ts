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

  static decode = (source) => {
    const value = decode(source);
    const length = decode.bytes;
    const bytes = source.slice(0, length);
    return { value, length, bytes };
  };

  static encode = (value) => {
    const byteArray = encode(value);
    return Buffer.from(byteArray);
  };

  toHexString = () => this.bytes.toString("hex");
  toString = () => '0x' + this.value.toString(16);
  length = () => this.bytes.length;
  data = () => this.bytes;

  constructor(source: Buffer | number) {
    if (typeof source == "number") {
      this.value = source;
      this.bytes = VarInt.encode(this.value)
    } else {
      try {
        const { value, bytes } = VarInt.decode(source);
        this.value = value;
        this.bytes = bytes;
      } catch (e) {
        console.error(source, e);
        throw new Error("failed to construct VarInt");
      }
    }
  }
}
