import { MatchLevel } from "./types";

/**
 * Search for a string in a string.
 * @param haystack - The string to search in
 * @param needle - The string to search for
 * @param caseSensitive - Whether or not the search should be case sensitive
 * @returns If the string was found
 */
export const matchStrings = (
	haystack: string,
	needle: string,
	caseSensitive = false
): MatchLevel => {
	haystack = haystack.trim().normalize();
	needle = needle.trim().normalize();
	if (!caseSensitive) {
		haystack = haystack.toLowerCase();
		needle = needle.toLowerCase();
	}
	if (haystack === needle) return MatchLevel.Full;
	if (haystack.startsWith(needle)) return MatchLevel.Start;
	if (haystack.endsWith(needle)) return MatchLevel.End;
	if (haystack.includes(needle)) return MatchLevel.Partial;
	return MatchLevel.None;
};

export default matchStrings;
