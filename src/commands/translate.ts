import { ButtonComponent, SlashCommandBuilder } from "@discordjs/builders";
import type { ActionRowOptions, BaseMessageComponentOptions } from "discord.js";
import type { CommandOptions } from "../util";
import { LanguageCode, translate, translations } from "../util";

const keys = Object.keys(LanguageCode);

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
				.setAutocomplete(true)
		)
		.addStringOption((to) =>
			to
				.setName("to")
				.setDescription("The language to which to translate. Defaults to it")
				.setAutocomplete(true)
		),
	isPublic: true,
	async run(interaction) {
		const word = interaction.options.getString("word", true);
		const from = interaction.options.getString("from") ?? undefined;
		const to = interaction.options.getString("to") ?? undefined;

		await interaction.deferReply();
		const { attachment, maybe, language } = await translate(
			word,
			from as LanguageCode,
			to as LanguageCode
		);
		const components: (ActionRowOptions &
			Required<BaseMessageComponentOptions>)[] = [];

		if (maybe ?? "") {
			const custom_id = `translate-${translations.length - 1}-maybe`;
			const [row] = components;
			const button = new ButtonComponent({
				custom_id,
				style: 1 /** Primary */,
				type: 2 /** Button */,
				emoji: { name: "✨" },
				label: "Forse cercavi",
			});

			if (typeof row === "undefined")
				components.push({
					type: 1 /** ActionRow */,
					components: [button],
				});
			else row.components.push(button);
		}
		if (language ?? "") {
			const custom_id = `translate-${translations.length - 1}-language`;
			const [row] = components;
			const button = new ButtonComponent({
				custom_id,
				style: 1 /** Primary */,
				type: 2 /** Button */,
				emoji: { name: "✨" },
				label: "Traduci da",
			});

			if (typeof row === "undefined")
				components.push({
					type: 1 /** ActionRow */,
					components: [button],
				});
			else row.components.push(button);
		}
		await interaction.editReply({
			files: [
				{
					attachment,
					name: "translate.jpg",
				},
			],
			components,
		});
	},
	autocomplete(interaction) {
		return interaction.respond(
			keys
				.filter((key) =>
					key
						.toLowerCase()
						.includes(
							(interaction.options.getFocused() as string).toLowerCase()
						)
				)
				.map((name) => ({
					name,
					value: LanguageCode[name as keyof typeof LanguageCode],
				}))
				.slice(0, 25)
		);
	},
};
