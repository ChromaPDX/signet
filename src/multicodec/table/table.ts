import { clone, keyPaths, setValueForKeyPath, replaceAll } from "typed-json-transform/esm";
import { versions as multiHash } from "./multihash";
import { serialization } from "./serialization";
import { containers } from "./signet";

export const versions = {
  multiHash,
  serialization,
  containers,
};

const writePathToVal = (o) => {
  keyPaths(o).forEach((kp) => {
    setValueForKeyPath(replaceAll(kp, ".", "-"), kp, o);
  });
  return o;
};

export const names = clone({
  multiHash,
  serialization,
  containers,
});

writePathToVal(names.multiHash);
writePathToVal(names.serialization);
writePathToVal(names.containers);
