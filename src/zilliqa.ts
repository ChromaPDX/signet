import {
    getPubKeyFromPrivateKey,
    getAddressFromPublicKey,
    compressPublicKey,
    Signature,
    schnorr
} from '@zilliqa-js/crypto';

export { Signature };

export const getWallet = (key?: string) => {
    if (!key) key = schnorr.generatePrivateKey()
    const pub = getPubKeyFromPrivateKey(key);
    const wallet = {
        key,
        pubKey: compressPublicKey(pub),
        address: getAddressFromPublicKey(pub)
    };
    return wallet;
}

export const sign = ({ message, key, pubKey }: { [x: string]: string }) => {
    if (!pubKey) pubKey = getPubKeyFromPrivateKey(key);
    return schnorr.sign(
        Buffer.from(message, 'hex'),
        Buffer.from(key, 'hex'),
        Buffer.from(pubKey, 'hex')
    )
}

export const verify = (
    signature: Signature,
    data: Buffer,
    publicKey: Buffer
) => {
    return schnorr.verify(data, signature, publicKey)
}