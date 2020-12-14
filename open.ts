import { console } from "console";
import { Duplex, Readable, Writable } from "stream";
import { createInterface } from "readline";
import { join } from "path";
import { assertThat } from "./assertThat.ts";
import { willStream } from "./assertions/willStream.ts";
import { writeFileSync } from "fs";
import { scenario } from "./scenario.ts";

export async function handleCommand(command: string) {
	console.log(command);
}

export async function open(stdin: Readable, stdout: Writable, cwd: string) {
	const rl = createInterface({
		input: stdin,
		output: stdout,
	});

	rl.setPrompt("$ ");
	rl.prompt();
	rl.on("line", (line) => {
		handleCommand(line);
		rl.prompt();
	});
}

function someDirectory() {
	return "/tmp/asdsad";
}

function someString() {
	return "asdasdas";
}

export const runningFunctionScenario = scenario({
	description: `should allow running a function from a depno file`,
	verify: async () => {
		const directory = someDirectory();
		const expectedOutput = someString();
		writeFileSync(
			join(directory, "index.ts"),
			`export function sayHello() { console.log("${expectedOutput}"); }`
		);
		const stdin = new Duplex();
		const stdout = new Duplex();
		open(stdin, stdout, directory);
		stdin.write("./index.ts#sayHello()\n");
		await assertThat(stdout, willStream(expectedOutput));
	},
});
