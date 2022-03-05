import { SlashCommandBuilder } from "@discordjs/builders";
import Ajv from "ajv";
import ajvKeywords from "ajv-keywords";
import instanceofDef from "ajv-keywords/dist/definitions/instanceof";
import CustomClient from "./CustomClient";
import type { CommandOptions, EventOptions } from "./types";

export const schemas = {
	CommandOptions: {
		type: "object",
		properties: {
			data: { instanceof: "SlashCommandBuilder" },
			isPublic: { type: "boolean" },
			autocomplete: { typeof: "function" },
			run: { typeof: "function" },
		},
		required: ["data", "run"],
	},
	EventOptions: {
		type: "object",
		properties: {
			name: { type: "string" },
			type: { type: "string" },
			on: { typeof: "function" },
			once: { typeof: "function" },
		},
		required: ["name", "type"],
	},
};
const classes: (new (...args: any[]) => any)[] = [SlashCommandBuilder];

for (const c of classes) instanceofDef.CONSTRUCTORS[c.name] = c;
export const ajv = new Ajv({
	strict: true,
	strictTypes: true,
	strictTuples: true,
	strictRequired: true,
	allErrors: true,
	logger: {
		error: CustomClient.printToStderr,
		warn: CustomClient.printToStderr,
		log: CustomClient.printToStdout,
	},
	removeAdditional: true,
});
ajvKeywords(ajv);

export const compilePartialSchema = <T>(
	schema: typeof schemas[keyof typeof schemas]
) => ajv.compile<Partial<T>>({ ...schema, required: undefined });

export const validateCommandOptions = ajv.compile<CommandOptions>(
	schemas.CommandOptions
);
export const validatePartialCommandOptions =
	compilePartialSchema<CommandOptions>(schemas.CommandOptions);
export const validateEventOptions = ajv.compile<EventOptions>(
	schemas.EventOptions
);
export const validatePartialEventOptions = compilePartialSchema<EventOptions>(
	schemas.EventOptions
);
