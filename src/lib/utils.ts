import { WebSocket } from 'ws';

export function getSocketID(socket: WebSocket) {
    /* eslint-disable */
    return `${(<any>socket)._socket.remoteAddress}:${
        (<any>socket)._socket.remotePort
    }`;
    /* eslint-disable */
}

export function checkIfSocketClosed(socket: WebSocket): boolean {
    return (
        socket.readyState === WebSocket.CLOSED ||
        socket.readyState === WebSocket.CLOSING
    );
}
