# Signet

Signet is open provenance. It is a protocol for authoritive codes that are signed, distributed, and later validated, or redeemed.

* A **signet** is a code signed by an *authority*
  - An *authority* is a public identity that signs data or schema.

  - The *code* is a canonically serialized dictionary, using either an inline or external schema.

* *Signets* are most frequently distributed as a QR code. This mandates a small footprint, inclusive of the dictionary and signature.

* A *signet* is validated by verifying the *code* against a local set of known authorities.

* A *signet* can be redeemed by optionally appending a new signature and sending it back or forward to another authority.
  
The Signet protocol is made up of both existing and new open standards.

## Encoding

Signet uses a single byte to determine the message type. To avoid collision with existing QR codes, signet characters that may be 

| Unsigned | Signed | Descriptor | Length |
| --- | --- | --- | --- |
| Fixed |

| 68 | C2 | url |  |
| 20 | legendary

## Signature

The default digital signature algorithm is [Schnorr](https://en.wikipedia.org/wiki/Schnorr_signature).

## Serialization

- smaller payloads can use [canonical JSON](https://github.com/mirkokiefer/canonical-json).

- larger payloads or to achieve smaller physical print size a [Legendary container](https://github.com/ChromaPDX/legendary) format may be used.
  
***authorities*** aka public keys may sign data.

***authorities*** may also sign schema, so that data may be distibutes as a values only structure without keys.

multiple authorities may sign the data (see: https://en.wikipedia.org/wiki/Schnorr_signature)

## Distribute

## Validate

Allow client to validate data either
1) offline via **cache** of ***authorities*** and ***schemas***
2) online via a **provider** of ***authorities*** and ***schemas***