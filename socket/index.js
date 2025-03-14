let io;

const initSocket = (socketIo) => {
  io = socketIo;
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("admin_connected", () => {
      socket.join("admin-room");
      console.log("Admin connected for notifications:", socket.id);
    });
    
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized");
    return null;
  }
  return io;
};

export default initSocket;