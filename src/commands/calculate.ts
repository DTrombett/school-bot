import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import type {
	ActionRowData,
	BaseComponentData,
	ButtonComponentData,
	ButtonInteraction,
	ComponentType,
	InteractionCollector,
} from "discord.js";
import { ButtonStyle, EnumResolvers, Message } from "discord.js";
import type { CommandOptions } from "../util";
import {
	CustomClient,
	emitterToIterable,
	evaluateMathExpression,
} from "../util";

const separator = " ";

const createNumberButton = (number: number | string): ButtonComponentData => ({
	type: EnumResolvers.resolveComponentType("BUTTON"),
	style: EnumResolvers.resolveButtonStyle("SECONDARY") as ButtonStyle.Primary,
	customId: `calc${separator}${number}`,
	label: number.toString(),
	disabled: false,
});
const createActionButton = (label: string): ButtonComponentData => ({
	type: EnumResolvers.resolveComponentType("BUTTON"),
	style: EnumResolvers.resolveButtonStyle("DANGER") as ButtonStyle.Primary,
	customId: `calc${separator}${label}`,
	label,
	disabled: false,
});
const createOperationButton = (label: string): ButtonComponentData => ({
	type: EnumResolvers.resolveComponentType("BUTTON"),
	style: EnumResolvers.resolveButtonStyle("PRIMARY") as ButtonStyle.Primary,
	customId: `calc${separator}${label}`,
	label,
	disabled: false,
});
const createFinalizeButton = (label: string): ButtonComponentData => ({
	type: EnumResolvers.resolveComponentType("BUTTON"),
	style: EnumResolvers.resolveButtonStyle("SUCCESS") as ButtonStyle.Primary,
	customId: `calc${separator}${label}`,
	label,
	disabled: false,
});

const handleButtons = (content: string, buttons: ButtonComponentData[]) => {
	const lastChar = content.slice(-1);
	const isMinus = lastChar === "-";

	if (lastChar === "π")
		for (const button of buttons)
			button.disabled = button.style === ButtonStyle.Secondary;
	else if (["^", "×", "÷", "-", "+"].includes(lastChar))
		for (const button of buttons)
			button.disabled =
				button.label === "=" ||
				(button.style === ButtonStyle.Primary &&
					(isMinus || button.label !== "-")) ||
				button.label === ".";
	else if (!Number.isNaN(Number(lastChar === "" ? undefined : lastChar)))
		for (const button of buttons) button.disabled = button.label === "π";
	else if (lastChar === ".")
		for (const button of buttons)
			button.disabled =
				button.style === ButtonStyle.Primary || button.label === "π";
	else
		for (const button of buttons)
			button.disabled =
				button.style !== ButtonStyle.Secondary && button.label !== "-";
	if (
		!content ||
		content
			.split(/×|÷|\^|-|\+]/)
			.at(-1)
			?.includes(".") === true
	)
		buttons.find((button) => button.label === ".")!.disabled = true;
	if (!/×|÷|\^|-|\+]/.test(content))
		buttons.find((button) => button.label === "=")!.disabled = true;
};

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("calculator")
		.setDescription("Start a calculator!"),
	isPublic: true,
	async run(interaction) {
		let content = "",
			result = "";
		const components: (ActionRowData &
			Required<BaseComponentData> & { components: ButtonComponentData[] })[] = [
			{
				type: 1,
				components: [
					createActionButton("AC"),
					{
						...createActionButton("DEL"),
						emoji: {
							animated: false,
							id: "943935675995136021",
							name: "backspace",
						},
						label: "\u200B",
					},
					createOperationButton("^"),
					createOperationButton("÷"),
				],
			},
			{
				type: 1,
				components: [
					createNumberButton(7),
					createNumberButton(8),
					createNumberButton(9),
					createOperationButton("×"),
				],
			},
			{
				type: 1,
				components: [
					createNumberButton(4),
					createNumberButton(5),
					createNumberButton(6),
					createOperationButton("-"),
				],
			},
			{
				type: 1,
				components: [
					createNumberButton(1),
					createNumberButton(2),
					createNumberButton(3),
					createOperationButton("+"),
				],
			},
			{
				type: 1,
				components: [
					createNumberButton(0),
					createNumberButton("."),
					createNumberButton("π"),
					createFinalizeButton("="),
				],
			},
		];
		const buttons = components.flatMap((c) => c.components);

		handleButtons("", buttons);
		const iterator = await interaction
			.reply({
				content: codeBlock("0"),
				components,
				fetchReply: true,
			})
			.then((message) => {
				if (message instanceof Message)
					return emitterToIterable<
						InteractionCollector<ButtonInteraction>,
						"collect",
						[interaction: ButtonInteraction]
					>(
						message.createMessageComponentCollector({
							componentType: EnumResolvers.resolveComponentType(
								"BUTTON"
							) as ComponentType.Button,
							filter: (collected) => {
								if (collected.user.id === interaction.user.id) return true;
								collected.deferUpdate().catch(CustomClient.printToStderr);
								return false;
							},
						}),
						"collect",
						(collector) => {
							collector.stop();
						}
					);
				return null;
			});
		if (!iterator) return;

		for await (const [collected] of iterator) {
			const [, id] = collected.customId.split(separator);

			if (id === "AC") {
				content = "";
				result = "";
			} else if (id === "DEL") content = content.slice(0, -1);
			else if (
				["^", "×", "÷", "-", "+", "π", "."].includes(id) ||
				!Number.isNaN(Number(id))
			)
				content += id;
			else {
				content =
					(await evaluateMathExpression(content)
						.then((r) => r.toString())
						.catch((err) => {
							void CustomClient.printToStderr(err);
							return "";
						})) || content;
				result = "";
			}
			handleButtons(content, buttons);

			if (buttons.find((button) => button.label === "=")?.disabled === false)
				result = await evaluateMathExpression(content)
					.then((r) => `\n${r}`)
					.catch((err) => {
						void CustomClient.printToStderr(err);
						return "";
					});

			await collected.update({
				content: codeBlock(content || "0") + result,
				components,
			});
		}
	},
};
