const path = require('path')
const glob = require('glob')
const http = require('http')
const fs = require('fs')
const electron = require('electron')
//const autoUpdater = require('./auto-updater')
// const app = require('app');
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const baseURL = "http://localhost:9527/"

var elasticlunr = require('elasticlunr');

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

    // Let's create the Elasticlunr Index and set it equal to our index object
    var index = createElasticlunrIndex();
    console.log("Finished initializing Elasticlunr Index!");

    var args = process.argv
    var jsonPath = path.join(__dirname, "\\contents\\contents.json");

    fs.openSync(jsonPath, 'r+'); //throws error if file doesn't exist
    var data = fs.readFileSync(jsonPath); //file exists, get the contents
    var sections = JSON.parse(data);

    var doc1 = {
      "id": 1,
      "title": "Oracle released its latest database Oracle 12g",
      "body": "Yestaday Oracle has released its new database Oracle 12g, this would make more money for this company and lead to a nice profit report of annual year."
    }

    var doc2 = {
      "id": 2,
      "title": "Oracle released its profit report of 2015",
      "body": "As expected, Oracle released its profit report of 2015, during the good sales of database and hardware, Oracle's profit of 2015 reached 12.5 Billion."
    }

    index.addDoc(doc1);
    index.addDoc(doc2);

    // for (i = 0; i < sections.length; i++) {
    //   console.log("Adding " + sections[i].title + " to index...");
    //   index.addDoc(sections[i].url);
    // }
    console.log("Finished adding documents to index!");

    var results = index.search("Oracle");

    console.log(results.toString());

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
    var cmdArg = "";

    for (i = 0; i < args.length; i++) {
        console.log("Arg" + i + ": " + args[i]);
        if (args[i] === "-section") {
            cmdArg = args[i + 1];
            console.log("Found section arg! == " + args[i + 1]);
            break;
        }
    }
    // and load the index.html of the app.
    if (cmdArg === "") {
        mainWindow.loadURL('http://localhost:9527/index.html');
    } else {
        for (i = 0; i < sections.length; i++) {
            if (sections[i].title === cmdArg) {
                mainWindow.loadURL(path.join(baseURL, sections[i].url));
                break;
            }
        }
        // console.log("Received a command line arg: " + cmdArg);
        // console.log("!!! Still loading index.html for now...");
        // mainWindow.loadURL('http://localhost:9527/index.html');
    }
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

function createElasticlunrIndex() {
  console.log("Initializing ElasticLunr Index...");
  return elasticlunr(function () {
    this.addField('title');
    this.addField('body');
    this.setRef('id');
    this.saveDocument(true);
  });
}

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
    console.log("Entered requestHandler...");
    var
        file = req.url == '/' ? '/index.html' : req.url,
        root = __dirname,
        page404 = root + '/404.html',
        fullPath = "",
        ignoredPaths = ['/bower_components/'],
        rewritePaths = ['/p/'],
        REWRITTING = false;

    if (result = startsWith(req.url, ignoredPaths).found) {
        console.log("!!ALERT!! Requested URL is Blacklisted!");
        // file = page404;
        fullPath = path.join(root, file).replace(/\//g, "/");
    } else if (result = startsWith(req.url, rewritePaths).found) {
        REWRITTING = true;
        console.log("!!ALERT!! Requested URL is Rewriteable! " + req.url);
        if (rewritePaths[result.index] == '/p/') {
            // This regex checks for '/p/' and replaces it with '/sections/'
            // before moving onto "getFile()"
            //file.replace(/\/p\//g, "/sections/");
            console.log("Rewrite path = " + file);
            fullPath = path.join(root, file).replace(/\//g, "/");
        }
        // Legacy code, not needed since we handle the / => /index.html above
        // else if (rewritePaths[result.index] == '/') {
        //   file.replace(/\//g, "/index.html");
        //   console.log("Rewrite path = " + file);
        // }
        else {
            console.log("Got a strange result from Request Handler: " + result.index);
            file = page404;
            fullPath = path.join(root, file).replace(/\//g, "/");
        }
    } else {
      fullPath = path.join(root, file).replace(/\//g, "/");
    }

    console.log("root = " + root);
    console.log("file = " + file);

    // Make full path to file and replace / with \
    // fullPath = path.join(root, file).replace(/\//g, "/");
    console.log("fullPath = " + fullPath);


    if (!REWRITTING) {
        getFile(fullPath, res, page404);
    } else {
        fs.readFile(path.join(__dirname, "index.html"), function(err, contents) {
            if (!err) {
                res.end(contents);
            } else {
                console.dir(err);
            }
        });
    }

};

function startsWith(string, array) {
    console.log("Starts with entered... " + string);
    for (i = 0; i < array.length; i++)
        if (string.startsWith(array[i]))
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
