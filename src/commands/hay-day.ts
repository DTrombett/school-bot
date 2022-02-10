/* eslint-disable security/detect-object-injection */
import { SlashCommandBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";
import type { CommandOptions } from "../util";

const crops = [
	{
		name: "Grano",
		emoji: "🌽",
		count: 97,
	},
	{
		name: "Granoturco",
		emoji: "🌾",
		count: 93,
	},
	{
		name: "Soia",
		emoji: null,
		count: 90,
	},
	{
		name: "Canna da zucchero",
		emoji: null,
		count: 86,
	},
	{
		name: "Carota",
		emoji: "🥕",
		count: 93,
	},
	{
		name: "Indaco",
		emoji: null,
		count: 75,
	},
	{
		name: "Zucca",
		emoji: "🎃",
		count: 68,
	},
	{
		name: "Carota",
		emoji: "🥕",
		count: 93,
	},
];

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("hay-day")
		.setDescription("Utilità per il gioco di Hay Day")
		.addSubcommand((habitats) =>
			habitats
				.setName("habitats")
				.setDescription("Mostra gli habitat da dedicare ad ogni coltivazione")
				.addIntegerOption((count) =>
					count
						.setName("count")
						.setDescription("Numero di habitat disponibili")
						.setRequired(true)
				)
				.addStringOption((lastItem) =>
					lastItem.setName("last").setDescription("Ultimo elemento disponibile")
				)
		),
	isPublic: true,
	async run(interaction) {
		switch (interaction.options.getSubcommand()) {
			case "habitats":
				const count = interaction.options.getInteger("count", true);
				const last = interaction.options.getString("last");
				const availableCrops = crops.slice(
					0,
					last != null
						? crops.findIndex((crop) => crop.name === last) + 1
						: crops.length
				);
				const total = availableCrops.reduce((acc, crop) => acc + crop.count, 0);
				const counts = availableCrops.map((crop) => {
					const c = (crop.count * count) / total;
					const rounded = Math.round(c);

					return {
						count: rounded,
						diff: rounded - c,
					};
				});

				for (
					let c = counts.reduce((acc, crop) => acc + crop.count, 0);
					c !== count;
					c = counts.reduce((acc, crop) => acc + crop.count, 0)
				) {
					let index = 0;

					if (c > count) {
						for (let i = 1; i < counts.length; i++)
							if (counts[i].diff < counts[index].diff) index = i;
						counts[index].count--;
					} else {
						for (let i = 1; i < counts.length; i++)
							if (counts[i].diff > counts[index].diff) index = i;
						counts[index].count++;
					}
				}

				await interaction.reply({
					embeds: [
						{
							title: "Habitat disponibili",
							color: Colors.Yellow,
							description: availableCrops
								.map(
									(crop, i) =>
										`${crop.emoji != null ? `${crop.emoji} ` : ""}${
											crop.name
										}: ${counts[i].count}`
								)
								.join("\n"),
						},
					],
				});
				break;
			default:
		}
	},
};
