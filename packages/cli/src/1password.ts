import { spawnSync } from "child_process";
import type { Context, StringKeyPair } from "./encryption.js";
import { KeyPair } from "./encryption.js";

export class OnePassword {
	constructor(private readonly context: Context) {}

	async createSecureNoteRequest(title: string) {
		const keypair = await KeyPair.generate(this.context);
		const request = new SecureNoteRequest("2Padlocks", title, keypair.toStringKeyPair());
		const r = spawnSync(
			"op",
			[
				"item",
				"create",
				"--category",
				'"Secure Note"',
				"--title",
				request.title,
				"--vault",
				request.vaultName,
				// `"Request.keyType[text]=${request.keypair.keyType}"`,
				// `Request.publicKey[text]=${request.keypair.publicKey}`,
				// `Request.privateKey[password]=${request.keypair.privateKey}`,
				// `Request.url[text]=${request.url}`,
			],
			{
				shell: true,
			},
		);
		if (r.status != 0) {
			console.error(`op exited with code ${r.status}:`, r.stderr.toString("utf-8"));
			throw new Error("Failed to create 1Password secure note");
		}
		return request;
	}
}

export class SecureNoteRequest {
	readonly url: string;

	constructor(
		readonly vaultName: string,
		readonly title: string,
		readonly keypair: StringKeyPair,
	) {
		this.url = `https://example.com/#public_key=${keypair.publicKey}`;
	}
}
