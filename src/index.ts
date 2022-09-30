import { parsePort, validateHost } from './lib/utils';
import WebShell from './WebShell';
import { program } from 'commander';

function main() {
	program
		.name('ws-webshell')
		.description('Container Workspaces WebShell service')
		.version('1.0.0');

	program
		.argument('<token>', 'The token to use for authentication')
		.option('-p, --port <number>', 'The port to listen on', parsePort, 8444)
		.option(
			'-h, --host <string>',
			'The host to connect to',
			validateHost,
			'0.0.0.0'
		)
		.action((token, opts: { port: number; host: string }) => {
			new WebShell({
				token,
				port: opts.port,
				host: opts.host,
			});
		})
		.parse();
}

if (require.main === module) main();
