const express = require("express")();
const http = require("http").Server(express);
const fs = require("fs");
const socketio = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const userFile = "files/users.json";

let notes = [];
let userID = "-1";

socketio.on("connection", (socket) => {
    socket.on("login", ({ user, pass}) => {
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        let users = JSON.parse(data);
        if (users.includes(element => element.username == user && element.password == pass)) {
          let user = users.find(element => element.username == user && element.password == pass);
          userID = user.id;
        }
      });
    });

    socket.on("logout", () => {
      userID = "-1";
      notes = [];
    });

    socket.on("reg", ({ name, pass, first, last, mail}) => {
      let user = {
        username: name,
        password: pass,
        first_name: first,
        last_name: last,
        email: mail,
        id: crypto.randomUUID
      };
      
      let users = [];
      fs.readFile(userFile, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        users = JSON.parse(data);
      });

      users.push(user);
      let data = JSON.stringify(users);
      fs.writeFile(file, data, 'utf-8', err => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });

    socket.on("fetchNotes", () => {
      if (userID == "-1") {
        return;
      }
      fs.readFile("files/user-" + userID + ".json", 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        notes = JSON.parse(data);
        socketio.emit("notelist", notes);
      });
    });

    socket.on("addNote", (text) => {
      notes.push(text);
      let data = JSON.stringify(notes);
      fs.writeFile("files/user-" + userID + ".json", data, 'utf-8', err => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
  
http.listen(3000, () => {
  console.log("Server up and running...");
});