const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	window: {
		minimize: () => ipcRenderer.send("minimize"),
		toggleMaximize: () => ipcRenderer.send("toggleMaximize"),
		close: () => ipcRenderer.send("close")
	},
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data);
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
	sendToClient: (data) => {
		ipcRenderer.send("sendToWsClient", data);
	},
	openExtenralPage: (url) => {
		ipcRenderer.send("open-external", url);
	}
});