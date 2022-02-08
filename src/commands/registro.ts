import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { lessonArguments, parseDate } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("registro")
		.setDescription("Prendi informazioni dal registro!")
		.addSubcommand((argomenti) =>
			argomenti
				.setName("argomenti")
				.setDescription("Osserva le attività svolte!")
				.addStringOption((subject) =>
					subject.setName("materia").setDescription("La materia da cercare")
				)
				.addStringOption((date) =>
					date.setName("data").setDescription("La data da cercare")
				)
		),
	async run(interaction) {
		const today = new Date();

		today.setHours(0, 0, 0, 0);
		switch (interaction.options.getSubcommand()) {
			case "argomenti":
				const subjectOption = interaction.options
					.getString("materia")
					?.toLowerCase();
				const [options] = await Promise.all([
					lessonArguments(
						parseDate(interaction.options.getString("data")) ??
							(subjectOption != null ? null : today),
						subjectOption
					),
					interaction.deferReply(),
				]);

				await interaction.editReply(options);
				break;
			default:
		}
	},
};
