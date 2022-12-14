import type { WebSocket } from 'ws';
import type WebShell from './WebShell';
import { getSocketID, printError } from './lib/utils';

export default class MessageRouting {
	[key: string]: (ws: WebShell, socket: WebSocket, data?: unknown) => void;

	public static disconnect(ws: WebShell, socket: WebSocket): void {
		socket.close();
	}

	public static input(ws: WebShell, socket: WebSocket, data: string): void {
		const socketID = getSocketID(socket);

		ws.ptys.get(socketID).write(data);
	}

	public static resize(
		ws: WebShell,
		socket: WebSocket,
		data: { cols: number; rows: number }
	): void {
		const socketID = getSocketID(socket);
		try {
			ws.ptys.get(socketID).resizePty(data.cols, data.rows);
		} catch (err) {
			printError(err);
		}
	}
}
