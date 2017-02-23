const path = require('path')
const http = require('http')
const fs = require('fs')
const electron = require('electron')
//const autoUpdater = require('./auto-updater')
// const app = require('app');
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const baseURL = "http://localhost:9527/"
const elasticlunr = require('./bower_components/elasticlunr/release/elasticlunr.min.js');

// Playing around with some elastic search stuff in angular.
// For this app, the JSON docs to search will be packaged, so we can add them
// to the index once the app starts up and then use that index to search against
const index = elasticlunr(function() {
    this.addField('title');
    this.addField('body');
    this.addField('description');
    this.addField('url');
    this.setRef('id');
    this.documentStore = new elasticlunr.DocumentStore;
    this.saveDocument(true);
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

    buildSearchIndex();

    var args = process.argv
    var jsonPath = path.join(__dirname, "\\contents\\contents.json");

    fs.openSync(jsonPath, 'r+'); //throws error if file doesn't exist
    var data = fs.readFileSync(jsonPath); //file exists, get the contents
    var sections = JSON.parse(data);

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

function buildSearchIndex() {
  var jsonPath = "./app/search/search.json"
  fs.openSync(jsonPath, 'r+'); //throws error if file doesn't exist
  var data = fs.readFileSync(jsonPath);
  var documents = JSON.parse(data);

  documents.forEach(function(doc) {
    console.log(doc);
    index.addDoc(doc);
  });

    // var doc1 = {
    //     "id": 1,
    //     "title": "Oracle released its latest database Oracle 12g",
    //     "body": "Yestaday Oracle has released its new database Oracle 12g, this would make more money for this company and lead to a nice profit report of annual year.",
    //     "description": "Yestaday Oracle has released its new database Oracle 12g",
    //     "url": "/index.html"
    // }
    //
    // var doc2 = {
    //     "id": 2,
    //     "title": "Oracle released its profit report of 2015",
    //     "body": "As expected, Oracle released its profit report of 2015, during the good sales of database and hardware, Oracle's profit of 2015 reached 12.5 Billion.",
    //     "description": "As expected, Oracle released its profit report of 2015,",
    //     "url": "/index.html"
    // }
    //
    // index.addDoc(doc1);
    // index.addDoc(doc2);

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
    } else if (result = startsWith(req.url, ['/search/results.html']).found) {
        console.log("This is a results request, handle me.");
        file = '/search/results.html';
        fullPath = path.join(root, file).replace(/\//g, "/");
    } else if (result = startsWith(req.url, ['/find/']).found) {
        console.log("This is a search request, handle me.");
        console.log("Request Type:" + req.method);

        if (req.method === 'POST') {
            console.log("We got a POST!");
            var searchTerm = getParameterByName("v", req.url);
            console.log("Search Term: " + searchTerm);
            var result = index.search(searchTerm);
            console.log("Search Result:" + JSON.stringify(result));
            var docs = retreiveResultDocs(result);
            res.end(JSON.stringify(docs));
        } else if (req.method === 'GET') {
            console.log("We got a GET! Since this is a find, it should have been a POST, who screwed up?");
        }
        // res.end("{'id': 1, 'url': 'one.html', 'title': 'One', 'description': 'A page about one'}");
        // TODO: Perform search
        // TODO: Call res.end() with JSON data returned from search
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

function retreiveResultDocs(results) {
  // TODO: For each result in results, retreive JSON DOC object and prepare to return
  // to the client.

  var docs = [];
  for (var i = 0; i < results.length; i++) {
    var cRef = parseInt(results[i].ref);
    docs.push(index.documentStore.getDoc(cRef));
  }

  return docs;
};

// Checks to see if the URL passed starts with any of the items in provided array
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


// Decodes a URL and retrieves the specified parameter value.
function getParameterByName(name, url) {
    if (!url) {
      console.log("No URL specified in getParameterByName().")
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
