/**
 * Find how many times a word occurs in a string.
 * @param str - The string to search in
 * @param word - The word to search for
 * @returns The number of times the word occurs in the string
 */
export const occurrences = (str: string, subStr: string) => {
	if (subStr.length === 0) return str.length + 1;
	const { length } = subStr;
	let n = 0,
		pos = str.indexOf(subStr, 0);

	while (pos >= 0) {
		++n;
		pos = str.indexOf(subStr, pos + length);
	}
	return n;
};

export default occurrences;
