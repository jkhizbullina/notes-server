const express = require("express")();
const crypto = require('node:crypto');
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
    socket.on("login", (name, pass) => {
      fs.readFile(userFile, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        let users = JSON.parse(data);
        try {
          let oldUser = users.find(element => element.username === name && element.password == pass);
          userID = oldUser.id;
          socketio.emit("userConfirmation", true);
        }
        catch {
          console.log("user not found");
          socketio.emit("userConfirmation", false);
        }
      });
    });

    socket.on("confirmUser", () => {
      let confirmed = true;
      if (userID == "-1") {
        confirmed = false;
      }
      socketio.emit("userConfirmation", confirmed);
    }) 

    socket.on("logout", () => {
      userID = "-1";
      notes = [];
      socketio.emit("logoutConfirmed");
    });

    socket.on("reg", (name, pass, first, last, mail) => {
      let user = {
        username: name,
        password: pass,
        first_name: first,
        last_name: last,
        email: mail,
        id: crypto.randomUUID()
      };
      
      let users = [];
      fs.readFile(userFile, 'utf-8', (err, oldData) => {
        if (err) {
          console.error(err);
          return;
        }
        users = JSON.parse(oldData);
        users.push(user);
        let data = JSON.stringify(users);
        fs.writeFile(userFile, data, 'utf-8', err => {
          if (err) {
            console.error(err);
            return;
          }
        });
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
        socketio.emit("noteslist", notes);
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