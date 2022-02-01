/**
 * Capitalize a string.
 */
export const capitalize = (str: string): Capitalize<typeof str> =>
	str.charAt(0).toUpperCase() + str.slice(1);

export default capitalize;
