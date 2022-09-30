import { generateToken, parsePort, validateHost } from './lib/utils';
import WebShell from './WebShell';
import { program } from 'commander';

function main() {
	program
		.name('ws-webshell')
		.description('Container Workspaces WebShell service')
		.version('1.0.0');

	program
		.option('-t, --token <string>', 'The token to use for authentication')
		.option('-p, --port <number>', 'The port to listen on', parsePort, 8444)
		.option(
			'-h, --host <string>',
			'The host to connect to',
			validateHost,
			'0.0.0.0'
		)
		.action((opts: { token: string; port: number; host: string }) => {
			if (!opts.token) {
				const token = generateToken(32);
				console.log('Generated token: ' + token);
				opts.token = token;
			}

			new WebShell({
				token: opts.token,
				port: opts.port,
				host: opts.host,
			});
		})
		.parse();
}

if (require.main === module) main();
