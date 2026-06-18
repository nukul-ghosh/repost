let io;

module.exports = {
  initIO: (socketIO) => {
    io = socketIO;
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};
