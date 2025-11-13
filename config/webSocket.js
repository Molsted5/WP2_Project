const WebSocket = require('ws');
let wss;

function initWebSocket(server) {
  if (!wss) {
    wss = new WebSocket.Server({ server });
    console.log("WebSocket server started");
  }
  return wss;
}

function getWSS() {
  if (!wss) throw new Error("WebSocket not initialized yet");
  return wss;
}

module.exports = { initWebSocket, getWSS };
