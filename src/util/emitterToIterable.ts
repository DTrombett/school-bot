import EventEmitter from "node:events";

/**
 * Convert an event emitter to an async iterable.
 * @param emitter - The event emitter to convert
 * @param event - The event to listen for
 * @returns An async iterable that emits the events
 */
export const emitterToIterable = <
	E extends EventEmitter,
	N extends Parameters<E["on"]>[0] = Parameters<E["on"]>[0],
	T extends any[] = E["on"] extends (
		event: N,
		listener: (...args: infer A) => any
	) => void
		? A
		: never
>(
	emitter: E,
	event: N,
	onReturn?: (emitter: E) => void
): AsyncIterable<T> => {
	if (!(emitter instanceof EventEmitter))
		throw new TypeError("Argument 'emitter' must be an EventEmitter");
	if (onReturn && typeof onReturn !== "function")
		throw new TypeError("Argument 'onReturn' must be a function");
	return {
		[Symbol.asyncIterator]() {
			return {
				next() {
					return new Promise<IteratorYieldResult<T>>((resolve) => {
						emitter.once(event, (...args) => {
							resolve({ value: args as T, done: false });
						});
					});
				},
				return() {
					onReturn?.(emitter);
					return Promise.resolve({ value: undefined, done: true });
				},
			};
		},
	};
};

export default emitterToIterable;
