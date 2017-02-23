const remote = require('electron').remote;
const {ipcRenderer} = require('electron');

window.onload = function() {

    //button for a new game
    var button = document.getElementById('playGame');
    button.addEventListener('click', () => {
        ipcRenderer.send('startGame');
    }, false);

    var scoresBtn = document.getElementById('refreshScores');
    scoresBtn.addEventListener('click', () => {
        ipcRenderer.send('getScores');
    })

    ipcRenderer.send('getScores');
}

ipcRenderer.on('returnScores', (e, retScores) => {
    var ul = document.getElementById("hiscores");
    ul.innerHTML = '';

    //sort scores in order
    let scores = retScores.sort(function (a, b) {return b - a;});
    for (var i = 0; i < scores.length; i++) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode("Pos " + (i + 1) + ": " + scores[i]));
        ul.appendChild(li);
    }
});

ipcRenderer.on('autoupdaterfunction', (e, type) => {
    document.getElementById("autoupdatelogger").value = type +'\n\n' + document.getElementById("autoupdatelogger").value + '\n-------------------------------------------';
});

ipcRenderer.on('autoupdaterfunctiontwo', (e, type, x, y) => {
    console.log(type);
    console.log(x);
    console.log(y);
    document.getElementById("autoupdatelogger").value = type + "\n" + x + "\n" + y + '\n\n' + document.getElementById("autoupdatelogger").value + '\n-------------------------------------------';
});
