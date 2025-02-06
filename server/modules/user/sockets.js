module.exports = (io, socket, clients) => {
  socket.on('userAddToSocketSessionList', userId => {
    const isUserAdded = clients.find(client => client.userId === userId)
    if (!isUserAdded) {
      clients.push({
        userId,
        socketId: socket.id
      })
    }
  })

  socket.on('userUpdate', userId => {
    const client = clients.find(client => client.userId == userId)
    socket.to(client.socketId).emit('userSubscribe')
  })
}