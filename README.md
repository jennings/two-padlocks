# 2Padlocks

A system for receiving secrets and storing them in 1Password.

## Usage

Briefly, the process is:

1. The _Recipient_ generates a Secret Request URL and provides it to the
   _Sender_.

2. The _Sender_ opens the URL in their browser. The page encrypts a secret for
   them. They send the encrypted data back to the _Recipient_.

3. The _Recipient_ decrypts the data and saves the secret in 1Password.

### Scenario

Two actors are involved:

| Actor      | Description                                          |
|------------|------------------------------------------------------|
| Receipient | Wants to receive a secret and store it in 1Password. |
| Sender     | Has the secret to send.                              |

The actors must be able to communicate over a channel like Discord, WhatsApp,
etc. The actors must trust the channel to guarantee each other's identity.

The _Sender_ does not use 1Password or any tools installed on their computer.

The _Recipient_ has a 1Password account, but otherwise does not want to manage
any long-lived secrets such as GPG keys.

### Detailed process

1. The _Recipient_ generates a new Secret Request with the 2Padlocks CLI:

   ```
   2padlocks new NAME [--vault VAULT]
   ```

   This creates a new Secure Note named _NAME_ in 1Password. By default, it is
   stored in the Personal vault unless _VAULT_ is specified. The note contains:

   - A newly-generated public/private key pair
   - A URL, which includes the public key in the hash (e.g.,
     `https://example.com/sealer#dfkjsdlkfjdsf`)

   The _Recipient_ provides the URL to the _Sender_.

2. The _Sender_ loads the URL in their web browser. They enter the secret in a
   text area in the page and selects _Encrypt_.

   The page encrypts the secret using the public key in the URL hash and saves
   the ciphertext to the clipboard.

   The _Sender_ sends the ciphertext to the _Recipient_ over any channel.

3. The _Recipient_ passes the ciphertext to the 2Padlocks CLI via stdin, e.g.:

   ```
   paste | 2padlocks receive [NAME] [--vault VAULT]
   ```

   If _NAME_ and _VAULT_ are not specified, 2Padlocks searches the 1Password
   vault to find any pending Secure Note.

   2Padlocks uses the private key to decrypt the ciphertext and stores it in
   the Secure Note. The URL and key pair are deleted from the note.

## Implementation

- Use libsodium to [generate a key pair][keypair].
- Use a [libsodium sealed box][sealed-box] to encrypt the secret.

[keypair]: https://doc.libsodium.org/public-key_cryptography/authenticated_encryption#key-pair-generation
[sealed-box]: https://doc.libsodium.org/public-key_cryptography/sealed_boxes
