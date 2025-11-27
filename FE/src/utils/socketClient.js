// let socket = null;

// export const  initSocket = () => {
//   if (!socket || socket.readyState === WebSocket.CLOSED) {
//     const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
//     const wsUrl = `${protocol}//${window.location.host}/ws`;

//     socket = new WebSocket(wsUrl);

//     socket.onopen = () => {
//       console.log("WebSocket connected to server");
//     };

//     socket.onmessage = (msg) => {
//       try {
//         const parsed = JSON.parse(msg.data);
//         console.log("WS message received:", parsed);
//       } catch (err) {
//         console.error("Invalid WS message", msg.data);
//       }
//     };

//     socket.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     socket.onclose = () => {
//       console.log("WebSocket closed");
//     };
//   }

//   return socket;
// };

