import * as cbor from "cbor";
import { assert } from "chai";
import { decode, encode } from "../src/layer2";
import { VarInt, join } from "../src/varint";
import { MultiCodec, versions } from "../src/multicodec";
import { testFixture as helloSignetFixture, HelloSignet } from "./helloCode";

const helloWorld = { hello: "world" };
const helloWorldSignetBuffer = "3a0e51a16568656c6c6f65776f726c64";
const helloContainers = [{ message: "hello" }, { message: "world" }];
const helloContainersBuffer =
  "3e023a1051a1676d6573736167656568656c6c6f3a1051a1676d65737361676565776f726c64";

describe("Fixtures", () => {
  it("use VarInt", () => {
    const single = new VarInt(0x23);
    assert.equal(single.toHexString(), "23");
    assert.equal(single.length(), 1);
    const double = new VarInt(0xe7);
    assert.equal(double.toHexString(), "e701");
    assert.equal(double.length(), 2);
    const joined = join(single, double);
    assert.equal(joined, "23e701");
  });

  it("check container versions", () => {
    assert.equal(versions.containers.variable, 0x3a);
    assert.equal(versions.containers.list, 0x3e);
  });

  it("check serialization versions", () => {
    assert.equal(versions.serialization.cbor, 0x51);
  });

  it("construct manually", () => {
    const blobWrapper = new VarInt(versions.containers.variable);
    const blobProtocol = new VarInt(versions.serialization.cbor);
    const blobData = cbor.encode(helloWorld);
    const blobLength = new VarInt(blobProtocol.length() + blobData.length);
    const testMessage = Buffer.concat([
      blobWrapper.data(),
      blobLength.data(),
      blobProtocol.data(),
      blobData,
    ]);
    assert.equal(testMessage.toString("hex"), helloWorldSignetBuffer);
  });

  it("construct using dictionary", () => {
    const test = MultiCodec.FromObject({
      kind: versions.containers.variable,
      value: {
        kind: versions.serialization.cbor,
        value: helloWorld,
      },
    });
    assert.deepEqual(test.toObject(), helloWorld);
    assert.equal(test.toBuffer().toString("hex"), helloWorldSignetBuffer);
  });

  it("construct using shortHand", () => {
    // Object
    const test = MultiCodec.Auto(helloWorld);
    assert.deepEqual(test.toObject(), helloWorld);
    assert.equal(test.toBuffer().toString("hex"), helloWorldSignetBuffer);
  });

  it("construct array manually", () => {
    const listWrapper = new VarInt(versions.containers.list);
    const listLength = new VarInt(2);
    const items = helloContainers.map((c) => {
      const wrapper = new VarInt(versions.containers.variable);
      const protocol = new VarInt(versions.serialization.cbor);
      const data = cbor.encode(c);
      const length = new VarInt(protocol.length() + data.length);
      return Buffer.concat([
        wrapper.data(),
        length.data(),
        protocol.data(),
        data,
      ]);
    });
    const message = Buffer.concat([
      listWrapper.data(),
      listLength.data(),
      ...items,
    ]);
    assert.equal(message.toString("hex"), helloContainersBuffer);
  });

  it("construct array using shortHand", () => {
    // Array
    const test = MultiCodec.Auto(helloContainers);
    assert.deepEqual(test.toObject(), helloContainers);
    assert.equal(test.toBuffer().toString("hex"), helloContainersBuffer);
  });
});

describe("Decode", () => {
  let testMessage = Buffer.from(helloWorldSignetBuffer, "hex");
  const layer2 = decode(testMessage);

  it("can produce MultiCodec objects from buffer", () => {
    assert.ok(layer2[0].variable.length());
  });

  it("can produce a JS object from CBOR", () => {
    const js = layer2[0].toObject();
    assert.deepEqual(js, helloWorld);
  });

  it("encode Proto", () => {
    const { js, buffer } = helloSignetFixture();
    assert.deepEqual(
      new Buffer(HelloSignet.encode(js).finish()).toString("hex"),
      buffer
    );
  });

  it("decode Proto", () => {
    const { js, buffer } = helloSignetFixture();
    const decoded = HelloSignet.decode(Buffer.from(buffer, "hex")).toJSON();
    assert.deepEqual(decoded, js);
  });
});

describe("Encode", () => {
  let testMessage = Buffer.from(helloWorldSignetBuffer, "hex");
  const layer2 = decode(testMessage);

  it("can encode Multiprotocol objects into signet binary", () => {
    const encoded = encode(...layer2);
    assert(
      !testMessage.compare(encoded),
      `\n${testMessage.toString("hex")} !=\n${encoded.toString("hex")}`
    );
  });
});
