import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandOptions } from "../util";
import { getActivities, parseDate } from "../util";

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
				const [rawActivities] = await Promise.all([
					getActivities(),
					interaction.deferReply(),
				]);
				const subjectOption = interaction.options
					.getString("materia")
					?.toLowerCase();
				const expectSubject = subjectOption != null;
				const dateOption =
					parseDate(interaction.options.getString("data")) ??
					(expectSubject ? null : today);
				const time = dateOption?.getTime();
				const expectDate = dateOption != null;
				const activities = rawActivities.filter(
					({ date, subject }) =>
						(!expectDate || date.getTime() === time) &&
						(!expectSubject || subject.toLowerCase().includes(subjectOption))
				);

				await interaction.editReply({
					content: `${
						expectSubject
							? `**${activities[0]?.subject ?? subjectOption.toUpperCase()}**${
									expectDate ? ` (**${dateOption.toLocaleDateString()}**)` : ""
							  }`
							: `**${dateOption!.toLocaleDateString()}**`
					}:\n\n${
						activities
							.map(
								(activity) =>
									`${expectSubject ? "" : `**${activity.subject}**: `}${
										activity.description
									}${
										expectDate
											? ""
											: ` (**${activity.date.toLocaleDateString()}**)`
									}`
							)
							.join("\n")
							.slice(0, 2000) || "Nessuna attività trovata!"
					}`,
				});
				break;
			default:
		}
	},
};
