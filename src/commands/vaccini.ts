import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageAttachment } from "discord.js";
import type { CommandOptions } from "../util";
import { buffers } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("vaccini")
		.setDescription("Guarda i dati riguardo i vaccini!"),
	isPublic: true,
	async run(interaction) {
		return interaction.reply({
			files: [new MessageAttachment(buffers.get("vaccines")!, "vaccines.jpg")],
		});
	},
};
