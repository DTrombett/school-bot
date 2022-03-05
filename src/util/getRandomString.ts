const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a random string of the given length.
 * @param length - The length of the string to generate
 * @returns A random string of the given length
 */
export const getRandomString = (length: number): string => {
	if (typeof length !== "number")
		throw new TypeError("Argument 'length' must be a number");
	let result = "";

	for (let i = 0; i < length; i++)
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	return result;
};

export default getRandomString;
