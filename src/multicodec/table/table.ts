import { clone, keyPaths, setValueForKeyPath, replaceAll } from "typed-json-transform";
import { versions as multiHash, allVersions as allMultiHash } from "./multihash";
import { serialization } from "./serialization";
import { containers } from "./signet";

export const versions = {
  multiHash,
  serialization,
  containers,
};

export { allMultiHash }
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
