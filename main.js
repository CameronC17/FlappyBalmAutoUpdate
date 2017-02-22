let debug = true;

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
var fs = require('fs');

var scores = [];

app.on('ready', () => {
    let window = new BrowserWindow({width: 800, height: 600});
    window.loadURL(`file://${__dirname}/public/index.html`);

    //for saving scores
    window.on('close', (e) => {
        writeFile();
    })

    if (debug)
        devTools(window);
})

ipcMain.on('startGame', (e) => {
    let window = new BrowserWindow();
    window.setFullScreen(true);
    window.loadURL(`file://${__dirname}/public/game.html`);
});

ipcMain.on('getScores', (e) => {
    e.sender.send('returnScores', scores);
});

ipcMain.on('addScore', (e, score) => {
    scores.push(score);
});

function devTools(window) {
    window.webContents.openDevTools();
}

readFile();

function readFile() {
    fs.readFile('data/scores.txt', 'utf-8', function (err, data) {
          if(err){
              console.log("An error ocurred reading the file :" + err.message);
              return;
          }
          console.log("Scores loaded!");
          parseScores(data);
    });
}

function writeFile() {
    let content = encodeScores();
    fs.writeFile('data/scores.txt', content, function (err) {
      if(err){
            console.log("An error ocurred updating the file: "+ err.message);
            return;
      }
      alert("Scores have been saved.");
 });
}

//returns a text string with all the scores
function encodeScores() {
    var rtnString = "";
    for (let score of scores) {
        rtnString += score.toString();
        rtnString += ",";
    }
    return rtnString;
}

//accepts raw unseperated text with data in it and parses to scores array
function parseScores(raw) {
    var number = "";
    for (var i = 0; i < raw.length - 1; i++) {
        if (raw[i] != ",")
            number += raw[i];
        else {
            scores.push(parseInt(number));
            number = "";
        }
    }
    scores.push(parseInt(number));
}
