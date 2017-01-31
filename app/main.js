const path = require('path')
const glob = require('glob')
const http = require('http')
const fs = require('fs')
const electron = require('electron')
//const autoUpdater = require('./auto-updater')

const BrowserWindow = electron.BrowserWindow
const app = electron.app

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

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
    // mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});

/**
* Let's try and explain some magic going on here.
* So, we need to ignore requests to all "whitelisted" files on the server
* This is basically all files that are not blacklisted or rewritePaths
* The only rewrite at the moment is the /p/* path, we need to direct
* the webclient to the actual location of the file, but not allow the
* webclient to access the html pages contained directly. This is the
* same for partials, except partials should never be delivered to the
* client on their own and are instead used to inject into the DOM.
**/
function requestHandler(req, res) {
    var
        file = req.url == '/' ? '/index.html' : req.url,
        root = __dirname,
        page404 = root + '/404.html',
        fullPath = "",
        ignoredPaths = ['/sections/*', '/partials/*'],
        rewritePaths = ['/p/*'];

        if(startsWith(req.url, ignoredPaths).found) {
          console.log("!!ALERT!! Requested URL is Blacklisted!");
          file = page404;
        }
        if(startsWith(req.url, rewritePaths).found) {
          console.log("!!ALERT!! Requested URL is Rewriteable! " + req.url)
          if(rewritePaths[result.index] == '/p/*') {
            // This regex checks for '/p/' and replaces it with '/sections/'
            // before moving onto "getFile()"
            file.replace(/\/p\//g, "/sections/");
            console.log("Rewrite path = " + file);
          }
          // Legacy code, not needed since we handle the / => /index.html above
          // else if (rewritePaths[result.index] == '/') {
          //   file.replace(/\//g, "/index.html");
          //   console.log("Rewrite path = " + file);
          // }
          else {
            console.log("Got a strange result from Request Handler: " + result.index);
          }
        }

    console.log("root = " + root);
    console.log("file = " + file);

    // Make full path to file and replace / with \
    fullPath = path.join(root, file).replace(/\//g, "/");
    console.log("fullPath = " + fullPath);
    getFile(fullPath, res, page404);
};

function startsWith(string, array) {
  for(i = 0; i < array.length; i++)
    if(string.startsWith(array[i]))
      return {
        found: true,
        index: i
      }
  return {
    found: false,
    index: i
  }
};

function getFile(filePath, res, page404) {

  console.log("Get File Path === " + filePath);

  var file = decodeURI(filePath);

    fs.exists(file, function(exists) {
        if (exists) {
            fs.readFile(file, function(err, contents) {
                if (!err) {
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        } else {
            fs.readFile(page404, function(err, contents) {
                if (!err) {
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        }
    });
};
