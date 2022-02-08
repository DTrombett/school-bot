type Parsed<T extends string | null | undefined> = T extends string
	? Date
	: null;

/**
 * Parse a date string from Argo into a Date object.
 * @param date - The date to parse
 * @returns The parsed date
 */
export const parseDate = <T extends string | null | undefined>(
	date: T
): Parsed<T> => {
	if (typeof date !== "string") return null as Parsed<T>;
	const [day, month, year] = date.split(/\/|-|_| /).map((s) => parseInt(s));

	return new Date(
		year < 1000 ? year + 2000 : year,
		month - 1,
		day
	) as Parsed<T>;
};

/**
 * Get the current date in the format `dd/mm/yyyy`.
 * @param date - The date to format
 * @returns The formatted date
 */
export const formatDate = (date: Date): string =>
	`${String(date.getDate()).padStart(2, "0")}/${String(
		date.getMonth() + 1
	).padStart(2, "0")}/${date.getFullYear()}`;
