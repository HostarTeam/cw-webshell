import WebShell from './WebShell';

function main() {
    const args = process.argv.slice(2);
    new WebShell({
        token: args[0],
        port: Number(args[1]),
        host: args[2],
    });
}

if (require.main === module) main();
