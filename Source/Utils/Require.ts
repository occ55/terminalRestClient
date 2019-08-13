export function reqUncached(module: string) {
	delete require.cache[require.resolve(module)];
	return require(module);
}