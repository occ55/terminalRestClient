export async function Wait(Time: number) {
	return new Promise(res => setTimeout(res, Time));
}

export function NeverEnd() {
	setTimeout(() => {
	}, Math.pow(2, 20));
}