var graph_cytoscape_styles = function(minWeight, maxWeight){ 
    return [
    {
        "selector": '$node > node',
        "style": 
        {
            'padding-top': 			'10px',
            'padding-left': 		'10px',
            'padding-bottom': 		'10px',
            'padding-right': 		'10px',
            'background-color': 	'#fff',
            "background-opacity": 	"0",
        }
    },		
    {
        "selector": "node[type=\"Chemical\"]",		
        "style": {'background-color': '#8fcfff',}
    },	
    {
        "selector": "node[type=\"Disease\"]",
        "style": {'background-color': '#ee5a5a',}
    },
    {
        "selector": "node[type=\"Mutation\"]",
        "style": {'background-color': '#ffa500',}
    },
    {
        "selector": "node[type=\"DNAMutation\"]",
        "style": {'background-color': '#ffa500',}
    },
    {
        "selector": "node[type=\"ProteinMutation\"]",
        "style": {'background-color': '#ffa500',}
    },
    {
        "selector": "node[type=\"SNP\"]",
        "style": {'background-color': '#ffa500',}
    },
    /*
    {
        "selector": "node[type=\"ProteinMutation\"]",
        "style": {'background-color': '#008080',}
    },
    {
        "selector": "node[type=\"SNP\"]",
        "style": {'background-color': '#00ffff',}
    },
    */
    {
        "selector": "node[type=\"Gene\"]",
        "style": {'background-color': '#7fa2ff',}
    },
    {
        "selector": "node[type=\"Hallmark\"]",
        "style": {'background-color': '#9b7aff',}
    },
    {
        "selector": "node[type=\"Species\"]",
        "style": {'background-color': '#f5f5dc',}
    },
    {
        "selector": "node",
        "style": 
        {			
            "shape": "ellipse",
            "width": "40px",
            "height": "40px",
            "content": "data(name)",
            "color": "#111",
            "font-size": "14px",
            "font-weight": "lighter",
            "font-family": "Lato,Arial,Helvetica,sans-serif",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "text-outline-color": "white",
            "text-outline-width": "1.5px",
            "text-outline-opacity": "0.4",
            "z-index": "10",
            "border-width": "0.2em",
            "border-color": "#FFF",
            "border-style": "solid",
            "border-opacity": "1",				
            "shadow-blur": "15px",
            "shadow-color": "#000",
            "shadow-opacity": "0.2",
            "shadow-offset-x": "2px",
            "shadow-offset-y": "2px"		  		  				
        },
    },
    {
        "selector": "edge",
        "style": 
        {
            "curve-style": "haystack",
            "haystack-radius": "0",
            "opacity": "0.1",
            "line-color": "#666",
            "width": "mapData(metric, "+ minWeight +","+ maxWeight +", 1, 10)",
            "overlay-padding": "3px",
        }
    },
    {
        "selector": "edge[sort=\"B\"]",
        "style": 
        {
            "curve-style": "unbundled-bezier",
            "control-point-distance" : "70px",
            "control-point-weight" : "1"
        }
    },
    {
        "selector": "edge[positive=\"true\"]",
        "style": 
        {
            "line-color": "black",
        }
    },
    {
        "selector": "edge[positive=\"false\"]",
        "style": 
        {
            "line-color": "black",
            "line-style": "dashed",
        }
    },	
    {
        "selector": ".unopenednode",
        "style": 
        {
        },			
    },
    {
        "selector": ".openednode",
        "style": 
        {
            "text-margin-y": "-9px",	
            'background-image': 
            [
                'static/images/dead_end.png',
            ],
            'background-fit': 'contain',
            'background-image-opacity': '1'				
        },			
    },
    {
        "selector": ".highlightednode",
        "style": 
        {
            "border-width": "4px",
            "border-color": "#2185D0",
            "border-opacity": "1",	
            "background-color": "#2185D0",
        }
    },	
    {
        "selector": ".ultrahighlightednode",
        "style": 
        {
            "shadow-blur": "50px",
            "shadow-color": "#2185D0",
            "shadow-opacity": "0.9",
            "shadow-offset-x": "2px",
            "shadow-offset-y": "2px"		  		  				
        }
    },					
    {
        "selector": ".node-level-depth-0",
        "style": 
        {
            "width": 				"60px",
            "height": 				"60px",	
            "font-weight":			"bold",
            "font-size": 			"18px",
            "color": "#444",				
            /*
            "font-size": 			"28px",	
            "text-outline-width": 	"2px",								
            "text-outline-opacity": "0.7",	
            "text-max-width": 		"180px",
            */
            "background-opacity": 	"1",
        }
    },						
    {
        "selector": ".node-level-depth-1",
        "style": 
        {
            "width": 				"50px",
            "height": 				"50px",
            /*
            "font-size": 			"18px",	
            "text-max-width": 		"160px",
            */
            "background-opacity": 	"1",
        }
    },						
    {
        "selector": ".node-level-depth-2",
        "style": 
        {
            "width": 				"40px",
            "height": 				"40px",						
            "font-size": 			"14px",								
            "background-opacity": 	"1",
        }
    },						
    {
        "selector": ".node-level-depth-3",
        "style": 
        {
            "width": 				"25px",
            "height": 				"25px",						
            "font-size": 			"10px",												
            "background-opacity": 	"0.4",
        }
    },						
    {
        "selector": ".node-level-depth-4",
        "style": 
        {
            "width": 				"10px",
            "height": 				"10px",									
            "font-size": 			"8px",												
            "background-opacity": 	"0.2",
        }
    },								
    {
        "selector": ".closedC",
        "style": 
        {
            "width": 				"60px",
            "height": 				"60px",	
            "font-weight":			"bold",
            "font-size": 			"18px",
            "color": 				"#444",				
            "background-opacity": 	"1",
        }
    },								
    {
        "selector": ".edge-level-depth-0",
        "style": 
        {
            "opacity": "1",
        }
    },						
    {
        "selector": ".edge-level-depth-1",
        "style": 
        {
            "opacity": "0.5",
        }
    },						
    {
        "selector": ".edge-level-depth-2",
        "style": 
        {
            "opacity": "0.3",
        }
    },						
    {
        "selector": ".edge-level-depth-3",
        "style": 
        {
            "opacity": "0.1",
        }
    },						
    {
        "selector": ".edge-level-depth-4",
        "style": 
        {
            "opacity": "0.1",
        }
    },
    {
        "selector": ".highlightededge",
        "style": 
        {
            "opacity": "1",
            "line-color": "#2185D0",
        }
    },
    {
        "selector": ".graph_title",
        "style": 
        {			
            "shape": "rectangle",
            "width": "label",
            "height": "label",
            "content": "data(name)",
            "color": "#111",
            "font-size": "20px",
            "font-weight": "bold",
            "font-family": "Lato,Arial,Helvetica,sans-serif",
            "text-valign": "center",
            "text-halign": "center",
            "text-wrap": "wrap",
            "text-max-width": "600px",
            "background-color": "white",
            "z-index": "10",
            "border-width": "0em",
            "border-color": "#FFF",
            "border-style": "solid",
            "border-opacity": "0",				
            "shadow-blur": "0px",
            "shadow-color": "#000",
            "shadow-opacity": "0",
            "shadow-offset-x": "0px",
            "shadow-offset-y": "0px"		  		  				
        },
    },				
    {
        "selector": ".graph_url",
        "style": 
        {			
            "shape": "rectangle",
            "width": "label",
            "height": "label",
            "content": "data(name)",
            "color": "#111",
            "font-size": "16px",
            "font-weight": "normal",
            "font-family": "courier,sans-serif",
            "text-valign": "top",
            "text-halign": "center",
            "text-wrap": "wrap",
            "background-color": "white",
            "z-index": "10",
            "border-width": "0em",
            "border-color": "#FFF",
            "border-style": "solid",
            "border-opacity": "0",				
            "shadow-blur": "0px",
            "shadow-color": "#000",
            "shadow-opacity": "0",
            "shadow-offset-x": "0px",
            "shadow-offset-y": "0px"		  		  				
        },
    },				
    {
        "selector": ".hidden",
        "style": 
        {
            "visibility": "hidden"
        }
    },				

    ];

}
