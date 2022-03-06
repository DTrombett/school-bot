import type { RegistroMethod } from "..";
import { getActivities } from "../playwright";

/**
 * Get the activities of the specified subject (if any) from the specified date (if any) and return them as message options.
 * @param date - The date to get the activities for
 * @param subject - The subject to get the activities for
 * @returns A promise that resolves to message options
 */
export const lessonArguments = async (
	date: Date | null | undefined,
	subject: string | null | undefined
): RegistroMethod => {
	if (date != null && !(date instanceof Date))
		throw new TypeError(`Argument 'date' must be a nullable Date`);
	if (subject != null && typeof subject !== "string")
		throw new TypeError(`Argument 'subject' must be a nullable string`);
	const expectDate = date != null;
	const time = date?.getTime();
	const expectSubject = subject != null;
	const rawActivities = await getActivities().catch((err: Error) => ({
		content: err.message,
	}));

	if (!Array.isArray(rawActivities)) return rawActivities;
	const activities = rawActivities.filter(
		({ date: d, subject: s }) =>
			(!expectDate || d.getTime() === time) &&
			(!expectSubject || s.toLowerCase().includes(subject))
	);

	return {
		content: `${
			expectSubject
				? `**${activities[0]?.subject ?? subject.toUpperCase()}**${
						expectDate ? ` (**${date.toLocaleDateString()}**)` : ""
				  }`
				: `**${date!.toLocaleDateString()}**`
		}:\n\n${
			activities
				.map(
					(activity) =>
						`${expectSubject ? "" : `**${activity.subject}**: `}${
							activity.description
						}${
							expectDate ? "" : ` (**${activity.date.toLocaleDateString()}**)`
						}`
				)
				.join("\n")
				.slice(0, 2000) || "Nessuna attività trovata!"
		}`,
	};
};
