import { GuildChannel } from "discord.js";
import type { EventOptions } from "../../util";
import {
	CustomClient,
	EventType,
	interactionCommand,
	translate,
	translations,
} from "../../util";

export const event: EventOptions<EventType.Discord, "interactionCreate"> = {
	name: "interactionCreate",
	type: EventType.Discord,
	on(interaction) {
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

			switch (arg) {
				case "translate":
					const { from, to, maybe, word, language } = translations[Number(id)];

					interaction
						.deferUpdate()
						.then(async () => {
							const { attachment } = await translate(
								maybe ?? word,
								language ?? from,
								to
							);

							return interaction.editReply({
								files: [
									{
										attachment,
										name: "translate.jpg",
									},
								],
								components: [],
							});
						})
						.catch(CustomClient.printToStderr);
					break;
				default:
					void CustomClient.printToStderr(
						`Received unknown button interaction ${interaction.customId}`
					);
					interaction.deferUpdate().catch(CustomClient.printToStderr);
			}
		}
	},
};
