// import { WebSocketServer } from "ws";

// const server = new WebSocketServer({
//     port:7000
//     });
//     console.log(" WebSocket server starting on ws://localhost:7000");

// server.on('connection', (socket) => {
//     console.log('client connected');

//     socket.on('message', (message) =>{
//         console.log(`Received ${message}`);
//         socket.send(`Server: ${message}`);
//     });

//     socket.on ('close', ()=>{
//         console.log(` websocket server is running in ws://localhost:7000`);
//     })
// })