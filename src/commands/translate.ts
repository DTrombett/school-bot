import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { translate } from "../util/playwright";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("translate")
		.setDescription("Translate a word or phrase using Google Translate!")
		.addStringOption((word) =>
			word
				.setRequired(true)
				.setName("word")
				.setDescription("The word or phrase to translate")
		)
		.addStringOption((from) =>
			from
				.setName("from")
				.setDescription(
					"The language from which to translate. Defaults to auto"
				)
		)
		.addStringOption((to) =>
			to
				.setName("to")
				.setDescription("The language to which to translate. Defaults to it")
		),
	async run(interaction) {
		await interaction.deferReply();
		await interaction.editReply({
			content: await translate(
				interaction.options.getString("word", true),
				interaction.options.getString("from") ?? undefined,
				interaction.options.getString("to") ?? undefined
			),
		});
	},
};
