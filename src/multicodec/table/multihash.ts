export const versions = {
  identity: 0x0,
  sha1: 0x11,
  sha2: {
    256: 0x12,
    512: 0x13,
  },
  sha3: {
    256: 0x16,
    224: 0x17,
    384: 0x15,
    512: 0x14,
  },
};

export const lengths = {
  identity: 0,
  sha1: 20,
  sha2: {
    256: 32,
    512: 64,
  },
  sha3: {
    224: 28,
    256: 32,
    384: 48,
    512: 64,
  },
};
