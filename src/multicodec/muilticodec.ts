// import { equal as assertEqual } from "assert";
import { VarInt, join as joinVarInts, shiftVarInt } from "../varint";
import { check, contains, map, stringify, isEqual } from "typed-json-transform";
import * as encode from "./encode";
import * as decode from "./decode";
import { arrayBufferToBuffer } from './util';
import { versions, nameForVersion, lengthForVersion } from "./table";

export const variableVersions = map(versions.serialization, (v, k) => v);
export const implicitLengthVersions = map(versions.multiHash, (v, k) => v);

interface AutoOptions {
  arrayToList?: boolean;
  serializationType?: string;
  wrapVariables?: boolean;
}

const autoDefaults = {
  arrayToList: true,
  wrapVariables: true,
  serializationType: "cbor",
};

export const shiftMultiCodec = (
  data: Buffer
): { data: Buffer; multiCodec: MultiCodec } => {
  const multiCodec = MultiCodec.FromBuffer(data);
  data = data.slice(multiCodec.length());
  return { data, multiCodec };
};

export class MultiCodec {
  // private _data: Buffer;
  // private _length: number;
  version: VarInt;
  headers: VarInt[];
  body: Buffer;

  // codec data
  variable: MultiCodec;
  list: MultiCodec[];
  pointer: MultiCodec | VarInt;

  static FromBuffer = (data: Buffer | ArrayBuffer) => new MultiCodec().loadBuffer(data);

  static Auto = (o: any, options?: AutoOptions) =>
    MultiCodec.FromObject(o, options || autoDefaults);

  static FromObject = (o: any, auto?: AutoOptions): MultiCodec => {
    if (auto && auto.arrayToList && check(o, Array))
      return MultiCodec.FromArray(o, auto);
    if (o.kind && o.value) {
      return MultiCodec.FromVersion(o.kind, o.value, auto);
    } else if (auto && auto.serializationType) {
      const kind = versions.serialization[auto.serializationType];
      return MultiCodec.FromVersion(kind, o, auto);
    } else {
      throw new Error(
        "no kind or value for MultiCodec, also didn't opt into default as json or other default"
      );
    }
  };
  static FromArray = (a, auto?: AutoOptions) =>
    MultiCodec.FromVersion(versions.containers.list, a, auto);

  static FromVersion = (version: number, value: any, auto?: AutoOptions) => {
    if (auto?.wrapVariables && contains(variableVersions, version)) {
      return MultiCodec.FromVersion(
        versions.containers.variable,
        { kind: version, value },
        {
          ...auto,
          wrapVariables: false,
        }
      );
    }
    const codec = new MultiCodec();
    codec.version = new VarInt(version);
    if ((value instanceof ArrayBuffer) || Buffer.isBuffer(value)) {
      // console.log('load buffer for version', codec.version);
      codec.loadData(value);
    } else {
      // console.log('load object for version', codec.version);
      codec.loadObject(value, auto);
    }
    return codec;
  };

  loadBuffer = (buffer: Buffer | ArrayBuffer) => {
    let data: Buffer;
    if (buffer instanceof ArrayBuffer) {
      data = arrayBufferToBuffer(buffer);
    } else {
      data = buffer;
    }
    try {
      this.version = new VarInt(data);
      data = data.slice(this.version.length());
    } catch (e) {
      throw new Error("failed to parse MultiCodec version " + data);
    }
    this.loadData(data);
    return this;
  };

  loadData = (buffer: Buffer | ArrayBuffer) => {
    let data: Buffer;
    if (buffer instanceof ArrayBuffer) {
      data = arrayBufferToBuffer(buffer);
    } else {
      data = buffer;
    }
    switch (this.version.value) {
      case versions.containers.variable: {
        let varLength: VarInt;
        try {
          const res = shiftVarInt(data);
          varLength = res.varInt;
          data = res.data;
          this.headers = [varLength];
        } catch (e) {
          throw new Error("failed decoding blobLength " + data);
        }
        const varData = data.slice(0, varLength.value);
        this.variable = MultiCodec.FromBuffer(varData);
        if (this.variable.toBuffer().length !=
          varLength.value) {
          throw new Error(`${this.variable.length} != ${varLength.value}`);
        }
        data = data.slice(varLength.value);
        break;
      }
      case versions.containers.index: {
        const res = shiftVarInt(data);
        data = res.data;
        this.body = res.varInt.data();
        break;
      }
      case versions.containers.list: {
        const res = shiftVarInt(data);
        const listLength = res.varInt;
        data = res.data;
        this.headers = [listLength];
        this.list = [];
        for (let i = 0; i < listLength.value; i++) {
          const res = shiftMultiCodec(data);
          data = res.data;
          this.list.push(res.multiCodec);
        }
        break;
      }
      default: {
        const useCodecLength = contains(
          implicitLengthVersions,
          this.version.value
        );
        if (useCodecLength) {
          this.body = data.slice(0, lengthForVersion(this.version.value));
        }
        this.body = data;
        // console.log('signet data length', this.body.length)
        break;
      }
    }
    return data;
  };

  loadObject = (value, auto): any => {
    switch (this.version.value) {
      // serialization
      case versions.serialization.json: {
        this.body = encode.json(value);
        break;
      }
      case versions.serialization.cbor: {
        this.body = encode.cbor(value);
        break;
      }
      case versions.containers.list: {
        const list = value.map((o) => MultiCodec.FromObject(o, auto));
        this.headers = [new VarInt(list.length)];
        this.list = list;
        break;
      }
      case versions.containers.variable: {
        const variable = MultiCodec.FromObject(value, auto);
        this.headers = [new VarInt(variable.length())];
        this.variable = variable;
        break;
      }
      default: {
        throw new Error(
          `load object not handled for ${nameForVersion(this.version.value)}`
        );
      }
    }
  };

  toObject = (): any => {
    switch (this.version.value) {
      case versions.containers.variable: {
        return this.variable.toObject();
      }
      case versions.serialization.cbor: {
        return decode.cbor(this.body);
      }
      case versions.containers.tuple: {
        const map = new Map();
        map.set(this.list[0].toObject(), this.list[1].toObject());
        return map;
      }
      case versions.containers.list: {
        return this.list.map((c) => c.toObject());
      }
      default: {
        return this.version.value;
      }
    }
  };

  length = (): number => {
    // optimize this later
    return this.toBuffer().length;
  };

  toBuffer = (): Buffer => {
    switch (this.version.value) {
      case versions.containers.variable: {
        return Buffer.concat([
          this.version.data(),
          ...this.headers.map((h) => h.data()),
          this.variable.toBuffer(),
        ]);
      }
      case versions.containers.list: {
        return Buffer.concat([
          this.version.data(),
          ...this.headers.map((h) => h.data()),
          ...this.list.map((mc) => mc.toBuffer()),
        ]);
      }
      default: {
        if (this.headers && this.headers.length) {
          const buf = Buffer.concat([
            this.version.data(),
            ...this.headers.map((h) => h.data()),
            this.body,
          ]);
          // console.log('mc [', this.version.data().length, this.headers.length, this.body.length, ']');
        }
        // console.log('mc [', this.version.data().length, this.body.length, ']');
        return Buffer.concat([this.version.data(), this.body]);
      }
    }
  };
}

export const auto = MultiCodec.Auto;
