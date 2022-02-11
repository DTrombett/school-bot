/* eslint-disable security/detect-object-injection */
import { SlashCommandBuilder } from "@discordjs/builders";
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
		name: "Cotone",
		emoji: null,
		count: 72,
	},
];
const cropsSum = (availableCrops: { count: number }[]) =>
	availableCrops.reduce((acc, crop) => acc + crop.count, 0);

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("hay-day")
		.setDescription("Utilità per il gioco di Hay Day")
		.addSubcommand((fields) =>
			fields
				.setName("campi")
				.setDescription("Mostra i campi da dedicare ad ogni coltivazione")
				.addIntegerOption((count) =>
					count
						.setName("count")
						.setDescription("Numero di campi disponibili")
						.setRequired(true)
				)
				.addStringOption((lastItem) =>
					lastItem.setName("last").setDescription("Ultimo elemento disponibile")
				)
		),
	isPublic: true,
	async run(interaction) {
		switch (interaction.options.getSubcommand()) {
			case "campi":
				const count = interaction.options.getInteger("count", true);
				const last = interaction.options.getString("last");
				const availableCrops =
					last != null
						? crops.slice(0, crops.findIndex((crop) => crop.name === last) + 1)
						: crops;
				const total = cropsSum(availableCrops);
				const counts = availableCrops.map((crop) => {
					const c = (crop.count * count) / total;
					const rounded = Math.round(c);

					return {
						count: rounded,
						diff: rounded - c,
					};
				});

				for (let c = cropsSum(counts); c !== count; c = cropsSum(counts)) {
					let index = 0;

					if (c > count) {
						for (let i = 1; i < counts.length; i++)
							if (counts[i].diff > 0 && counts[i].diff > counts[index].diff)
								index = i;
						counts[index].diff =
							counts[index].count-- - counts[index].diff - counts[index].count;
					} else if (c < count) {
						for (let i = 1; i < counts.length; i++)
							if (counts[i].diff < 0 && counts[i].diff < counts[index].diff)
								index = i;
						counts[index].diff =
							counts[index].count++ - counts[index].diff - counts[index].count;
					}
				}

				await interaction.reply({
					embeds: [
						{
							title: "Campi disponibili per piantagione",
							color: Math.round((count * 16777215) / 100),
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
