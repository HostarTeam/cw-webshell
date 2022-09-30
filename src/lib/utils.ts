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

enum Colors {
    Reset = '\x1b[0m',
    ErrorRed = '\x1b[31m',
    WarningYellow = '\x1b[33m',
    SuccessGreen = '\x1b[32m',
    FatalPurple = '\x1b[35m',
}

export function printError(message): void {
    console.log(`${Colors.ErrorRed}Error: ${Colors.Reset}${message}`);
}

export function printWarning(message): void {
    console.log(`${Colors.WarningYellow}Warning: ${Colors.Reset}${message}`);
}

export function printSuccess(message): void {
    console.log(`${Colors.SuccessGreen}Success: ${Colors.Reset}${message}`);
}

export function printFatal(message): void {
    console.log(`${Colors.FatalPurple}Fatal: ${Colors.Reset}${message}`);
}

export function isValidIP(ip: string): boolean {
    return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/m.test(ip);
}
