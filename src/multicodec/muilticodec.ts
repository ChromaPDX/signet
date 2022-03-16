// import { equal as assertEqual } from "assert";
import { VarInt, join as joinVarInts, shiftVarInt } from "../varint";
import { check, contains, map } from "typed-json-transform";
import * as bs58 from 'bs58';
import * as encode from "./encode";
import * as decode from "./decode";
import { arrayBufferToBuffer } from './util';
import { versions, allMultiHash, nameForVersion, lengthForVersion } from "./table";
import { sha256 } from '../hash';

export const variableVersions = map(versions.serialization, (v, k) => v);

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

  static Cid = (o: any, base?: string) => {
    const mc = MultiCodec.FromObject(o, {
      serializationType: "json",
    })
    // console.log('toCid', mc.version.value, mc.toObject(), 'from', o)
    return mc.toCid(base || 'base64', versions.serialization.json);
  }

  static FromObject = (o: any, auto?: AutoOptions): MultiCodec => {
    if (auto && auto.arrayToList && check(o, Array))
      return MultiCodec.FromArray(o, auto);
    if (o.kind && o.value) {
      return MultiCodec.FromVersion(o.kind, o.value, auto);
    } else if (auto && auto.serializationType) {
      const version = versions.serialization[auto.serializationType];
      return MultiCodec.FromVersion(version, o, auto);
    } else {
      throw new Error(
        "no kind or value for MultiCodec, also didn't opt into default as json or other default"
      );
    }
  };
  static FromArray = (a, auto?: AutoOptions) =>
    MultiCodec.FromVersion(versions.containers.list, a, auto);

  static FromVersion = (version: number, value: any, auto?: AutoOptions): MultiCodec => {
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
        if (this.variable.toBuffer().length != varLength.value) {
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

        const codecLength = allMultiHash[this.version.value];
        if (codecLength) {
          // console.log('version', this.version.value, 'load:', data, 'into', codecLength, 'bytes');
          const lengthHeader = new VarInt(codecLength);
          // console.log('version', this.version.value, 'has length', codecLength, 'aka', lengthHeader.data().toString('hex'));
          this.headers = [lengthHeader];
          this.body = data.slice(0, codecLength);
        } else {
          // const lengthHeader = new VarInt(data.length);
          // this.headers = [lengthHeader];
          // console.log(`codec 0x${this.version.toHexString()} has no specified length, omit header`);
          this.body = data;
        }
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
        // console.log('loadObject: encode json', value, 'to', this.body.length, 'bytes', this.body);
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
      case versions.serialization.json: {
        return decode.json(this.body);
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
          return buf;
          // console.log('mc [', this.version.data().length, this.headers.length, this.body.length, ']');
        }
        // console.log('mc [', this.version.data().length, this.body.length, ']');
        return Buffer.concat([this.version.data(), this.body]);
      }
    }
  };

  toCid = (base: string | number, contentType?: number, version = 0x01) => {
    let b: Buffer;
    if (version === 0) {
      b = this.toBuffer();
    } else {
      const cidVersionHeader = new VarInt(version);
      const multiHashLength = allMultiHash[this.version.value]
      if (multiHashLength) {
        if (!contentType) {
          throw new Error("converting simple hash to CID, please specify a content type that represents the payload (json, cbor, etc)")
        }
        // console.log('create CID for hash type', contentType.toString());
        const vi = new VarInt(contentType);
        b = Buffer.concat([cidVersionHeader.data(), vi.data(), this.toBuffer()])
      } else {
        const contentHeader = this.version;
        const hash = sha256(this.body);
        // console.log('checksum', hash.toString('hex'), this.toObject());
        const multiHash = MultiCodec.FromVersion(versions.multiHash.sha2[256], hash);
        const mcb = multiHash.toBuffer();
        // console.log('create CID for variable type', contentHeader.toString(), 'digest',)
        b = Buffer.concat([cidVersionHeader.data(), contentHeader.data(), mcb])
      }
    }
    switch (base) {
      case 64:
      case 'base64': {
        return 'm' + b.toString('base64')
      }
      case 58:
      case 'base58':
      case 'base58btc': {
        return 'z' + bs58.encode(b);
      }
      default:
        throw new Error("unknown base");
    }
  }
}

export const auto = MultiCodec.Auto;
