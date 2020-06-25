/// <reference types="node" />
import { Signature } from '@zilliqa-js/crypto';
export { Signature };
export declare const getPublicKey: (key?: string) => string;
export declare const getWallet: (key?: string) => {
    key: string;
    pubKey: string;
    address: string;
};
export declare const sign: ({ message, key, pubKey }: {
    [x: string]: string;
}) => Signature;
export declare const verify: (signature: Signature, data: Buffer, publicKey: Buffer) => boolean;
//# sourceMappingURL=zilliqa.d.ts.map