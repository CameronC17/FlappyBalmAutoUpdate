let debug = false;

const {autoUpdater} = require("electron-updater");
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
var fs = require('fs');
let indexWindow;

var scores = [];

app.on('ready', () => {
    indexWindow = new BrowserWindow({width: 800, height: 600});

    //for saving scores
    indexWindow.on('close', (e) => {
        writeFile();
    });

    indexWindow.loadURL(`file://${__dirname}/public/index.html`);

    if (debug)
        devTools(indexWindow);

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
    fs.readFile('app/data/scores.txt', 'utf-8', function (err, data) {
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
    fs.writeFile('app/data/scores.txt', content, function (err) {
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

//update stufffffffffffffffffff
autoUpdater.on('checking-for-update', () => {
  indexWindow.send('autoupdaterfunction', 'Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  indexWindow.send('autoupdaterfunctiontwo', 'Update available.', ev, info);
})
autoUpdater.on('update-not-available', (ev, info) => {
  indexWindow.send('autoupdaterfunctiontwo', 'Update not available.', ev, info);
})
autoUpdater.on('error', (ev, err) => {
  indexWindow.send('autoupdaterfunctiontwo', 'Error in auto-updater.', ev, err);
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  indexWindow.send('autoupdaterfunctiontwo', 'Download progress...', ev, progressObj);
})
autoUpdater.on('update-downloaded', (ev, info) => {
  indexWindow.send('autoupdaterfunctiontwo', 'Update downloaded.  Will quit and install in 5 seconds.', ev, info);
  // Wait 5 seconds, then quit and install
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000)
})
// Wait a second for the window to exist before checking for updates.
setTimeout(function() {
  autoUpdater.checkForUpdates()
}, 1000);
