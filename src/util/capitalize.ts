/**
 * Capitalize a string.
 */
export const capitalize = (str: string): Capitalize<typeof str> => {
	if (typeof str === "string")
		return str.charAt(0).toUpperCase() + str.slice(1);
	throw new TypeError("Argument 'str' must be a string");
};

export default capitalize;
