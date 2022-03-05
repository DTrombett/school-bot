import type { CronExpression } from "cron-parser";
import parser from "cron-parser";
import type { Awaitable } from "discord.js";

/**
 * Create a job.
 * @param func - The function to execute
 * @param expression - The cron-like expression
 */
export const createJob = (
	func: (parsed: CronExpression) => Awaitable<void>,
	expression: string
) => {
	if (typeof func !== "function")
		throw new TypeError("Argument 'func' must be a function");
	if (typeof expression !== "string")
		throw new TypeError("Argument 'expression' must be a string");
	const parsed = parser.parseExpression(expression);
	const setNext = () =>
		setTimeout(() => {
			void func(parsed);
			setNext();
		}, parsed.next().getTime() - Date.now());

	setNext();
};

export default createJob;
