import { codeBlock } from "@discordjs/builders";
import { Colors, GuildChannel, Util } from "discord.js";
import { readFile } from "fs/promises";
import prettier from "prettier";
import type { CompilerOptions } from "typescript";
import ts from "typescript";
import type { EventOptions } from "../../util";
import {
	CustomClient,
	EventType,
	interactionCommand,
	parseEval,
	translate,
	translations,
} from "../../util";

export const event: EventOptions<EventType.Discord, "interactionCreate"> = {
	name: "interactionCreate",
	type: EventType.Discord,
	async on(interaction) {
		if (this.client.blocked) {
			void CustomClient.printToStderr(
				"Received interactionCreate event, but client is blocked."
			);
			return;
		}
		if (interaction.isChatInputCommand()) {
			void this.client.commands.get(interaction.commandName)?.run(interaction);
			void CustomClient.printToStdout(
				`Received command \`${interactionCommand(interaction)}\` from ${
					interaction.user.tag
				} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			return;
		}
		if (interaction.isAutocomplete()) {
			void this.client.commands
				.get(interaction.commandName)
				?.autocomplete(interaction);
			void CustomClient.printToStdout(
				`Received autocomplete request for command ${interactionCommand(
					interaction
				)} from ${interaction.user.tag} (${interaction.user.id}) ${
					interaction.channel
						? `in ${
								interaction.channel instanceof GuildChannel
									? `#${interaction.channel.name}`
									: "DM"
						  } (${interaction.channelId})`
						: ""
				}`,
				true
			);
			return;
		}
		if (interaction.isButton()) {
			const [arg, id] = interaction.customId.split("-");

			if (arg.startsWith("calc")) return;
			switch (arg) {
				case "translate":
					const { from, to, maybe, word, language } = translations[Number(id)];

					Promise.all([
						translate(maybe ?? word, language ?? from, to),
						interaction.deferUpdate(),
					])
						.then(([{ attachment }]) =>
							interaction.editReply({
								files: [
									{
										attachment,
										name: "translate.jpg",
									},
								],
								components: [],
							})
						)
						.catch(CustomClient.printToStderr);
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown button interaction ${interaction.customId}`
					);
			}
			return;
		}
		if (interaction.isModalSubmit()) {
			const [customId, ...args] = interaction.customId.split("-");
			switch (customId) {
				case "eval":
					let code = interaction.fields.getTextInputValue("code"),
						result;
					const now = Date.now();
					try {
						[result] = await Promise.all([
							Promise.all([
								readFile(
									"./node_modules/@tsconfig/node16/tsconfig.json",
									"utf8"
								).then(JSON.parse) as Promise<{
									compilerOptions: CompilerOptions;
								}>,
								readFile("./tsconfig.json", "utf8").then(
									JSON.parse
								) as Promise<{
									compilerOptions: CompilerOptions;
								}>,
								prettier
									.resolveConfig(".prettierrc.json")
									.catch(() => null)
									.then(
										(config) => (code = prettier.format(code, { ...config }))
									),
							]).then(
								([
									{ compilerOptions: baseCompilerOptions },
									{ compilerOptions },
								]) =>
									parseEval(
										ts.transpileModule(code, {
											compilerOptions: {
												...baseCompilerOptions,
												...compilerOptions,
												isolatedModules: false,
												outDir: undefined,
												sourceMap: false,
											},
										}).outputText
									)
							),
							interaction.deferReply({ ephemeral: args[0] === "eph" }),
						]);
					} catch (e) {
						result = CustomClient.inspect(e);
					}
					void CustomClient.printToStdout(result);
					await interaction.editReply({
						content: `Eval elaborato in ${Date.now() - now}ms`,
						embeds: [
							{
								author: {
									name: interaction.user.tag,
									iconURL: interaction.user.displayAvatarURL(),
								},
								title: "Eval output",
								description: codeBlock(
									Util.escapeCodeBlock(result).slice(0, 4096 - 9)
								),
								color: Colors.Blurple,
								timestamp: new Date().toISOString(),
								fields: [
									{
										name: "Input",
										value: codeBlock(
											"js",
											Util.escapeCodeBlock(code).slice(0, 1024 - 9)
										),
									},
								],
							},
						],
					});
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown modal interaction ${interaction.customId}`
					);
			}
		}
	},
};
