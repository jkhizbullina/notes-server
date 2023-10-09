const express = require("express")();
const http = require("http").Server(express);
const fs = require("fs");
const socketio = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const file = "files/wordlist.json";

let words = [];

socketio.on("connection", (socket) => {
    socket.on("fetchWords", () => {
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        words = JSON.parse(data);
        socketio.emit("wordlist", words);
      });
    });

    socket.on("addWord", (rus, eng) => {
      var word = { russian: rus, english: eng };
      words.push(word);
      var data = JSON.stringify(words);
      fs.writeFile(file, data, 'utf-8', err => {
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