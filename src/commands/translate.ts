import { ButtonComponent, SlashCommandBuilder } from "@discordjs/builders";
import type { ButtonStyle } from "discord-api-types/v9";
import type { ActionRowOptions, BaseMessageComponentOptions } from "discord.js";
import { EnumResolvers } from "discord.js";
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

		const [{ attachment, maybe, language }] = await Promise.all([
			translate(word, from as LanguageCode, to as LanguageCode),
			interaction.deferReply(),
		]);
		const components: (ActionRowOptions &
			Required<BaseMessageComponentOptions>)[] = [];

		if (maybe ?? "") {
			const custom_id = `translate-${translations.length - 1}-maybe`;
			const [row] = components;
			const button = new ButtonComponent({
				custom_id,
				style: EnumResolvers.resolveButtonStyle(
					"PRIMARY"
				) as ButtonStyle.Primary,
				// TODO: remove this once the bug is fixed
				type: 2,
				emoji: { name: "✨" },
				label: "Forse cercavi",
			});

			if (typeof row === "undefined")
				components.push({
					type: EnumResolvers.resolveComponentType("ACTION_ROW"),
					components: [button],
				});
			else row.components.push(button);
		}
		if (language ?? "") {
			const custom_id = `translate-${translations.length - 1}-language`;
			const [row] = components;
			const button = new ButtonComponent({
				custom_id,
				style: EnumResolvers.resolveButtonStyle(
					"PRIMARY"
				) as ButtonStyle.Primary,
				// TODO: remove this once the bug is fixed
				type: 2,
				emoji: { name: "✨" },
				label: "Traduci da",
			});

			if (typeof row === "undefined")
				components.push({
					type: EnumResolvers.resolveComponentType("ACTION_ROW"),
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
