# ng-help - An Angular.js-based help system.

This systems allows a software developer to quickly generate a website to display help files generated in HTML format.

The application generates a table of contents based upon values defined in a JSON file, and it dynamically handles routing to the actual files stored in the contents directory.

## Contact

For more information on AngularJS please check out http://angularjs.org/

## Getting Started

To hit the ground running run the following command from the root directory of this project.

```
npm start
```

This command will install all the required dependencies for Node.js and obtain the bower components used before launching the electron application.

## Build a Distributable Asar File

The following command will build a distributable asar file and then launch electron from it. This also handles creating the contents.json file for us.

```
gulp electron-asar
```

## Produce Contents JSON File

The following command can be run to produce a contents.json file from the items in the sections directory. This is a dumb process at the moment and expects that only .html files are present in the sections folder and that you want all files in that folder to have their own link in the sections bar.

```
gulp produce-sections-json
```

## Command Line Arguments

ng-Help allows you to pass in command line arguments when the electron app is first launched.

### Start Electron and Open Specified Section

The Electron application will allow you to launch it and specify the title of a section to open up to. This can be useful if you want to launch the application from your own app and show a section based on where the user was when they launched it. The title must match a title specified in the __contents.json__ file

```
electron <app.asar path>/main.js -section "<Title of Section>"
```
