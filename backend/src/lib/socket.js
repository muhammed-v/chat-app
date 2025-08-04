import { Server } from "socket.io";
import http from "http"; //this module is built in to node
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]; //given the userid, return the socketid
}

// used to store online users
const userSocketMap = {}; // stored in the format:{userId: socketId}

//listen for incoming connections
io.on("connection", (socket) => {//socket is the user that just connected
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); //can be anything in place of getOnlineUsers

  socket.on("disconnect", () => { //lisening for a disconnect event. for listening, the go to method is socket.on
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };