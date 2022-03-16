import { sha3_256 } from 'js-sha3';
import { createHash } from 'crypto';
// import stringifyPackage = require('json-stable-stringify');

// export const stringify = (d: any) => stringifyPackage(d);

export const hashData = (data: any) => {
    return sha3_256(JSON.stringify(data));
}

export const sha256 = (data) => {
    return createHash('sha256').update(data).digest();
}