import { WebSocketServer } from "ws";

let wss;

export function initSocket(server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    console.log(" Client connected to WebSocket server");

    socket.on("close", () => {
      console.log(" Client disconnected");
    });
  });

  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  };
}

export function broadcastScore(score) {
  if (wss) {
     
    wss.clients.forEach((client, index) => {
      if (client.readyState === 1) {
               client.send(JSON.stringify({ type: "new_score", data: score }));
        sentCount++;
      } 
    });
  } 
}
