[![Build Status](https://travis-ci.org/chromapdx/signet.svg?branch=master)](https://travis-ci.org/chromapdx/signet) [![Coverage Status](https://coveralls.io/repos/github/chromapdx/signet/badge.svg?branch=master)](https://coveralls.io/github/chromapdx/signet?branch=master)
[![NPM](https://nodei.co/npm/Signet.png?downloads=true)](https://nodei.co/npm/@chromapdx/signet/)

Signet is a protocol that conveys secure, authoritative symbols across somewhat-trusted boundaries.

Why?

Typically, verifiable statements are simply relationships between signatures and data. Each verifiable statement requires 3 known codecs: Data Serialization, Checksum, and Signature. Currently, there is no portable format that allows the identification and arrangement of these 3 codecs such that their relationship may be identified; therefore, this process inevitably becomes part of a system's implementation code, which is not compatible with other systems, except when made explicitly compatible by convention.

# The protocol

## Layer 0

Storage to binary

* a *signet* is a physical mark, most often represented by Chroma's pinwheel.
* a *signet* can also be distributed as a QR, Aztec, Jabcode, Databar, or other data carrying mark. This typically mandates a smaller footprint, inclusive of the payload and signatures.
* Being stored or transmitted digitally, a signet may be represented as binary, or as a [multibase](https://github.com/multiformats/multibase/blob/master/multibase.csv) string.
 
## Layer 1

Binary to multicodec graph

Signet protocol aims to allow small [multicodec](https://github.com/multiformats/multicodec/blob/master/table.csv) graphs to be encoded as uninterrupted binary with minimum overhead. Similiar to a usb descriptor, this can be accomplished by simply setting lengths for codecs that do not have a fixed length. Then, with the addition of a few basic index and container types, one can communicate indentified statements portably.

### Signet descriptor types allow for encoding of multiple multicodecs in a single byte stream
| version | name | data | details |
| ------- | ------ | ----------- | --- |
| 30†   | identity | n/a | multicodec with implicit length |
| 3a    | variable | codec, length, binary | define a length for a codec that isn't fixed (like CBOR) |
| 3b    | index | varint | points to a multi-codec within the local message |
| 3c    | pointer | multicodec (hash) | points to a known or discoverable, content addressed resource |
| 3d    | tuple | multicodec, multicodec | associate an index or hash with another multicodec |
| 3e    | list | length, multicodec[] | list of multicodecs |
| 3f    | signature | multicodec[] | list is: signature, ...hash algorithms applied, source |

### †The current multicodec table treats codecs as having implicit length. A separate table of those default lengths must be maintained, if the implicit length is to be used by automated tooling. For example sha3-256 implies a length of 32 bytes.

### Signet signature types (to be added to multikey)

| version | name | data | details |
| ------- | ------ | ----------- | --- |
| bb    | bip-schnorr-pub | 32 bytes |
| bc    | bip-schnorr-sig | 64 bytes |

## Layer 2

Protocol defined multicodec stuctures

Example 1: a "statement" could be a signature of a hash of a CBOR
```
    [tuple         ]  [tuple          ]  [blob          ]
      [index]  [sig]    [index]  [hash]  [length]  [cbor]
    []       []       []       []                []
  []                []                 []        
0x3d3b01     bc +64 3d3b00     16  +32 3adb      51 +219
```

Example 2: a simple sha-3
```
    [hash]
0x16  +32
```

## Layer 3

A simple layer 3 application might send a signet packet to a known 3rd party. This could include a corporate infrastructure, or a permissionless blockchain.

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
