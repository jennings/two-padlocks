import { Command } from "commander";
import process from "process";
import { requestCommand } from "./request.js";

const program = new Command();

program
	.name("2padlocks")
	.version("0.0.1")
	.description("Receive encrypted secrets")
	.addCommand(requestCommand)
	.parse(process.argv);
