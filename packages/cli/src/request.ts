import { Command } from "commander";
import { OnePassword } from "./1password.js";
import { createContext } from "./encryption.js";

export const requestCommand = new Command();

requestCommand
	.name("request")
	.description("Request a new secret")
	.action(async (...args: any[]) => {
		const context = await createContext();
		const op = new OnePassword(context);
		const request = await op.createSecureNoteRequest("test");
		console.log(request);
	});
