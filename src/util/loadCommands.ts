import { promises } from "node:fs";
import { URL } from "node:url";
import type { CommandOptions, CustomClient } from ".";
import Command from "./Command";
import Constants from "./Constants";

const folder = Constants.commandsFolderName();

/**
 * Loads all commands from the commands directory.
 * @param client - The client to load commands into
 */
export const loadCommands = (client: CustomClient) =>
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	promises
		.readdir(new URL(folder, import.meta.url))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(`./${folder}/${fileName}`) as Promise<{
								command: CommandOptions;
							}>
					)
			)
		)
		.then((files) => files.map((file) => file.command))
		.then((commands) => {
			for (const command of commands)
				client.commands.set(command.data.name, new Command(client, command));
		});

export default loadCommands;
