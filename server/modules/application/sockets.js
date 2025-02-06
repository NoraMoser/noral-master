module.exports = (io, socket, clients) => {
  socket.emit('applicationSevicesRestart')
}