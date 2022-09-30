import type WebShell from './WebShell';
import type { WebSocket, RawData } from 'ws';
import MessageRouting from './MessageRouting';

export function handleMessage(
	this: WebShell,
	socket: WebSocket,
	message: RawData
): void {
	try {
		const data = JSON.parse(message.toString());
		const dataMessage = data.data;

		const handle = MessageRouting[data.action];

		if (handle) handle(this, socket, dataMessage);
	} catch (err: unknown) {
		if (err instanceof SyntaxError) {
			console.error(
				`Could not parse command content from user in webshell. Content: ${message.toString()} `
			);
		}
	}
}
