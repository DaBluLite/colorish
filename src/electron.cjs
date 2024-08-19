"use strict";
// @ts-check
const windowStateManager = require("electron-window-state");
const serve = require("electron-serve");
const path = require("path");
const { BrowserWindow, app, ipcMain, shell } = require("electron");
const { WebSocket, WebSocketServer } = require("ws");
try {
    require("electron-reloader")(module);
}
catch (e) {
    console.error(e);
}
let MID;

const wsManager = new WebSocketServer({ port: 6124, host: "127.0.0.1" });

/** @typedef {Object} BoundClient
 * @property {string} boundKey
 * @property {boolean} isManager
 * @property {Array<string>} complications
 * @property {Array<{ name: string, url: string }>} online
 * @property {Array<{ name: string, colorways: any[] }>} offline
*/

/** @typedef {Object} WsClient
 * @property {(event: string, data: object) => void} dispatch
 * @property {{get: () => string; set: (boundKey: string) => void}} boundKey
 * @property {{get: () => boolean; set: (isManager: boolean) => void}} isManager
 * @property {{get: () => BoundClient; set: (boundClient: BoundClient) => void}} boundClient
*/

/** @type {Array<WebSocket & WsClient>} */
const wsClients = [];

function getWebClients() {
    const webClients = {};
    wsClients.forEach((ws, i) => {
        if(ws.boundKey.get()) webClients[ws.boundKey.get()] = {
            ...ws.boundClient.get(),
            wsIndex: i
        }
    })
    return webClients;
}

wsManager.on("connection", function connection(wss) {
    /** @type {BoundClient} */
    let boundClient = {};
    /** @type {WebSocket & WsClient} */
    const ws = Object.assign(wss, {
        dispatch: (event, data = {}) => {
            wss.send(JSON.stringify({
                type: event,
                ...data
            }))
        },
        boundKey: {
            /** @returns {string} */
            get: () => boundClient.boundKey,
            /** @param {string} b */
            set: (b) => {
                boundClient.boundKey = b
                mainWindow.webContents.send("update-bound-clients", { clients: getWebClients() });
            }
        },
        isManager: {
            get: () => boundClient.isManager,
            set: (im, dnu) => {
                boundClient.isManager = im
                if (im && !dnu) {
                    wss.send(JSON.stringify({ type: "complication:manager-role:granted" }));
                }
                mainWindow.webContents.send("update-bound-clients", { clients: getWebClients() });
            }
        },
        boundClient: {
            get: () => boundClient,
            set: (e) => {
                boundClient = e;
                mainWindow.webContents.send("update-bound-clients", { clients: getWebClients() });
            }
        },
        /** @param {{ id: string, source: string, sourceType: string, colors?: { accent?: string, primary?: string, secondary?: string, tertiary?: string } }} activeColorwayObject */
        changeColorway: (activeColorwayObject) => wss.send(JSON.stringify({ type: "change-colorway", active: activeColorwayObject })),
        removeColorway: () => wss.send(JSON.stringify({ type: "remove-colorway" })),
    });

    const wsPos = wsClients.push(ws) - 1;

    function onwsexit() {
        wsClients.splice(wsPos, 1);
            if (ws.boundKey.get()) {
                boundClient = {};
                mainWindow.webContents.send("update-bound-clients", { clients: getWebClients() });
            }

            ipcMain.off("sendToWsClient", (data) => {
                const boundKey = (typeof data.boundKey == "string" ? data.boundKey : JSON.stringify(data.boundKey)) || null;
                        if(boundKey && boundKey == ws.boundKey.get()) {
                            ws.send(JSON.stringify(data))
                            switch (data.type) {
                                case "complication:manager-role:granted":
                                    ws.isManager.set(true, true);
                                    return;
                                case "complication:manager-role:revoked":
                                    ws.isManager.set(false, true);
                                    return;
                            }
                        }
            })
    }

    Object.assign(ws, {
        onclose: onwsexit,
        onerror: onwsexit,
        onmessage: ({ data: dataRaw }) => {
            const data = JSON.parse(dataRaw);
            const { type } = data;
            switch (type) {
                case "client-sync-established":
                    ws.boundClient.set({
                        boundKey: typeof data.boundKey == "string" ? data.boundKey : JSON.stringify(data.boundKey),
                        complications: data.complications,
                    })
                    ipcMain.on("sendToWsClient", (_, data) => {
                        const boundKey = (typeof data.boundKey == "string" ? data.boundKey : JSON.stringify(data.boundKey)) || null;
                        if(boundKey && boundKey == ws.boundKey.get()) {
                            ws.send(JSON.stringify(data))
                            switch (data.type) {
                                case "complication:manager-role:granted":
                                    ws.isManager.set(true, true);
                                    return;
                                case "complication:manager-role:revoked":
                                    ws.isManager.set(false, true);
                                    return;
                            }
                        }
                    })
                    return;
                case "complication:remote-sources:init":
                    ws.boundClient.set(Object.assign(ws.boundClient.get(), { online: data.online, offline: data.offline }))
                    return;
                case "complication:manager-role:send-colorway":
                    if (ws.isManager.get()) mainWindow.webContents.send("complication:manager-role:receive-colorway", data.active);
                    return;
                case "complication:manager-role:request":
                    if (!ws.isManager.get()) mainWindow.webContents.send("complication:manager-role:request", data.boundKey);
                    return;
            }
        }
    })

    mainWindow.webContents.send("client-connected");
    ws.dispatch("manager-connection-established", { MID });
});
const serveURL = serve({ directory: "." });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;
function createWindow() {
    let windowState = windowStateManager({ defaultWidth: 800, defaultHeight: 600 });
    const mainWindow = new BrowserWindow({
        backgroundColor: "#090909",
        titleBarStyle: "hidden",
        autoHideMenuBar: true,
        trafficLightPosition: {
            x: 17,
            y: 32
        },
        minHeight: 450,
        minWidth: 500,
        webPreferences: {
            enableRemoteModule: true,
            contextIsolation: true,
            nodeIntegration: true,
            spellcheck: false,
            devTools: dev,
            preload: path.join(__dirname, "preload.cjs")
        },
        frame: false,
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        title: "Colorish",
        icon: "../colorish.png"
    });
    windowState.manage(mainWindow);
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.focus();
    });
    mainWindow.on("close", () => {
        windowState.saveState(mainWindow);
    });
    return mainWindow;
}
function loadVite(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
        console.log("Error loading URL, retrying", e);
        setTimeout(() => {
            loadVite(port);
        }, 200);
    });
}
function createMainWindow() {
    mainWindow = createWindow();
    mainWindow.once("close", () => {
        mainWindow = null;
    });
    if (dev)
        loadVite(port);
    else
        serveURL(mainWindow);
}
app.once("ready", createMainWindow);
app.on("activate", () => {
    if (!mainWindow) {
        createMainWindow();
    }
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});
ipcMain.on("minimize", () => mainWindow.minimize());
ipcMain.on("close", () => mainWindow.close());
ipcMain.on("toggleMaximize", () => {
    if (!mainWindow.isMaximized()) {
        mainWindow.maximize();
    }
    else {
        mainWindow.restore();
    }
});
ipcMain.on("colorway-updated", (event, { activeColorwayObject }) => {
    wsClients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.changeColorway(activeColorwayObject);
        }
    });
});
ipcMain.on("colorway-removed", (event, count) => {
    wsClients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.removeColorway();
        }
    });
});
ipcMain.on("ui-online", (_, { UUID }) => {
    MID = String(UUID);
    mainWindow.webContents.send("update-bound-clients", { clients: getWebClients() });
});
ipcMain.on("open-external", (_, url) => {
    shell.openExternal(url);
});
ipcMain.on("complication:manager-role:manager-updated", (_, boundKey) => {
    const wsClient = wsClients.filter(ws => (typeof ws.boundKey.get() == "string" ? ws.boundKey.get() : JSON.stringify(ws.boundKey.get())) == JSON.stringify(boundKey))[0]
    wsClient.isManager.set(true);
});