const path = require('path')
const glob = require('glob')
const http = require('http')
const fs = require('fs')
const electron = require('electron')
//const autoUpdater = require('./auto-updater')

const BrowserWindow = electron.BrowserWindow
const app = electron.app

// Quit when all windows are closed.
app.on('window-all-closed', function () {
 if (process.platform != 'darwin') {
   app.quit();
 }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {

 // Create the browser window.
 mainWindow = new BrowserWindow({
   width: 1024,
   height: 768,
   toolbar: false,
   webPreferences: {
     nodeIntegration: false
   }
  });

  mainWindow.setMenu(null);

  mainWindow.maximize();

  var server = http.createServer(requestHandler).listen(9527);

 // and load the index.html of the app.
 mainWindow.loadURL('http://localhost:9527/index.html');

 mainWindow.openDevTools();

 // Emitted when the window is closed.
 mainWindow.on('closed', function () {

   // Dereference the window object, usually you would store windows
   // in an array if your app supports multi windows, this is the time
   // when you should delete the corresponding element.
   mainWindow = null;
 });
});

function requestHandler(req, res) {
    var
        file    = req.url == '/' ? '/index.html' : req.url,
        root    = __dirname,
        page404 = root + '/404.html';

   console.log("root = " + root);
   console.log("file = " + file);
    getFile((root + file), res, page404);
};

function getFile(filePath, res, page404) {

    fs.exists(filePath, function(exists) {
        if(exists) {
            fs.readFile(filePath, function(err, contents) {
                if(!err) {
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        } else {
            fs.readFile(page404, function(err, contents) {
                if(!err) {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        }
    });
};
