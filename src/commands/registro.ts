import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { getActivities } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("registro")
		.setDescription("Prendi informazioni dal registro!")
		.addSubcommand((argomenti) =>
			argomenti
				.setName("argomenti")
				.setDescription("Osserva le attività svolte!")
		),
	async run(interaction) {
		await interaction.deferReply();
		await interaction.editReply({
			content: (
				await getActivities()
			)
				.map(
					(activity) =>
						`${activity.subject}: ${activity.description} (${activity.date})`
				)
				.join("\n")
				.slice(0, 2000),
		});
	},
};
