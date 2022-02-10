import { REST } from "@discordjs/rest";
import type {
	APIApplicationCommand,
	APIGuildApplicationCommandPermissions,
} from "discord-api-types/v9";
import { APIVersion, Routes } from "discord-api-types/v9";
import { EnumResolvers } from "discord.js";
import { promises } from "node:fs";
import { env } from "node:process";
import { URL } from "node:url";
import type { CommandOptions } from "./util";
import Constants, { CustomClient } from "./util";

console.time("Register slash commands");

const { DISCORD_CLIENT_ID: applicationId, TEST_GUILD: guildId } = env;
const rest = new REST({ version: APIVersion }).setToken(env.DISCORD_TOKEN!);
// eslint-disable-next-line security/detect-non-literal-fs-filename
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
		body: APICommands.filter(
			(c) => commands.find((co) => co.data.name === c.name)?.isPublic !== true
		).map<APIGuildApplicationCommandPermissions>((command) => ({
			application_id: applicationId!,
			guild_id: guildId!,
			id: command.id,
			permissions: [
				{
					id: env.OWNER_ID!,
					type: EnumResolvers.resolveApplicationCommandPermissionType("USER"),
					permission: true,
				},
			],
		})),
	}
);

await CustomClient.printToStdout(APICommands);
console.timeEnd("Register slash commands");
