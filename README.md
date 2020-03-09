# Signet

Signet is a protocol to convey secure, authoritive symbols across somewhat-trusted boundaries.

# Layer 0

* a *signet* is physical mark, most often represented with Chroma's pinwheel.
* a *signet* can also be distributed as a QR, Aztec, Jabcode, Databar, or other data carrying mark. This typically mandates a smaller footprint, inclusive of the payload and signatures.
* Being stored or transmitted digitally, a signet may be represented as binary, or as a [multibase](https://github.com/multiformats/multibase/blob/master/multibase.csv) string.
 
# Layer 1

Once resolved to as binary, the data is further decoded using the [multicodec](https://github.com/multiformats/multicodec/blob/master/table.csv) table of data types.

In addition to simple data types, Signet protocol enhances the multicodec table with structure types. This enables a basic graph of multicodecs to be formed inline or across the content-space.

### Signet descriptor types allow for encoding of multiple multicodecs in a single byte stream
| version | name | data | details |
| ------- | ------ | ----------- | --- |
| 30†   | identity | n/a | multicodec with implicit length |
| 3a    | variable | codec, length, binary | define a length for a codec that isn't fixed (like CBOR) |
| 3b    | pointer | multicodec (hash) | points to a known or discoverable, content addressed resource |
| 3c    | index | varint | points to a multi-codec within the local message |
| 3d    | tuple | multicodec, multicodec | associate an index or hash with another multicodec |
| 3e    | list | length, multicodec[] | list of multicodecs |
| 3f    | signature | multicodec[] | list is: signature, ...hash algorithms applied, source |

### † multicodecs are by default treated as implicit length. A separate table of those default lengths must be maintained, if the implicit length is to be part of automated tooling. For example sha3-256 implies a length of 32 bytes.

### Signet signature types (to be added to multikey)

| bb    | bip-schnorr-pub | 32 bytes |
| bc    | bip-schnorr-sig | 64 bytes |

# "Layer 2"

Many data packets can be formed using layer 1. Therefore, "Layer 2" is simply known uses of layer 1.

Example 1: Simple sha-3
```
    [hash]
0x16  +32
```

Example 2: Signature of a hash of an inline CBOR
```
    [tuple         ]  [tuple          ]  [blob          ]
      [index]  [sig]    [index]  [hash]  [length]  [cbor]
    []       []       []       []                []
  []                []                 []        
0x3d3c01     bc +64 3d3c00     16  +32 3adb      51 +219
```

# Layer 3

A simple layer 3 application might send a signet packet to a known 3rd party. This could include both corporate infrastructure, or a permissionless blockchain.

For instance, a logistics company might emit the public key derived from a signet packet upon receiving a signed message.

A consumer application might re-sign the whole message so that the original producer of the signet may identify who has received their message.

# Best practices

## Signatures

The default digital signature algorithm is [Schnorr](https://en.wikipedia.org/wiki/Schnorr_signature).

## Content Addressing

The default secure hash algorithm which should be used for content addressing is [SHA3–256](https://en.wikipedia.org/wiki/SHA-3).

## Linked-Data Serialization

- smaller payloads should use [CBOR](https://cbor.io/) or [JSON](https://github.com/mirkokiefer/canonical-json).

- larger payloads or smallest offline footprints should use [Protobuf](https://developers.google.com/protocol-buffers) via [Legendary](https://github.com/ChromaPDX/legendary) wrapper format.