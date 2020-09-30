const socket = new WebSocket("wss://localhost:8080/ws");
socket.addEventListener("message", (event) => {
  if (event.data === "UPDATE") {
    location.reload();
  }
});
