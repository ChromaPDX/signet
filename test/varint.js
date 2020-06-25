import { assert } from "chai";
var varint = require('varint')

describe("Varint", () => {
    it("check encode decode", () => {
        var bytes = varint.encode(300) // === [0xAC, 0x02]
        varint.decode(bytes) // 300
        varint.decode.bytes // 2 (the last decode() call required 2 bytes)
        assert.equal(varint.decode.bytes, 2);
    });
});  