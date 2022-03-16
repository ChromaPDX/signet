import { CID, MultihashDigest, MultibaseEncoder } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import { base64 } from "multiformats/bases/base64";
import { base58btc } from "multiformats/bases/base58";
import * as cbor from '@ipld/dag-cbor';
import * as dagPB from '@ipld/dag-pb';
import * as crypto from "crypto";
import { stringify } from 'typed-json-transform';
import { assert } from 'chai';

import { auto, MultiCodec, versions } from '../esm';

describe("Cid", () => {
    it("compares to multiformats/cid v1", () => {
        const expect = 'mAYAEEiAz7bPWn7XU6UGdxLG41D/UVj4e3gZiCrnpYOWZLTsFSA';
        // Method A use CID library
        const fixture = { hello: 'world' };
        const fixtureBuffer = Buffer.from(stringify(fixture), 'utf8');
        const multihashDigest = sha256.digest(fixtureBuffer);
        const cid = CID.create(1, json.code, multihashDigest).toString(base64.encoder);
        // console.log("expect lock", cid)
        // Method B use MultiCodec lib from Signet
        var hash = crypto.createHash("sha256").update(fixtureBuffer).digest();
        // console.log(fixture, 'shasum=', hash.toString('hex'))
        const mc = MultiCodec.FromVersion(versions.multiHash.sha2['256'], hash);
        const mcCid = mc.toCid(1, versions.serialization.json, 'base64');
        const inline = MultiCodec.Cid({ hello: 'world' }, { serializationType: 'json', base: 'base64', version: 1 });
        // const inline = auto(fixture, { serializationType: 'json' }).toCid('base64');
        assert.equal(inline, mcCid, 'inline Multicodec not same as constructed ' + inline)

        // Compare
        const mhsha = Buffer.from(multihashDigest.digest);
        const shaDiff = mc.body.compare(mhsha);
        assert.equal(shaDiff, 0, 'shaDiff ' + mhsha + '!=' + mc.body);
        // console.log("shaDiff passed", mhsha.length, mc.body.length);

        const mcb = mc.toBuffer();
        const mhb = Buffer.from(multihashDigest.bytes);
        const cidDiff = mcb.compare(mhb);
        assert.equal(cidDiff, 0, 'cidDiff ' + mhb.toString('hex') + ' != ' + mcb.toString('hex'));
        assert.equal(cid, expect, 'calculated cid: ' + cid + ' != expected cid:' + expect);
        // console.log("MultiCodec sha", mcb.length, mcb.toString('hex'));
        // console.log("multiHash sha", mhb.length, mhb.toString('hex'));
        // console.log("CID Tests Passed!!");
    })

    it("compares to multiformats/cid v0", () => {
        // Method A use CID library
        const fixture = { hello: 'world' };
        const fixtureBuffer = Buffer.from(dagPB.encode(dagPB.prepare(fixture)));
        const multihashDigest = sha256.digest(fixtureBuffer);
        const cid = CID.create(0, dagPB.code, multihashDigest).toString(base58btc.encoder)

        // Method B use MultiCodec lib from Signet
        var hash = crypto.createHash("sha256").update(fixtureBuffer).digest();
        const mc = MultiCodec.FromVersion(versions.multiHash.sha2['256'], hash);
        const mcCid = mc.toCid(0);
        assert.equal(mcCid, cid, 'cidV0 ' + mcCid + ' != ' + cid);

        const inline = MultiCodec.Cid(fixture, { version: 0 });
        // const inline = auto(fixture, { serializationType: 'json' }).toCid('base64');
        assert.equal(inline, mcCid, 'inline Multicodec not same as constructed ' + inline + ' != ' + mcCid)
    })
});
