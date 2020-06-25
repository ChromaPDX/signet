// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
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
        "node_modules/bn.js/lib/bn.js",
        "node_modules/long/src/long.js",
        "node_modules/hash.js/lib/hash.js",
        "node_modules/hmac-drbg/lib/hmac-drbg.js",
        "node_modules/scryptsy/lib/index.js",
        "node_modules/pbkdf2/index.js",
        "node_modules/aes-js/index.js",
        "node_modules/uuid/index.js",
      ],
    }),
    typescript(),
  ],
};
