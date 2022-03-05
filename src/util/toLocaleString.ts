/**
 * Formats a date or a number as a string using the provided locale.
 * @param element - The element to format
 * @param lng - The language to use
 * @returns The formatted element
 */
export const toLocaleString = (element: Date | number, lng?: string) => {
	if (typeof element !== "number" && !(element instanceof Date))
		throw new TypeError("Argument 'element' must be a number or a Date");
	if (lng !== undefined && typeof lng !== "string")
		throw new TypeError("Argument 'lng' must be a string");
	try {
		return element.toLocaleString(lng);
	} catch (error) {
		return element.toLocaleString();
	}
};

export default toLocaleString;
