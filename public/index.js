/* eslint-env browser, jquery */
/* eslint-disable */
!(function (e, t) {
	'object' == typeof exports && 'object' == typeof module
		? (module.exports = t())
		: 'function' == typeof define && define.amd
		? define([], t)
		: 'object' == typeof exports
		? (exports.FitAddon = t())
		: (e.FitAddon = t());
})(self, function () {
	return (() => {
		'use strict';
		var e = {
				775: (e, t) => {
					Object.defineProperty(t, '__esModule', { value: !0 }),
						(t.FitAddon = void 0);
					var r = (function () {
						function e() {}
						return (
							(e.prototype.activate = function (e) {
								this._terminal = e;
							}),
							(e.prototype.dispose = function () {}),
							(e.prototype.fit = function () {
								var e = this.proposeDimensions();
								if (e && this._terminal) {
									var t = this._terminal._core;
									(this._terminal.rows === e.rows &&
										this._terminal.cols === e.cols) ||
										(t._renderCoordinator.clear(),
										this._terminal.resize(e.cols, e.rows));
								}
							}),
							(e.prototype.proposeDimensions = function () {
								if (
									this._terminal &&
									this._terminal.element &&
									this._terminal.element.parentElement
								) {
									var e = this._terminal._core;
									if (
										0 !==
											e._renderCoordinator.dimensions
												.actualCellWidth &&
										0 !==
											e._renderCoordinator.dimensions
												.actualCellHeight
									) {
										var t = window.getComputedStyle(
												this._terminal.element
													.parentElement
											),
											r = parseInt(
												t.getPropertyValue('height')
											),
											i = Math.max(
												0,
												parseInt(
													t.getPropertyValue('width')
												)
											),
											n = window.getComputedStyle(
												this._terminal.element
											),
											o =
												r -
												(parseInt(
													n.getPropertyValue(
														'padding-top'
													)
												) +
													parseInt(
														n.getPropertyValue(
															'padding-bottom'
														)
													)),
											a =
												i -
												(parseInt(
													n.getPropertyValue(
														'padding-right'
													)
												) +
													parseInt(
														n.getPropertyValue(
															'padding-left'
														)
													)) -
												e.viewport.scrollBarWidth;
										return {
											cols: Math.max(
												2,
												Math.floor(
													a /
														e._renderCoordinator
															.dimensions
															.actualCellWidth
												)
											),
											rows: Math.max(
												1,
												Math.floor(
													o /
														e._renderCoordinator
															.dimensions
															.actualCellHeight
												)
											),
										};
									}
								}
							}),
							e
						);
					})();
					t.FitAddon = r;
				},
			},
			t = {};
		return (function r(i) {
			if (t[i]) return t[i].exports;
			var n = (t[i] = { exports: {} });
			return e[i](n, n.exports, r), n.exports;
		})(775);
	})();
});
/* eslint-enable */

class TerminalUI {
	constructor(socket) {
		// eslint-disable-next-line no-undef
		this.terminal = new Terminal({
			windowOptions: {
				fullscreenWin: true,
				maximizeWin: true,
			},
		});

		/* You can make your terminals colorful :) */
		this.terminal.setOption('theme', {
			background: '#202B33',
			foreground: '#F5F8FA',
		});

		this.socket = socket;

		this.loadAddons();
		this.resize(); // Resize terminal to fit the window.
		this.manageWindowResizing();
	}

	loadAddons() {
		// eslint-disable-next-line no-undef
		this.fitAddon = new FitAddon.FitAddon();
		this.terminal.loadAddon(this.fitAddon);
	}

	resize() {
		var counter = 0;
		const interval = setInterval(() => {
			if (counter == 100) {
				clearInterval(interval);
				return this.notifyUserError(
					interval,
					'Could not establish a connection'
				);
			}
			if (this.socket.readyState) {
				clearInterval(interval);
				this.fitAddon.fit();
				return this.tellPTYToResize();
			}
			counter++;
		}, 30);

		this.terminal.onResize(() => {
			this.fitAddon.fit();
			this.tellPTYToResize();
		});
	}

	/**
	 * Notify user about an error. This will print the error nicely to the terminal.
	 * @param {*} interval
	 * @param {string} message
	 */
	notifyUserError(interval, message) {
		clearInterval(interval);
		this.terminal.write(`[${message}]\r\n`);
	}

	/**
	 * Start listening on an event that will resize the terminal when the window is resized.
	 */
	manageWindowResizing() {
		window.addEventListener('resize', () => {
			this.fitAddon.fit();
			this.tellPTYToResize();
		});
	}

	/**
	 * Function that will tell the PTY to resize.
	 */
	tellPTYToResize() {
		const resizeAction = {
			action: 'resize',
			data: {
				rows: this.terminal.rows,
				cols: this.terminal.cols,
			},
		};

		this.socket.send(JSON.stringify(resizeAction));
	}

	/**
	 * Attach event listeners for terminal UI and socket.io client
	 */
	startListening() {
		window.onbeforeunload = () => {
			this.socket.close();
		};
		this.terminal.onData((data) => this.sendInput(data));
		this.socket.addEventListener('message', (event) => {
			try {
				// When there is data from PTY on server, print that on Terminal.
				const data = JSON.parse(event.data);
				switch (data.action) {
					case 'output':
						this.write(data.data);
						break;
					case 'end':
						this.terminal.write(
							'[Connection has been terminated]\r\n'
						);
						this.socket.close();
						break;
					default:
						throw new Error(`Unknown action ${data.action}`);
				}
			} catch (e) {
				console.error(e);
			}
		});
	}

	/**
	 * Print something to terminal UI.
	 */
	write(text) {
		this.terminal.write(text);
	}

	/**
	 * Send whatever you type in Terminal UI to PTY process in server.
	 * @param {string} input Input to send to server
	 */
	sendInput(input) {
		const inputAction = { action: 'input', data: input };
		this.socket.send(JSON.stringify(inputAction));
	}

	/**
	 * The function will attach the terminal UI to a DOM element.
	 * container is a HTMLElement where xterm can attach terminal ui instance.
	 * div#terminal-container in this example.
	 * @param {HTMLElement} container
	 */
	attachTo(container) {
		this.terminal.open(container);
	}

	/**
	 * Function will clear the terminal's content.
	 */
	clear() {
		this.terminal.clear();
	}
}

const serverAddress = `${
	window.location.protocol === 'https:' ? 'wss' : 'ws'
}://${window.location.host}/`;

/**
 * Create a websocket client and connect to the server.
 * @param {string} serverAddress The server address to connect to.
 * @returns {Promise<WebSocket>} The websocket client.
 */
function connectToSocket(serverAddress) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(serverAddress);
		socket.onopen = () => resolve(socket);
		socket.onerror = (e) => reject(e);
	});
}

function startTerminal(container, socket) {
	// Create an xterm.js instance.
	const terminal = new TerminalUI(socket);

	// Attach created terminal to a DOM element.
	terminal.attachTo(container);

	// When terminal attached to DOM, start listening for input, output events.
	// Check TerminalUI startListening() function for details.
	disableControl(82);
	disableControl(84);
	disableControl(85);
	disableControl(87);
	terminal.startListening();
}

/**
 * Start the terminal UI after establishing a connection to the server.
 */
function start() {
	const container = document.getElementById('terminal-container');

	connectToSocket(serverAddress)
		.then((socket) => {
			startTerminal(container, socket);
		})
		.catch((e) => {
			console.error(e);
			alert('Could not connect to server');
		});
}

window.addEventListener('DOMContentLoaded', () => {
	start();
});

/**
 * The function will disable a default behavior of a key.
 * @param {number} asciiNumber The ascii number of the key to disable.
 */
function disableControl(asciiNumber) {
	$(document).ready(function () {
		$(document).on('keydown', function (e) {
			e = e || window.event;
			if (e.ctrlKey) {
				var c = e.which || e.keyCode;
				if (c == asciiNumber) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
		});
	});
}
