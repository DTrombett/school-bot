import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageAttachment } from "discord.js";
import type { CommandOptions } from "../util";
import { buffers } from "../util";

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("covid")
		.setDescription("Guarda i dati covid in Italia!"),
	isPublic: true,
	async run(interaction) {
		return interaction.reply({
			files: [new MessageAttachment(buffers.get("covid")!, "covid.jpg")],
		});
	},
};
