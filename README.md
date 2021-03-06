# ng-help - An Angular.js-based help system.

This systems allows a software developer to quickly generate a website to display help files generated in HTML format.

The application generates a table of contents based upon values defined in a JSON file, and it dynamically handles routing to the actual files stored in the contents directory.

## Contact

For more information on AngularJS please check out http://angularjs.org/

## Getting Started

1. Run ```npm install``` to install some necessary dependencies.
2. Run ```bower install``` to install remaining necessary dependencies.
3. In order to use this application, you must create two folders inside app

    ```
    app\
    |-- Assets\
    |-- sections\
    ```
    __Assets\__ should contain all assets needed by your section html pages. Ensure that you link to these files relatively.

    __sections\__ should contain all of your html partials that you want links to in the section side bar. You should name these files what you want the title of the link in the section bar to be. __Only HTML files belong here!__

4. Once you have the above folder structure, run the following to have your __contents.json__ produced for you.

  ```
  gulp produce-contents-json
  ```

5. To hit the ground running run the following command from the root directory of this project.

  ```
  npm start
  ```

  This command will install all the required dependencies for Node.js and obtain the bower components used before launching the electron application.

## Build a Distributable Asar File

The following command will build a distributable asar file and then launch electron from it. This also handles creating the contents.json file for us.

```
gulp electron-start
```

If you prefer to just produce an ASAR file, run the gulp task below:
```
gulp electron-asar
```

## Produce Contents JSON File

The following command can be run to produce a contents.json file from the items in the sections directory. This is a dumb process at the moment and expects that only .html files are present in the sections folder and that you want all files in that folder to have their own link in the sections bar.

```
gulp produce-contents-json
```

## Command Line Arguments

ng-Help allows you to pass in command line arguments when the electron app is first launched.

### Start Electron and Open Specified Section

The Electron application will allow you to launch it and specify the title of a section to open up to. This can be useful if you want to launch the application from your own app and show a section based on where the user was when they launched it. The title must match a title specified in the __contents.json__ file

```
electron <app.asar path>/main.js -section "<Title of Section>"
```

## HTML Document Writing Guide

### Linking One HTML Section to Another

You may want to include links from one HTML file to another within the HTML itself. This can be done by utilizing the __GoToSection()__ function provided by the SectionController.

Example link:
Say I want to include a hyperlink within Foo.html that will take me to Bar.html within the ng-Help application. To do this, I would do the following:

```
In Foo.html:

<a href="" ng-click="GoToSection('Bar')">Click here for Bar.html</a>
```

If you do not include the href property, the mouse cursor will not behave as users expect it to when it hovers over a link. The __GoToSection()__ function accepts a string that matches the __EXACT__ title of the section you want to link to.

### Providing Search Descriptions

In order to set the text that is displayed by the search functionality within ng-Help, you must provide a <meta> tag in the head of each of your section html files. This tag must be named description and then may contain around 160 characters (recommended).

```
<head>
  <meta name="description" content="Here is some content that will displayed along with the page title as part of the search results within ng-help">
</head>
```

### Tooltips

ng-help utilizes angular-bootstrap and as such allows you to take advantage of their styling for additional ui candy in your html sections. Please visit the [angular-bootstrap website](https://angular-ui.github.io/bootstrap/) to view other supported directives.

If you want to display a basic tooltip on mouse over of a keyword 'Foo', which displays the text 'Bar' you should do the following:

```
<a href="#" tooltip-animation="false" uib-tooltip="Bar">Foo</a>
```

The above anchor tag just needs to surround any text you want to add a tooltip to.
