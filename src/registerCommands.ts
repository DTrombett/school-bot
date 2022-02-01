import { REST } from "@discordjs/rest";
import type {
	APIApplicationCommand,
	APIGuildApplicationCommandPermissions,
} from "discord-api-types/v9";
import { APIVersion, Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { promises } from "node:fs";
import { join } from "node:path";
import { cwd, env } from "node:process";
import { URL } from "node:url";
import type { CommandOptions } from "./util";
import Constants, { CustomClient } from "./util";

console.time("Register slash commands");

config({ path: join(cwd(), ".env") });

const { DISCORD_CLIENT_ID: applicationId, TEST_GUILD: guildId } = env;
const rest = new REST({ version: APIVersion }).setToken(env.DISCORD_TOKEN!);
const commands = await promises
	.readdir(new URL(Constants.commandsFolderName(), import.meta.url))
	.then((fileNames) =>
		Promise.all(
			fileNames
				.filter((file): file is `${string}.js` => file.endsWith(".js"))
				.map(async (file) => {
					const fileData = (await import(
						`./${Constants.commandsFolderName()}/${file}`
					)) as { command: CommandOptions };
					return fileData.command;
				})
		)
	);
const APICommands = (await rest.put(
	Routes.applicationGuildCommands(applicationId!, guildId!),
	{
		body: commands.map((file) => file.data.toJSON()),
	}
)) as APIApplicationCommand[];

await rest.put(
	Routes.guildApplicationCommandsPermissions(applicationId!, guildId!),
	{
		body: APICommands.map<APIGuildApplicationCommandPermissions>((command) => ({
			application_id: applicationId!,
			guild_id: guildId!,
			id: command.id,
			permissions: [
				{
					id: env.OWNER_ID!,
					type: 2,
					permission: true,
				},
			],
		})),
	}
);

await CustomClient.printToStdout(APICommands);
console.timeEnd("Register slash commands");
