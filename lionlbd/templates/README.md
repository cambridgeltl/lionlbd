# Description of LION Web Application Files
Web application files are contained in:
```
/lion-lbd/lionlbd/static
/lion-lbd/lionlbd/templates  
```

## Application files
```templates/index.html``` HTML for application. Uses Semantic-UI and cam-dtal-lion.css classes.

```static/js/cam-dtal-lion.js``` Application Javascript.

```static/css/cam-dtal-lion.css``` Application stylesheet.

```static/js/cam-dtal-lion-cytoscape.js``` Application stylesheet for Cytoscape.js graphs.

## Libraries
### Semantic UI
```
static/js/semantic.min.js
static/css/semantic.min.css
```

Development framework for creating responsive layouts using human-friendly HTML.
https://semantic-ui.com/

### Semantic UI Extension: Calendar
```
static/js/calendar.min.js	
static/css/calendar.min.css
```

Extension to provide popup calendars within Semantic-UI
https://github.com/mdehoog/Semantic-UI-Calendar

### Semantic UI Extension: Range
```
static/js/range.js	
static/css/range.css
```

Extension to provide sliders within Semantic-UI
https://github.com/tyleryasaka/semantic-ui-range

### Cytoscape.js
```
static/js/cytoscape.min.js
```

Graph theory and network library for analysis and visualisation
http://js.cytoscape.org/

### Cytoscape.js: 'Cola'
```
static/js/cola.min.js	
static/js/cola.v3.min.js	
static/js/cytoscape-cola.js
```

The 'Cola' layout uses a force-directed physics simulation to position nodes in a graph.
https://github.com/cytoscape/cytoscape.js-cola

### Cytoscape.js: Cose-Bilkent
```
static/js/cytoscape-cose-bilkent.js
```

An alternative layout to 'Cola'.
https://github.com/cytoscape/cytoscape.js-cose-bilkent

### Chart.js
```
static/js/Chart.bundle.min.js
```

Simple yet flexible JavaScript charting for designers & developers.
http://www.chartjs.org/

### jQuery
```
static/js/jquery.min.js	
```

Required by Semantic UI and main application.

### UUID.js
```
statis/js/uuid.js	
```

Simple, fast generation of RFC4122 UUIDS.
https://github.com/broofa/node-uuid

### Underscore.js
```
static/js/underscore-min.js	
```

Provides a number of useful functional programming helpers without extending built-in objects.
http://underscorejs.org/

### FileSaver
```
static/js/FileSaver.min.js
```

FileSaver.js implements the saveAs() FileSaver interface in browsers that do not natively support it. 
https://github.com/eligrey/FileSaver.js/	