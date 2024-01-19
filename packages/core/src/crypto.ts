import type {
	KeyType,
	KeyPair as SodiumKeyPair,
	StringOutputFormat,
	Uint8ArrayOutputFormat,
} from "libsodium-wrappers";
import _sodium from "libsodium-wrappers";

const { from_base64, to_base64 } = _sodium;

const KEY_TYPES: string[] = ["curve25519", "ed25519", "x25519"] satisfies KeyType[];

function assertKeyType(value: string): asserts value is KeyType {
	if (!KEY_TYPES.includes(value)) {
		throw new Error(`Unrecognized key type: ${value}`);
	}
}

export type StringKeyPair = {
	keyType: string;
	publicKey: string;
	privateKey: string;
};

async function sodiumReady() {
	await _sodium.ready;
	return _sodium;
}

export type StringPublicKey = {
	keyType: string;
	publicKey: string;
};

export class PublicKey {
	constructor(
		readonly keyType: KeyType,
		readonly publicKey: Uint8Array,
	) {}

	toStringKeyPair(): StringPublicKey {
		return {
			keyType: this.keyType,
			publicKey: to_base64(this.publicKey),
		};
	}

	static fromStringPublicKey(keypair: StringPublicKey): PublicKey {
		assertKeyType(keypair.keyType);
		return new PublicKey(keypair.keyType, from_base64(keypair.publicKey));
	}
}

export class KeyPair {
	readonly keyType: KeyType;
	readonly publicKey: Uint8Array;
	readonly privateKey: Uint8Array;

	constructor(keypair: SodiumKeyPair) {
		this.keyType = keypair.keyType;
		this.privateKey = keypair.privateKey;
		this.publicKey = keypair.publicKey;
	}

	toStringKeyPair(): StringKeyPair {
		return {
			keyType: this.keyType,
			privateKey: to_base64(this.privateKey),
			publicKey: to_base64(this.publicKey),
		};
	}

	toStringPublicKey(): StringPublicKey {
		return {
			keyType: this.keyType,
			publicKey: to_base64(this.publicKey),
		};
	}

	static fromStringKeyPair(keypair: StringKeyPair): KeyPair {
		assertKeyType(keypair.keyType);
		return new KeyPair({
			keyType: keypair.keyType,
			publicKey: from_base64(keypair.publicKey),
			privateKey: from_base64(keypair.privateKey),
		});
	}

	static async generate() {
		const sodium = await sodiumReady();
		return new KeyPair(sodium.crypto_box_keypair("uint8array"));
	}
}

export class SealedBox {
	constructor(readonly ciphertext: Uint8Array) {}

	static async seal(plaintext: string, keypair: KeyPair | PublicKey): Promise<SealedBox> {
		const sodium = await sodiumReady();
		const box = sodium.crypto_box_seal(plaintext, keypair.publicKey);
		return new SealedBox(box);
	}

	static fromBase64(ciphertext: string) {
		return new SealedBox(from_base64(ciphertext));
	}

	toBase64() {
		return to_base64(this.ciphertext);
	}

	async open(keypair: KeyPair, outputFormat: Uint8ArrayOutputFormat): Promise<Uint8Array>;
	async open(keypair: KeyPair, outputFormat: StringOutputFormat): Promise<string>;
	async open(
		keypair: KeyPair,
		outputFormat: StringOutputFormat | Uint8ArrayOutputFormat,
	): Promise<string | Uint8Array> {
		const sodium = await sodiumReady();
		return sodium.crypto_box_seal_open(
			this.ciphertext,
			keypair.publicKey,
			keypair.privateKey,
			// @ts-expect-error
			outputFormat,
		);
	}
}
