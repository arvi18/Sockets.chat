const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser } = require("./utils/users");

const BOTNAME = "sys";

const app = express();
const server = http.createServer(app);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// io
const io = socketio(server);

// run when someone connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    // when a user connects
    socket.emit("message", formatMessage(BOTNAME, "Welcome to room!"));

    // broadcast when a user connects (everbody except joining user)
    socket.emit("message", "lets welcum an user!");
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(BOTNAME, "Lets welcome " + user.username));

    // send to everybody
    // io.emit()

    // listen to chat message
    socket.on("chatMessage", (msg) => {
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
  });

  // on dc
  // weird its inside connection lmao
  socket.on("disconnect", () => {
    io.emit("message", formatMessage(BOTNAME, "user has left the chat!"));
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log("connected on " + PORT);
});
