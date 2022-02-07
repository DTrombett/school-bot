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
				.addStringOption((subject) =>
					subject.setName("materia").setDescription("La materia da cercare")
				)
				.addStringOption((date) =>
					date.setName("data").setDescription("La data da cercare")
				)
		),
	async run(interaction) {
		const _now = new Date();
		const now = {
			day: _now.getDate(),
			month: _now.getMonth() + 1,
			year: _now.getFullYear(),
		};
		let [activities] = await Promise.all([
			getActivities(),
			interaction.deferReply(),
		]);
		const subjectOption = interaction.options.getString("materia");
		const expectSubject = subjectOption != null;
		const dateOption =
			interaction.options.getString("data") ??
			(expectSubject
				? null
				: activities.find((a) => {
						const args = a.date.split("/").map((s) => parseInt(s));

						return (
							args[0] === now.day &&
							args[1] === now.month &&
							args[2] === now.year
						);
				  })
			)?.date;
		const expectDate = dateOption != null;

		activities = activities.filter(
			({ date, subject }) =>
				(!expectDate || date === dateOption) &&
				(!expectSubject ||
					subject.toLowerCase().includes(subjectOption.toLowerCase()))
		);
		await interaction.editReply({
			content: `${
				expectSubject
					? `**${activities[0].subject}**${
							expectDate ? ` (**${dateOption}**)` : ""
					  }`
					: `**${dateOption!}**`
			}:\n\n${
				activities
					.map(
						(activity) =>
							`${expectSubject ? "" : `**${activity.subject}**: `}${
								activity.description
							}${expectDate ? "" : ` (**${activity.date}**)`}`
					)
					.join("\n")
					.slice(0, 2000) || "Nessuna attività trovata!"
			}`,
		});
	},
};
