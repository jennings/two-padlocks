import type {
	KeyType,
	KeyPair as SodiumKeyPair,
	StringOutputFormat,
	Uint8ArrayOutputFormat,
} from "libsodium-wrappers";
import _sodium from "libsodium-wrappers";

/** Key used to look up the sodium module in a Context. */
const sodium = Symbol();

export async function createContext() {
	await _sodium.ready;
	return { [sodium]: _sodium };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

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

export type SodiumPublicKey = {
	keyType: KeyType;
	publicKey: Uint8Array;
};

export type StringPublicKey = {
	keyType: string;
	publicKey: string;
};

export class PublicKey {
	readonly keyType: KeyType;
	readonly publicKey: Uint8Array;

	constructor(
		private readonly context: Context,
		keypair: SodiumPublicKey,
	) {
		this.keyType = keypair.keyType;
		this.publicKey = keypair.publicKey;
	}

	toStringKeyPair(): StringPublicKey {
		return {
			keyType: this.keyType,
			publicKey: this.context[sodium].to_base64(this.publicKey),
		};
	}

	static fromStringPublicKey(context: Context, keypair: StringPublicKey): PublicKey {
		assertKeyType(keypair.keyType);
		return new PublicKey(context, {
			keyType: keypair.keyType,
			publicKey: context[sodium].from_base64(keypair.publicKey),
		});
	}
}

export class KeyPair {
	readonly keyType: KeyType;
	readonly publicKey: Uint8Array;
	readonly privateKey: Uint8Array;

	constructor(
		private readonly context: Context,
		keypair: SodiumKeyPair,
	) {
		this.keyType = keypair.keyType;
		this.privateKey = keypair.privateKey;
		this.publicKey = keypair.publicKey;
	}

	toStringKeyPair(): StringKeyPair {
		return {
			keyType: this.keyType,
			privateKey: this.context[sodium].to_base64(this.privateKey),
			publicKey: this.context[sodium].to_base64(this.publicKey),
		};
	}

	toStringPublicKey(): StringPublicKey {
		return {
			keyType: this.keyType,
			publicKey: this.context[sodium].to_base64(this.publicKey),
		};
	}

	static fromStringKeyPair(context: Context, keypair: StringKeyPair): KeyPair {
		assertKeyType(keypair.keyType);
		return new KeyPair(context, {
			keyType: keypair.keyType,
			publicKey: context[sodium].from_base64(keypair.publicKey),
			privateKey: context[sodium].from_base64(keypair.privateKey),
		});
	}

	static generate(context: Context) {
		return new KeyPair(context, context[sodium].crypto_box_keypair("uint8array"));
	}
}

export class SealedBox {
	constructor(
		private readonly context: Context,
		readonly ciphertext: Uint8Array,
	) {}

	static seal(context: Context, plaintext: string, keypair: KeyPair | PublicKey) {
		const box = context[sodium].crypto_box_seal(plaintext, keypair.publicKey);
		return new SealedBox(context, box);
	}

	static fromBase64(context: Context, ciphertext: string) {
		return new SealedBox(context, context[sodium].from_base64(ciphertext));
	}

	toString() {
		return this.toBase64();
	}

	toBase64() {
		return this.context[sodium].to_base64(this.ciphertext);
	}

	open(context: Context, keypair: KeyPair, outputFormat: Uint8ArrayOutputFormat): Uint8Array;
	open(context: Context, keypair: KeyPair, outputFormat: StringOutputFormat): string;
	open(
		context: Context,
		keypair: KeyPair,
		outputFormat: StringOutputFormat | Uint8ArrayOutputFormat,
	): string | Uint8Array {
		return context[sodium].crypto_box_seal_open(
			this.ciphertext,
			keypair.publicKey,
			keypair.privateKey,
			// @ts-expect-error
			outputFormat,
		);
	}
}
