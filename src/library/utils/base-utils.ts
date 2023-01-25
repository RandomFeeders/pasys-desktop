import g from 'glob';

export async function glob(pattern: string): Promise<string[]> {
	return new Promise((res, rej) => {
		g(pattern.replaceAll('\\', '/'), (err, matches) => {
			if (err) rej(err);
			res(matches);
		});
	});
}

export function getCaller(shift: number = 0): NodeJS.CallSite {
	const backupPrepareStackTrace = Error.prepareStackTrace;

	Error.prepareStackTrace = (_, stack) => stack;
	const error = new Error();
	const stack: NodeJS.CallSite[] = error.stack as any;

	Error.prepareStackTrace = backupPrepareStackTrace;

	stack.shift(); // Back to caller
	stack.shift(); // Removed caller from stack

	for (let i = 0; i < shift; i++) {
		stack.shift();
	}

	return stack[0];
}
