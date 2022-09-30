import { isValidIP, printFatal } from './lib/utils';
import WebShell from './WebShell';

function handleArgsError(message: string): void | never {
    printFatal(message);
    console.log('Usage: ./cw-webshell <token> <port> <host>');
    process.exit(1);
}

function main() {
    const args = process.argv.slice(2);
    if (args.length !== 3)
        handleArgsError(
            'Invalid number of arguments. Expected 3, got ' + args.length
        );

    let [token, port, host] = args;
    if (!Number.isInteger(Number(port)))
        handleArgsError('Invalid port. Expected integer, got ' + port);

    if (parseInt(port) < 0 || parseInt(port) > 65535)
        handleArgsError('Invalid port. Expected 0-65535, got ' + port);

    if (host === 'localhost') host = '127.0.0.1';

    if (!isValidIP(host))
        handleArgsError('Invalid host. Expected valid IP, got ' + host);

    new WebShell({
        token,
        port: parseInt(port),
        host,
    });
}

if (require.main === module) main();
