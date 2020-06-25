import {
  check,
  okmap,
  keyPaths,
  valueForKeyPath,
  setValueForKeyPath,
  replaceAll,
} from "typed-json-transform";

import { versions, names } from "./table";
import { lengths } from "./multihash";

const searchForKeyOfValue = (object, forKey, ofValue) => {
  for (const k of object) {
    const v = object[k];
    if (k === forKey) {
      if (v === ofValue) return v;
    } else if (check(v, Object)) {
      const isNested = searchForKeyOfValue(v, forKey, ofValue);
      if (isNested) return isNested;
    }
  }
};

const searchForValue = (input, value) => {
  if (check(input, Object)) {
    for (const k of input) {
      const found = searchForValue(input[k], value);
      if (found) {
        return found;
      }
    }
  } else {
    return input === value;
  }
};

export const nameForVersion = (version) => {
  for (const k of keyPaths(versions)) {
    if (valueForKeyPath(k, versions) === version)
      return valueForKeyPath(k, names);
  }
};

export const lengthForVersion = (version) => {
  for (const k of keyPaths(versions)) {
    if (valueForKeyPath(k, versions) === version)
      return valueForKeyPath(k, lengths);
  }
};
