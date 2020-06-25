import { Signature, getPubKeyFromPrivateKey, getAddressFromPublicKey, compressPublicKey, schnorr } from '@zilliqa-js/crypto';
export { Signature };
export const getPublicKey = (key) => {
    const pub = getPubKeyFromPrivateKey(key);
    return compressPublicKey(pub);
};
export const getWallet = (key) => {
    if (!key)
        key = schnorr.generatePrivateKey();
    const pub = getPubKeyFromPrivateKey(key);
    const wallet = {
        key,
        pubKey: compressPublicKey(pub),
        address: getAddressFromPublicKey(pub)
    };
    return wallet;
};
export const sign = ({ message, key, pubKey }) => {
    if (!pubKey)
        pubKey = getPubKeyFromPrivateKey(key);
    return schnorr.sign(Buffer.from(message, 'hex'), Buffer.from(key, 'hex'), Buffer.from(pubKey, 'hex'));
};
export const verify = (signature, data, publicKey) => {
    return schnorr.verify(data, signature, publicKey);
};
//# sourceMappingURL=zilliqa.js.map