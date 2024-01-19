import { Command } from "commander";
import { KeyPair, SealedBox } from "two-padlocks-core/crypto";
import { OnePassword } from "./1password.js";

export const requestCommand = new Command();

requestCommand
	.name("request")
	.description("Request a new secret")
	.action(async (...args: any[]) => {
		const op = new OnePassword();
		const request = await op.createSecureNoteRequest("test");
		console.log(request);
	});
