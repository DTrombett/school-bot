/**
 * Get a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * @param min - The minimum number
 * @param max - The maximum number
 * @returns A random integer between min and max
 */
export const getRandomInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

export default getRandomInt;
