import type { WebSocket, RawData } from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Application, NextFunction, Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import PTYService from './PTYService';
import {
	getSocketID,
	checkIfSocketClosed,
	printSuccess,
	getTokenFromAuthorizationHeader,
} from './lib/utils';
import { handleMessage } from './handleMessage';
import { createServer } from 'http';
import express, { json, urlencoded } from 'express';
import { join } from 'path';

export interface WebShellOptions {
	token: string;
	port: number;
	host: string;
}

export default class WebShell {
	protected wss: WebSocketServer;
	public ptys: Map<string, PTYService> = new Map();
	private handleMessage: (socket: WebSocket, message: RawData) => void =
		handleMessage;
	private httpServer: Server;
	private webApp: Application;

	constructor(private webShellOptions: WebShellOptions) {
		this.startWebServer();
	}

	private startWebServer(): void {
		this.httpServer = createServer();

		this.webApp = express();

		this.webApp.disable('x-powered-by');
		this.webApp.use(json());
		this.webApp.use(urlencoded({ extended: true }));

		this.webApp.get(
			'*',
			(req: Request, res: Response, next: NextFunction) => {
				if (
					getTokenFromAuthorizationHeader(
						req.headers.authorization
					) !== this.webShellOptions.token
				)
					return res.status(401).send('Invalid token');
				next();
			}
		);

		this.webApp.get('/', (req: Request, res: Response) => {
			res.sendFile(join(__dirname, '../public/index.html'));
		});

		this.webApp.use(express.static(join(__dirname, '../public')));

		this.webApp.get('*', (req: Request, res: Response) => {
			res.status(404).send('404 Not Found');
		});

		this.httpServer.on('request', this.webApp);

		this.startWSS();

		this.httpServer.listen(
			this.webShellOptions.port,
			this.webShellOptions.host,
			null,
			() => {
				printSuccess(
					`WebShell listening on ${this.webShellOptions.host}:${this.webShellOptions.port}`
				);
			}
		);
	}

	private startWSS(): void {
		this.wss = new WebSocketServer({ noServer: true });

		this.wss.on('connection', (socket, request) => {
			this.authenticateSocket(socket, request);
			if (checkIfSocketClosed(socket)) return;

			const socketID = getSocketID(socket);
			const ptyService = new PTYService(socket);
			this.ptys.set(socketID, ptyService);
			this.setSocketEvents(socket);
			socket.onclose = () => {
				this.ptys.get(socketID).killPty();
				this.ptys.delete(socketID);
			};
		});

		this.httpServer.on('upgrade', (request, socket, head) => {
			this.wss.handleUpgrade(request, socket, head, (socket) => {
				this.wss.emit('connection', socket, request);
			});
		});
	}

	private authenticateSocket(
		socket: WebSocket,
		request: IncomingMessage
	): void {
		const token: string = getTokenFromAuthorizationHeader(
			request.headers.authorization
		);
		if (!token) return socket.close(1011, 'No token');
		if (token !== this.webShellOptions.token)
			return socket.close(1011, 'Invalid token');
	}

	private setSocketEvents(socket: WebSocket): void {
		socket.on('message', (data) => {
			this.handleMessage(socket, data);
		});
	}
}
