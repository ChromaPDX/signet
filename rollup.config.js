// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: {
    dir: ".",
    name: "index.js",
    format: "umd",
  },
  plugins: [
    resolve(),
    json(),
    commonjs({
      include: [
        "node_modules/typed-json-transform/index.js",
        // "node_modules/cbor/lib/cbor.js",
        "node_modules/varint/index.js",
        "node_modules/js-sha3/src/sha3.js",
      ],
      // exclude: ["node_modules/cbor/lib/cbor.js"],
      transformMixedEsModules: true,
      // dynamicRequireTargets: ["node_modules/cbor/lib/cbor.js"],
    }),
    typescript(),
    // babel(),
  ],
};
