
// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------- LION Literature-Based Discovery -------------
// ---- Department of Theoretical and Applied Linguistics ----
// ---------------- University of Cambridge ------------------
// -----------------------------------------------------------
// --------------- http://www.lionproject.net ----------------
// -----------------------------------------------------------
// ---------- Written by sh801, v1.0.0a, 11/06/2017 ----------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************



// ***********************************************************
// ***********************************************************
// ************************ Variables ************************ 
// ***********************************************************
// ***********************************************************

// -----------------------------------------------------------
// ------------------- General variables --------------------- 
// -----------------------------------------------------------

// Information about software

var software_name       = "LION Literature-Based Discovery"
var software_version    = "1.0.0a";

// Unique user id

var unique_id = uuid.v4();  

// Base URL

var base_url = "http://www.lionproject.net";

// Variable that holds Cytoscape graph

var graph_cytoscape;

// Variable that holds tooltip Chart.js graph

var graph_tooltip;

// Media query width at which semantic ui flips to mobile rendering

var semanticui_mobilewidth = 768;

// -----------------------------------------------------------
// ------------- Standardising ontology prefixes ------------- 
// -----------------------------------------------------------

// Convert CURIE prefixes from 'old' format to 'new' standardised format

curie_prefix_old    = ["taxonomy",  "EGID"                  ];
curie_prefix_new    = ["NCBITaxon", "NCBIGENE"              ];

// -----------------------------------------------------------
// ---------------- External data sources -------------------- 
// -----------------------------------------------------------

// 'external_obo_context' contains lookup URLs for nodes based on their CURIE

//var external_obo_context_url = 'https://raw.githubusercontent.com/cmungall/biocontext/master/registry/uber_context.jsonld';
var external_obo_context_url = '/static/json/uber_context.jsonld';
var external_obo_context_data;

// -----------------------------------------------------------
// ------------------ Node type options ---------------------- 
// -----------------------------------------------------------

// 'alltypes_code' contains list of type codes, none of which must contain spaces

//var alltypes_code           = ["Chemical", "Disease", "DNAMutation", "Gene", "Hallmark", "ProteinMutation", "SNP", "Species"];
var alltypes_code           = ["Chemical", "Disease", "Mutation", "Gene", "Hallmark", "Species"];

// 'alltypes_description' contains equivalent list of type descriptions as presented to user

//var alltypes_description    = ["Chemical", "Disease", "DNA Mutation", "Gene", "Cancer Hallmark", "Protein Mutation", "SNP", "Species"];
var alltypes_description    = ["Chemical", "Disease", "Mutation", "Gene", "Cancer Hallmark", "Species"];


// -----------------------------------------------------------
// ----------------- Edge metric options --------------------- 
// -----------------------------------------------------------

var edge_metric_values_index    = [];
var edge_metric_values_data     = [];


// -----------------------------------------------------------
// ----------------- Aggregation metric options --------------
// -----------------------------------------------------------


var aggregation_func_values_index    = [];
var aggregation_func_values_data     = [];


// -----------------------------------------------------------
// ----------------- Neo4j metadata --------------------------
// -----------------------------------------------------------

var neo4j_metadata = null;










// -----------------------------------------------------------
// --------------- State-related variables ------------------- 
// -----------------------------------------------------------

// Global variables that hold 'src' and 'dest' OIDs

var global_src_oid;
var global_dest_oid;

// Variables relating to date range

var date_range_year_current_start;
var date_range_year_current_end;
var date_range_year_min             = null; 
var date_range_year_max             = null; 
var filter_date_range_year_start    = date_range_year_min;
var filter_date_range_year_end      = date_range_year_max;

// Variables relating to weight range

var weight_range_min            = 0;
var weight_range_max            = 1;
var weight_range_start          = null;
var weight_range_end            = null; 


var filter_weight_min = null;
var filter_weight_max = null;
var filter_weight_range_start   = null;
var filter_weight_range_end     = null;

// Variables relating to node type

var source_types        = alltypes_code;
var filter_types        = alltypes_code;

// Discovery mode: whether we only show second-layer nodes that are not connected to starting node

var discovery_mode_default      = 0;
var discovery_mode;

// Open discovery: fetch nodes two steps away from initial node (only for first node) - discovery mode is being retired

var open_discovery_default      = 0;
var open_discovery;


// Hide low frequency: whether to hide all nodes and associated edges that are low frequency

var hide_lowfrequency_default   = false;
var hide_lowfrequency;

// Show full abstract: whether to show full abstract or list of cooccurrences when viewing mentions

var full_abstract_default       = true;
var full_abstract;

// Visualization mode: the mode with which to show the data model

var visualization_mode_default  = "graph";
var visualization_mode;

// Layout mode: the layout used to show data if using a graph

var layout_mode_default            = 'cola';
var layout_mode_default_od         = 'concentric';
var layout_mode;

// Edge metric: the metric used to order and select edges (both backend and frontend)

var edge_metric_default         = null;
var edge_metric;


// Aggregation metric: the metric used to order and select closed discovery paths (both backend and frontend)

var aggregation_func_default         = null;
var aggregation_func;


// Discovery paging current page number
var currentDiscoveryPage = 1


// -----------------------------------------------------------
// ------------- Internal data model variables --------------- 
// -----------------------------------------------------------
 
var nodes_count;
var nodes_index;
var nodes_data;
var edges_index;
var edges_data;


// -----------------------------------------------------------
// ----------------- Call stack variables -------------------- 
// -----------------------------------------------------------

var callstack_recording;
var callstack_running;


// -----------------------------------------------------------
// ------------------ Mentions variables ---------------------
// -----------------------------------------------------------

var mentions_state_data     = [];
var mentions_state_index    = [];


// -----------------------------------------------------------
// ----------------------- UI timers ------------------------- 
// -----------------------------------------------------------

// Handles resizing of graph area when search area opened/closed

var minimizesearch_accordion_timer = 0;

// Time travel interval timer

var yearplay_timer = 0;

// Node tooltip timer

var tooltip_show_timer;
var tooltip_hide_timer;


// -----------------------------------------------------------
// -------------- Graph-state-monitoring variables -----------
// -----------------------------------------------------------

// Whether data model has been rendered as graph with Cytoscape

var graph_render_started = false;

// Current graph layout

var graph_layout_current;

// Whether graph layout is running or has finished

var graph_layout_running = false;

// Count of number of layouts created so far

var graph_layout_count = 0;

// Pan position of graph

var graph_pan_position; 

// Store zoom and pan settings

var graph_settings_zoom;
var graph_settings_pan;


// -----------------------------------------------------------
// --------- Miscellaneous state-monitoring variables --------
// -----------------------------------------------------------

// Whether 'src' input box has been selected

var src_selected = false;

// Whether 'dest' input box has been selected

var dest_selected = false;

// Whether destination input box is visible

var destination_visible = false;

// Whether data has been loaded into data model

var data_loaded = false;

// Whether browser tab is visible or not

var tab_hasloaded = false

// Whether to fit to window after graph layout finished rendering

var fit_after_redraw = false;

// Whether date or range sliders have been initialized - avoids infinite recursion

var filter_range_1_setup_date;
var filter_range_2_setup_date;
var filter_range_1_setup_weight;
var filter_range_2_setup_weight;

// Whether node types are being set programmatically - avoids infinite recursion

var types_set_programmatically = false;

// Prevent dropdown appearing after multiple select changed through deleting elements

var type_dropdown_hide = false;

// -----------------------------------------------------------
// ---------------------- Cache variables --------------------- 
// -----------------------------------------------------------

// Cache to store canonical text for particular OIDs

var cache_canonicaltext_index   = [];
var cache_canonicaltext_data    = [];

// -----------------------------------------------------------
// ----------------- Performance variables -------------------- 
// -----------------------------------------------------------

var performance_timer_start;
var performance_timer_name = "";




// ***********************************************************
// ***********************************************************
// ************************ Functions ************************ 
// ***********************************************************
// ***********************************************************


// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------- Initialization and setup ----------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

// -----------------------------------------------------------
// ----------------- Get external data asap ------------------ 
// -----------------------------------------------------------

initExternalData();

//Load DB metadata from neo4j

console.log('loading Neo4J metadata')

getNeo4jMetadata().then(function() {

// -----------------------------------------------------------
// ------------ Bulk of initializing on DOM ready ------------ 
// -----------------------------------------------------------

$(function()
{ 
    // -------------------------------------------------------
    // -------------------------------------------------------
    // ------------------ Run on DOM ready ------------------- 
    // -------------------------------------------------------
    // -------------------------------------------------------
    
    // Initialize error reporting 

    initErrorReporting();

    // ** Random error to test error dumping **
    // vchart.data = test;

    // Initialize core UI and variables

    initCoreUI();
    initVariables(true);

    // Initialize nodes index

    initNodesEdgesIndex();

    // Initialize semantic ui page elements that must be initialized in order to work
    //feedback button click show dialog  
    $('#feedback-button').click(function(){showFeedback();});
 
    //$('.popup,.cam-dtal-lion-popup').popup();
    $('.popup,.cam-dtal-lion-popup-yearstart,.cam-dtal-lion-popup-yearend').popup();
    $('.cam-dtal-lion-popup-yearstart').popup({content:'Select start year'});
	//TEJAS: start year has been removed, it's now just select year
    //$('.cam-dtal-lion-popup-yearend').popup({content:'Select end year'});
    $('.cam-dtal-lion-popup-yearend').popup({content:'Select end year'});



    $('.menu .item').tab();
    $('.ui.accordion').accordion(); 
    $('#cam-dtal-lion-sidebar-mentions-close').click(function(){$('#cam-dtal-lion-sidebar-mentions').sidebar('hide');});
    $('.ui.sidebar').sidebar({dimPage:false, onHidden: function(){resizeVisualizationArea();}});
    $('.ui.dropdown').dropdown();

    // Attach open/close left bar menu functionality to item with class 'cam-dtal-lion-menu-toggle' 
    
    //$('#cam-dtal-lion-sidebar-menu').first().sidebar('attach events', '.cam-dtal-lion-menu-toggle');
    
    $.fn.sidebar.settings.onShow = function(response) {};

    // Setup standard link onClick events

    $(document).on('click',                 '',                                                         function(e){$('.popup').popup('hide all');});                   
    $(document).on('click',                 '.cam-dtal-lion-visualization-select-tab-graph',            function(e){return reenterModeGraph(true);});               
    $(document).on('click',                 '.cam-dtal-lion-visualization-select-tab-text',             function(e){return reenterModeText();});
    $(document).on('click',                 '.dropdown.cam-dtal-lion-visualization-graph-layout-set',   function(e){hideTooltips();});                  
    $(document).on('click',                 '.cam-dtal-lion-dialog-hide',                               function(){return hideDialogs();});             
    $(document).on('click',                 '.cam-dtal-lion-bug-report',                                function(){return showPane('bug-report');});
    $(document).on('click',                 '.cam-dtal-lion-bug-confirm',                               function(){return reportBug();});
    $(document).on('click',                 '.cam-dtal-lion-bug-tools',                                 function(){return loadBugTools();});                    
    $(document).on('click',                 '.cam-dtal-lion-bug-tools-run',                             function(){return runEnteredCallStack();});                     
    $(document).on('click',                 '.cam-dtal-lion-node-expand',                               function(e){return tooltipNodeExpand(e);});             
    $(document).on('click',                 '.cam-dtal-lion-node-expandbytype',                         function(e){return showExpandNodeByType(e);});            
    $(document).on('click',                 '.nodeexpandtype',                                          function(e){return expandNodeByType(e);});            
    $(document).on('click',                 '.cam-dtal-lion-node-collapse',                             function(e){return tooltipNodeCollapse(e);});               
    $(document).on('click',                 '.cam-dtal-lion-node-delete',                               function(e){return tooltipNodeDelete(e);});             
    $(document).on('click',                 '.cam-dtal-lion-graph-refresh',                             function(e){return runGraphLayout(false);});                
    $(document).on('click',                 '.cam-dtal-lion-graph-fit',                                 function(e){return fitToWindow();});                
    $(document).on('click',                 '.cam-dtal-lion-visualization-text-edges-expand',           function(e){return visualizationTextNodeExpand(e);});               
    $(document).on('click',                 '.cam-dtal-lion-visualization-text-node-graph',             function(e){return visualizationTextNodeGraphView(e);});                
    $(document).on('click',                 '.cam-dtal-lion-visualization-text-edges-node',             function(e){return visualizationTextNodeOpen(e);});     
    $(document).on('click',                 '.cam-dtal-lion-visualization-text-edges-delete',           function(e){return visualizationTextNodeDelete(e);});               
    $(document).on('click',                 '.cam-dtal-lion-visualization-text-edges-mentions',         function(e){return visualizationTextToggleMentions(e);});                           
    $(document).on('click',                 '.cam-dtal-lion-tooltip-close',                             function(e){return hideTooltips();});   
    $(document).on('click',                 '.cam-dtal-lion-tooltip-graph-clickable',                   function(e){return clickTooltipGraph(e);});             
    $(document).on('click',                 '.cam-dtal-lion-tooltip-statistics',                        function(e){return clickTooltipStatistics(e);});                
    $(document).on('click',                 '.cam-dtal-lion-filter-range-year-play',                    function(e){return toggleYearPlay(e);});                
    $(document).on('click',                 '.cam-dtal-lion-filter-type-element',                       function(e){return toggleFilterElementType(e);});               
    $(document).on('click',                 '.cam-dtal-lion-weight-range-submit',                       function(e){return weightRangeSubmit();});              
    $(document).on('click',                 '.cam-dtal-lion-weight-range-reset',                        function(e){return weightRangeReset();});              
    $(document).on('mouseover',             '.cam-dtal-lion-visualization-graph-options',               function(e){return hideTooltips();});               
    $(document).on('mouseover',             '.cam-dtal-lion-visualization-graph-options-button',        function(e){return hideTooltips();});               
    $(document).on('mouseover',             '.cam-dtal-lion-tooltip-statistics',                        function(e){return mouseOverStatistics(e);});               
    $(document).on('mouseover',             '#cam-dtal-lion-tooltip',                                   function(e){return tooltipMouseover(e);});
    $(document).on('mouseleave',            '#cam-dtal-lion-tooltip',                                   function(e){return tooltipMouseleave(e);});         
    $(document).on('mouseleave',            '.cam-dtal-lion-tooltip-statistics-table-1',                function(e){return highlightGraphReset(1);});   




    // -------------------------------------------------------
    // -------------------- Window events -------------------- 
    // -------------------------------------------------------

    $(window).focus(function() 
    {
        if (!tab_hasloaded)
        {
            // A bug in Cytoscape.js cola means that unless the window is visible
            // when first loaded, all nodes will be drawn in same position
            // and the view will be highly zoomed
            // A workaround is to detect when tab is first made active 
            // and then check position of nodes before redrawing

            if ((graph_cytoscape !== undefined) && (visualization_mode == "graph"))
            {
                checkRenderingError();
            }
        }

        tab_hasloaded = true;
    });

    $(window).blur(function() {tab_hasloaded = false;});

    $(window).resize(function() 
    {
        // Redraw visualization areas if window is resized 
        
        var full_screen =   document.fullscreenElement ||
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement ||
                            document.msFullscreenElement;

        if (!full_screen) resizeVisualizationArea();
    });

    // -------------------------------------------------------
    // ---------------------- Setup menus -------------------- 
    // -------------------------------------------------------
    
    setLayoutMode(getLayoutModeDefault());
    
    $('.dropdown.cam-dtal-lion-visualization-graph-layout-set').dropdown(
    {
        onChange: function(new_layout_mode, text, $selectedItem) 
        {
            setLayoutModeInternal(new_layout_mode);

            saveStateToURL();       
            
            if (graph_render_started) runGraphLayout(true);         
        }
    });

    var hFunctionsDropdownHandler = function(call_function, text, selectedItem) 
    {
        switch (call_function)
        {
            case "picture-save-png":    saveCanvasAsPNG();                                  break;
            case "picture-save-jpg":    saveCanvasAsJPG();                                  break;
            case "text-mode":           initModeText();                                     break;
            case "delete-orphans":      deleteOrphanNodes();                                break;  
            case "edge-sort":           selectMenuEdgeMetric(selectedItem);                 break;
            case "aggregation-sort":    selectMenuAggregationFunc(selectedItem);          break;
            case "weight-range":        showPane("weight-range");                           break;
            case "discovery-mode":      break; 
            case "hide-lowfrequency":   break;
            case "full-abstract":       break;
            default:                    return true;                                        break;
        }

        // Use timeout as doesn't seem to work otherwise
        
        setTimeout(function() {$('.dropdown.cam-dtal-lion-settings-functions').dropdown("clear");}, 50);
        
        return true;
    };      
    
    $('.dropdown.cam-dtal-lion-settings-functions').dropdown({onChange: hFunctionsDropdownHandler,});

    // -------------------------------------------------------
    // ---------- Setup source type multiple select ---------- 
    // -------------------------------------------------------
    
    $(document).on('click', '.cam-dtal-lion-type-add', function(e)
    {
        $('.cam-dtal-lion-type-add').removeClass('write refresh');          

        if ($('.cam-dtal-lion-type').dropdown('is hidden'))
        {
            $('.cam-dtal-lion-type-add').addClass('refresh');                       
            $('.cam-dtal-lion-type').dropdown('show');
        }
        else
        {
            $('.cam-dtal-lion-type').dropdown('hide');          
        }
    });             

    $('.dropdown.cam-dtal-lion-type').dropdown(
    {
        onChange: function(value, text, $choice)
        {
            // Don't respond to onChange if we're setting values through 'revertTypesToInternalValues'

            if (types_set_programmatically) return true;

            var removed_item = null;

            if ($choice.hasClass)
            {
                if ($choice.hasClass('filtered')) removed_item = $choice.attr('data-value');
            }

            // Don't respond to onChange if dropdown visible as we wait till dropdown blurred

            if ($('.cam-dtal-lion-type').dropdown('is hidden'))
            {
                confirmTypesChange(removed_item);
            }

            return true;
        },
        onShow: function()
        {
            if (type_dropdown_hide) 
            {
                type_dropdown_hide = false; 
                return false;
            }   
            
            return true;
        },
        onHide: function()
        {
            $('.cam-dtal-lion-type-add').removeClass('write refresh');          
            $('.cam-dtal-lion-type-add').addClass('write');                                 

            confirmTypesChange(null);
        }
    });

    // -------------------------------------------------------
    // --------- Infinite scroll on mentions sidebar --------- 
    // -------------------------------------------------------
    
    $('#cam-dtal-lion-sidebar-mentions').on(
        'scroll',
        function() 
        {
            var scrollTop           = $('#cam-dtal-lion-sidebar-mentions')[0].scrollTop;
            var windowHeight        = $(window).height();
            var height              = $('#cam-dtal-lion-sidebar-mentions')[0].scrollHeight - windowHeight;
            var scrollPercentage    = (scrollTop / height);
            var pixelsToBottom      = (height - scrollTop);

            // if less than 10 pixels to bottom, then scroll

            if (pixelsToBottom < 10) 
            {                               
                var mentions_state = getMentionsState("cam-dtal-lion-mentions");
                
                if (!(mentions_state.loading)) addMentions("cam-dtal-lion-mentions");
            }           
        }
    );

    // -------------------------------------------------------
    // ------ Setup events for 'Discovery Mode' switch ------- 
    // -------------------------------------------------------
        
    onDiscoveryModeChange = function() 
    {   
        showConfirmIfData(  "Change Discovery Mode",
                            "<h4>Are you sure you want to change your <i>Discovery Mode</i> settings?</h4>" +
                            "<p>This will reset your current graph to its starting position</p>",
                            function() 
                            {
                                setDiscoveryMode(1-getDiscoveryMode());

                                variablesChangedResetVisualization();
                            },
                            null);
                            
        return false;                   
    };
    
    $('.cam-dtal-lion-discovery-mode').checkbox().checkbox(
    {
        beforeChecked:      onDiscoveryModeChange,
        beforeUnchecked:    onDiscoveryModeChange,
    });

    // -------------------------------------------------------
    // ------ Setup events for 'Low frequency' switch -------- 
    // -------------------------------------------------------
        
    onLowFrequencyChange = function() 
    {   
        var lowfrequency_action_text = "hide";

        if (getHideLowFrequency()) lowfrequency_action_text = "show";

        showConfirmIfData(  "Change visibility of low-frequency terms",
                            "<h4>Are you sure you want to " + lowfrequency_action_text + " low-frequency terms?</h4>" +
                            "<p>This will reset your current graph to its starting position</p>",
                            function() 
                            {
                                setHideLowFrequency(!(getHideLowFrequency()));

                                variablesChangedResetVisualization();
                            },
                            null);
                            
        return false;                   
    };
    
    $('.cam-dtal-lion-hide-lowfrequency').checkbox().checkbox(
    {
        beforeChecked:      onLowFrequencyChange,
        beforeUnchecked:    onLowFrequencyChange,
    });

    // -------------------------------------------------------
    // ------ Setup events for 'Show abstract' switch -------- 
    // -------------------------------------------------------
        
    onFullAbstractChange = function() 
    {   
        setFullAbstract(!(getFullAbstract()));

        saveStateToURL();
                            
        return false;                   
    };
    
    $('.cam-dtal-lion-full-abstract').checkbox().checkbox(
    {
        beforeChecked:      onFullAbstractChange,
        beforeUnchecked:    onFullAbstractChange,
    });
  
    // -------------------------------------------------------
    // ------------ Setup close event on search area --------- 
    // -------------------------------------------------------

    $('.cam-dtal-lion-hide-search-box').on("click", function()
    {
        $('.ui.accordion.cam-dtal-lion-topbar').accordion('close', 0);  
    });

    $('.cam-dtal-lion-search-box').on("click", function()
    {
        if (getSource() == "")  return false;

        $('.ui.accordion.cam-dtal-lion-topbar').accordion('toggle', 0); 

        return false;       
    });
    
    $('.ui.accordion.cam-dtal-lion-topbar').accordion(
    {
        duration: 250,
        onOpening: function()
        {
            // Switch off scrollbars to prevent large size of 
            // visualization area generating scrollbar 
            // before it is reduced to fit
            
            $("body").css("overflow", "hidden");    

            // Create interval timer to resize canvas so that it appears smooth
            if (minimizesearch_accordion_timer == 0)
            {
                minimizesearch_accordion_timer = setInterval(function() {resizeVisualizationArea();},10);
            }
        },
        onClosing: function()
        {
            if (minimizesearch_accordion_timer == 0)
            {
                minimizesearch_accordion_timer = setInterval(function() {resizeVisualizationArea();},10);
            }
        },
        onOpen: function() 
        {   
            $("body").css("overflow", "auto");  

            $('.cam-dtal-lion-hide-search-box').removeClass("down");
            $('.cam-dtal-lion-hide-search-box').addClass("up");         
        
            if (minimizesearch_accordion_timer != 0) 
            {
                clearInterval(minimizesearch_accordion_timer);
                minimizesearch_accordion_timer = 0;
                resizeVisualizationArea();              
            }
        },
        onClose: function()
        {
            $('.cam-dtal-lion-hide-search-box').removeClass("up");
            $('.cam-dtal-lion-hide-search-box').addClass("down");           
    
            if (minimizesearch_accordion_timer != 0) 
            {
                clearInterval(minimizesearch_accordion_timer);
                minimizesearch_accordion_timer = 0;
                resizeVisualizationArea();              
                $("body").css("overflow", "auto");              
            }
        }
    }); 

    // -------------------------------------------------------
    // -------------- Setup events on input fields ----------- 
    // -------------------------------------------------------
        
    $('#cam-dtal-lion-search-term-src-input').on("input", function ()
    {
        src_selected = false;

        $('#cam-dtal-lion-search-term-src').children().last().stop().animate({scrollTop:0}, 100);
        
        if ($(this).val() == "") resetPage(true);
    });
            
    $('#cam-dtal-lion-search-term-dest-input').on("input", function ()
    {
        dest_selected = false;

        $('#cam-dtal-lion-search-term-dest').children().last().stop().animate({scrollTop:0}, 100);
        
        if ($(this).val() == "")
        {       
            setSearchItemValue("dest", "");
                    
            saveStateToURL();
        }   
    });

    $('#cam-dtal-lion-search-term-searchadd-input').on("input", function ()
    {
        searchadd_selected = false;

        $('.cam-dtal-lion-visualization-graph-add-term').css("width", "90%");

        $('#cam-dtal-lion-search-term-src').children().last().stop().animate({scrollTop:0}, 100);   
    });

    $('#cam-dtal-lion-search-term-searchadd-input').on("focus", function ()
    {
        $('.cam-dtal-lion-visualization-graph-add-term').css("width", "90%");
    });

    $('#cam-dtal-lion-search-term-searchadd-input').on("keypress", function (e)
    {
        if (e.keyCode == 13)
        {
            var input_value = $('#cam-dtal-lion-search-term-searchadd-input').val();

            if (input_value.indexOf(":") != -1) addSearchNode(input_value, input_value);
        }
    });

    // -------------------------------------------------------
    // -------------- Setup start/end date inputs ------------ 
    // -------------------------------------------------------
    
    setYearStart(date_range_year_min);
    setYearEnd(date_range_year_max);
    
    $(document).on('click', '.cam-dtal-lion-input-date-start', function(e)
    {
        date_range_year_current_start = $(".cam-dtal-lion-input-date-start").val();
    });

    $(document).on('click', '.cam-dtal-lion-input-date-end', function(e)
    {
        date_range_year_current_end = $(".cam-dtal-lion-input-date-end").val();
    });
    
    onDateChanged = function (date, text, mode) 
    {
        // onDateChanged
        
        // The Semantic UI calendar extension https://github.com/mdehoog/Semantic-UI-Calendar 
        // calls onChange even when there's no actual 
        // change so explicitly check values
        
        var date_changed = true;
        var date_input_id = $(this).attr("id");
        
        switch (date_input_id)
        {   
            case "cam-dtal-lion-date-start":    if (text == date_range_year_current_start)  date_changed = false;  break;               
            case "cam-dtal-lion-date-end":      if (text == date_range_year_current_end)    date_changed = false;  break;                               
        }
        
        if (!date_changed) return true;
        
        switch (date_input_id)
        {   
            case "cam-dtal-lion-date-start":    
            
                $('.cam-dtal-lion-input-date-start').val(text);
                $("#cam-dtal-lion-date-start").calendar('blur');
                
                break;              
                
            case "cam-dtal-lion-date-end":

                $('.cam-dtal-lion-input-date-end').val(text);           
                $("#cam-dtal-lion-date-end").calendar('blur');                                                          
                
                break;                              
        }
        
        showConfirmIfData(  "Page reload required",
                            "<h4>Changing date range requires page to be reloaded</h4>" +
                            "<p>This will reset all nodes and edges. Are you sure you want to do that?</p>",
                            function()
                            {   
                                // As we've changed dates, state variables have changed
                                // Run 'set' method calls in case other functions must be called
                                // Note: calling 'getYearStart'/'getYearEnd' won't return new value until onChanged has completed

                                setYearStart(getYearStart());
                                setYearEnd(getYearEnd());

                                variablesChangedResetVisualization();

                                return true;
                            },
                            function ()
                            {
                                hideDialogs();

                                switch (date_input_id)
                                {   
                                    case "cam-dtal-lion-date-start":    
                                    
                                        $("#cam-dtal-lion-date-start").calendar('set date', new Date(date_range_year_current_start, 0, 1), true, false);
                                        
                                        break;              
                                        
                                    case "cam-dtal-lion-date-end":
                                    
                                        $("#cam-dtal-lion-date-end").calendar('set date', new Date(date_range_year_current_end, 0, 1), true, false);                                                            
                                        
                                        break;                              
                                }
                                
                                return false;
                            });
                        
        return true;
    },
    
    $('#cam-dtal-lion-date-start').calendar(
    {
        type:       'year',
        minDate:    new Date(parseInt(date_range_year_min), 0, 1),
        maxDate:    new Date(parseInt(date_range_year_max), 0, 1),      
        onChange:   onDateChanged,              
        formatter: 
        {
            date: function (date, settings) 
            {               
                var year = new Date(date).getFullYear();

                if (year < parseInt(date_range_year_min))   year = date_range_year_min; 
                if (year > parseInt(date_range_year_max))   year = date_range_year_max; 
                if (year > parseInt(getYearEnd()))          setYearEnd(year);
                                                
                return year;
            }
        },

		onShow: function() { 
			$('.cam-dtal-lion-popup-yearstart').popup('destroy');
			
	   	},
		onHidden: function() {
			if (!$('.cam-dtal-lion-popup-yearstart').popup('exists')){
				$('.cam-dtal-lion-popup-yearstart').removeClass('visible')
				$('.cam-dtal-lion-popup-yearstart').popup({content:'Select start year'});
			}
		},

 
    }); 
    
    $('#cam-dtal-lion-date-end').calendar(
    {
        type:       'year',
        minDate:    new Date(parseInt(date_range_year_min), 0, 1),
        maxDate:    new Date(parseInt(date_range_year_max), 0, 1),      
        onChange:   onDateChanged,      
        formatter: 
        {
            date: function (date, settings) 
            {               
                var year = new Date(date).getFullYear();

                if (year < parseInt(date_range_year_min))   year = date_range_year_min; 
                if (year > parseInt(date_range_year_max))   year = date_range_year_max; 
                if (year < parseInt(getYearStart()))        setYearStart(year);
                
                return year;
            }
        }, 

		onShow: function() { 
			$('.cam-dtal-lion-popup-yearend').popup('destroy');
			
	   	},
		onHidden: function() {
			if (!$('.cam-dtal-lion-popup-yearend').popup('exists')){
				$('.cam-dtal-lion-popup-yearend').removeClass('visible')
				//TEJAS: start year has been removed, it's now just select year
				//$('.cam-dtal-lion-popup-yearend').popup({content:'Select end year'});
				$('.cam-dtal-lion-popup-yearend').popup({content:'Select year'});
			}
		},
         
    }); 

    // -------------------------------------------------------
    // ---------- Setup range of acceptable weights ---------- 
    // -------------------------------------------------------
    
	//TEJAS: THIS IS NOW DONE ON META DATA LOAD	
    //setWeightMin(weight_range_min);
    //setWeightMax(weight_range_max);

    // -------------------------------------------------------
    // --- Setup events on hide/reveal destination buttons --- 
    // -------------------------------------------------------

	$('.cam-dtal-lion-visualization-graph-options-top').click(function () {
		uiDiscoveryPagingButtonOnClick(null,getCurrentDiscoveryPage() + 1)		
	});


    $("#cam-dtal-lion-reveal-destination").click(function ()
    {
		/*
        if (!($("#cam-dtal-lion-reveal-destination").hasClass("disabled"))) 
        {
            showDestinationField();
            focusDestinationField();
        } 
		*/
		selectSearchMode('closed')		
    });

	/*
    $("#cam-dtal-lion-hide-destination").click(function ()
    {
        hideDestinationField(); 
        setSearchItemValue("dest", ""); 
        saveStateToURL();
    });
	*/

    $("#cam-dtal-lion-set-open-discovery").click(function ()
    {
	    /*	
        if (!($("#cam-dtal-lion-set-open-discovery").hasClass("disabled"))) 
        {
			setOpenDiscovery(0)
		    //this isn't run when you disable open discovery, it is run by one of the sub-functions	when you enanle it
			initVisualization();    
		}
		else {
			setOpenDiscovery(1) 
		}
		*/
		selectSearchMode('open')
        //saveStateToURL();
    });

    $("#cam-dtal-lion-set-neighbours").click(function ()
    {
		selectSearchMode('neighbours')
    });

    // -------------------------------------------------------
    // Customization of Semantic UI search fields for autocomplete
    // -------------------------------------------------------

    $.fn.search.settings.templates.category = function(response) 
    {
        // Reproduce process normally used to create autocomplete HTML 
        // but adding in stylesheet based on category
        
        var div_all = document.createElement("div");
        
        for (var category in response.results)
        {   
            var div_category = document.createElement("div");
            div_category.setAttribute("class", "category " + category);
            
            // *** NOT IDEAL: we should be setting the colour through 
            // stylesheets, however semantic-ui seems to be very stubborn
            // in terms of forcing stylesheets on us
            
			//TEJAS: switched out DNAMutation, ProteinMutation and SNP for just Mutation
            var text_colour = "";
            switch (category)
            {
                case "Chemical":        text_colour = "#8fcfff"; break;
                case "Disease":         text_colour = "#ee5a5a"; break;
                //case "DNA Mutation":    text_colour = "orange"; break;
                
                case "Mutation":        text_colour = "orange"; break;
				case "Gene":            text_colour = "#7fa2ff"; break;
                //case "Protein Mutation": text_colour = "teal"; break;
                //case "SNP":             text_colour = "cyan"; break;
                case "Species":         text_colour = "beige"; break;
                case "Chemical":        text_colour = ""; break;
            }

            div_category.setAttribute("style", "background:" + text_colour);
            
            var div_name = document.createElement("div");
            div_name.setAttribute("class", "name cam-dtal-lion-autocomplete-name");
            
            // Perform extra styling based on category 
            // in case category is very wide
            
			//TEJAS: switched out DNAMutation, ProteinMutation and SNP for just Mutation
            switch (category)
            {
                case "Mutation":
                    div_name.setAttribute("style", "font-size:0.7em;padding-top:12px;color:#000");
                    break;          
                //case "DNA Mutation":
                //    div_name.setAttribute("style", "font-size:0.7em;padding-top:12px;color:#000");
                //    break;          
                //case "Protein Mutation":
                //    div_name.setAttribute("style", "font-size:0.7em;padding-top:12px;color:#fff;");
                //    break;
                case "Gene":
                case "Hallmark":
                    div_name.setAttribute("style", "padding-top:12px;color:#fff;");
                    break;          
                default:
                    div_name.setAttribute("style", "padding-top:12px;color:#000;");         
                    break;
            }
            
            div_name.appendChild(document.createTextNode(category));
            div_category.appendChild(div_name);
            
            var category_results = response.results[category];
            
            for(var i = 0; i < category_results.results.length; i++)
            {
                var current_result = category_results.results[i];
                            
                var a_result = document.createElement("a");
                a_result.setAttribute("class", "result");
                a_result.setAttribute("href", current_result.url);
                
                var div_content = document.createElement("div");
                var div_title = document.createElement("div");
                var div_description = document.createElement("div");
                var div_scrollbar = document.createElement("div");

                div_content.setAttribute("class", "content");
                div_title.setAttribute("class", "title");
                div_description.setAttribute("class", "description cam-dtal-lion-autocomplete-description cam-dtal-lion-autocomplete-equivalents cam-dtal-lion-custom-scrollbar");
                div_scrollbar.setAttribute("class", "cam-dtal-lion-custom-scrollbar");

                div_title.appendChild(document.createTextNode(current_result.title));
                div_description.appendChild(document.createTextNode(current_result.description));
                // div_description.setAttribute("data-content", current_result.description);            
                // div_description.setAttribute("data-position", 'top center');         
                // div_description.setAttribute("onmouseover", "javascript:showPopup(this);");
                
                div_content.appendChild(div_title);
                div_scrollbar.appendChild(div_description);
                div_content.appendChild(div_scrollbar);
                
                a_result.appendChild(div_content);
                div_category.appendChild(a_result);         
            }
                    
            div_all.appendChild(div_category);
        }
        
        return div_all.innerHTML; 
    };

    function showPopup(element)
    {
        $(element).popup({lastResort: true});       
        $(element).popup('show');   
    }

    // -------------------------------------------------------
    // --- Setup autocomplete for 'src' and 'dest' fields ---- 
    // -------------------------------------------------------

    $('#cam-dtal-lion-search-term-src')
      .search({
		selectFirstResult: true,
        apiSettings: {  
            onResponse: function(query_response) {

            var
              response = {
                results : {}
              }
            ;
            $.each(query_response, function(index, item) 
            {
              var
                label   = item.label || 'Unknown',
                maxResults = 8
              ;
              //TEJAS: these + SNP have been substituted for Mutation
              //if (label == "ProteinMutation")   label = "Protein Mutation";
              //if (label == "DNAMutation")       label = "DNA Mutation";       
              if(index >= maxResults) {
                return false;
              }
              // create new category
              if(response.results[label] === undefined) {
                response.results[label] = {
                  name    : label,
                  results : []
                };
              }
              // add result to category
              response.results[label].results.push({
                title       : item.name,
                description : item.equivalents,
                url         : 'javascript:(searchItemSelected("src", "' + item.id + '"));'
              });
            });
            return response;
          },    
          url: 'get_terms/?terms={query}'
        },
        type          : 'category', 
        minCharacters : 1,
        autofocus   : false
      })
    ;

    $('#cam-dtal-lion-search-term-dest')
      .search({
		selectFirstResult: true,
        apiSettings: {
            onResponse: function(query_response) {

            var
              response = {
                results : {}
              }
            ;
            $.each(query_response, function(index, item) 
            {
              var
                label   = item.label || 'Unknown',
                maxResults = 8
              ;
		      //TEJAS: these have been substituted for SNP
              //if (label == "ProteinMutation")   label = "Protein Mutation";
              //if (label == "DNAMutation")       label = "DNA Mutation";       
              if(index >= maxResults) {
                return false;
              }
              // create new category
              if(response.results[label] === undefined) {
                response.results[label] = {
                  name    : label,
                  results : []
                };
              }
              // add result to category
              response.results[label].results.push({
                title       : item.name,
                description : item.equivalents,
                url         : 'javascript:(searchItemSelected("dest", "' + item.id + '"));'
              });
            });
            return response;
          },    
          url: 'get_terms/?terms={query}'
        },
        type          : 'category', 
        minCharacters : 1,
        autofocus   : false    
      })
    ;

    $('#cam-dtal-lion-search-term-searchadd')
      .search({
		selectFirstResult: true,
        apiSettings: {
            onResponse: function(query_response) {

            var
              response = {
                results : {}
              }
            ;
            $.each(query_response, function(index, item) 
            {
              var
                label   = item.label || 'Unknown',
                maxResults = 8
              ;
		      //TEJAS: these have been substituted for SNP
              //if (label == "ProteinMutation")   label = "Protein Mutation";
              //if (label == "DNAMutation")       label = "DNA Mutation";       
              if(index >= maxResults) {
                return false;
              }
              // create new category
              if(response.results[label] === undefined) {
                response.results[label] = {
                  name    : label,
                  results : []
                };
              }
              // add result to category
              response.results[label].results.push({
                title       : item.name,
                description : item.equivalents,
                url         : 'javascript:(addSearchNode("' + item.id + '", "' + item.name + '"));'
              });
            });
            return response;
          },    
          url: 'get_terms/?terms={query}'
        },
        onResultsClose: function()
        {
            // Reduce width of container to prevent it blocking mouse click on other areas of page

            setTimeout(function()
            {
                $('.cam-dtal-lion-visualization-graph-add-term').css("width", "auto");      
            }, 1000);
        }, 
        type          : 'category', 
        minCharacters : 1,
        showNoResults: false,
        autofocus   : false    
      })
    ;

    // -------------------------------------------------------
    // ---------------- Monitor change of URL ---------------- 
    // -------------------------------------------------------
    
    $(window).on("popstate", function(event) 
    {
        // Redraw graph in the event of URL change

        loadStateFromURL();             
    });

    // -------------------------------------------------------
    // ------------------- Initialize page ------------------- 
    // -------------------------------------------------------
    
    loadStateFromURL();
});


});



function initErrorReporting()
{
    // ---------------------------------------  
    // Initialize error reporting
    // ---------------------------------------  

    window.onerror = function(message, file, line) 
    {
        logErrorOnServer(file + ':' + line + '\n\n' + message, [{"url": window.location.href}]);
    };  
}   

function initCoreUI()
{
    // ---------------------------------------  
    // Initialize core UI
    // ---------------------------------------  

    // Initialize edge sort options menu
    initEdgeMetricOptions();
    // Initialize aggregation metric options menu
	initAggregationFuncOptions();

    // Initialize object types menu

    initTypeOptions();
}

function initEdgeMetricOptions()
{
    // ---------------------------------------  
    // Initialize edge metric options
    // ---------------------------------------  

    var edge_metric_options_html = '';

    for(var i = 0; i < edge_metric_values_index.length; i++)
    {
        edge_metric_options_html += '<div class="item cam-dtal-lion-edge-metric" data-value="edge-sort" data-subvalue="' + edge_metric_values_index[i] + '"><i class="ui green checkmark icon cam-dtal-lion-edge-metric-tick cam-dtal-lion-edge-metric-tick-' + edge_metric_values_index[i] + '"></i>' + edge_metric_values_data[i].short+ '</div>';

        // Remove popupup to avoid problem of menu disappearing - 08/06/2017        

        /*
        edge_metric_options_html += '<div class="item cam-dtal-lion-edge-metric" data-content="' + edge_metric_values_data[i].long + '" data-position="left center" data-value="edge-sort" data-subvalue="' + edge_metric_values_index[i] + '"><i class="ui green checkmark icon cam-dtal-lion-edge-metric-tick cam-dtal-lion-edge-metric-tick-' + edge_metric_values_index[i] + '"></i>' + edge_metric_values_data[i].short+ '</div>';
        */
    }

    $('.cam-dtal-lion-edge-metric-options').append(edge_metric_options_html);
    $('.cam-dtal-lion-edge-metric').popup();

    if (edge_metric_values_index.indexOf(edge_metric) != -1) setEdgeMetric(edge_metric);
}



function initAggregationFuncOptions()
{
    // ---------------------------------------  
    // Initialize aggregation metric options
    // ---------------------------------------  

    var aggregation_func_options_html = '';

    for(var i = 0; i < aggregation_func_values_index.length; i++)
    {
        aggregation_func_options_html += '<div class="item cam-dtal-lion-aggregation-func" data-value="aggregation-sort" data-subvalue="' + aggregation_func_values_index[i] + '"><i class="ui green checkmark icon cam-dtal-lion-aggregation-func-tick cam-dtal-lion-aggregation-func-tick-' + aggregation_func_values_index[i] + '"></i>' + aggregation_func_values_data[i].short+ '</div>';

    }

    $('.cam-dtal-lion-aggregation-func-options').append(aggregation_func_options_html);
    $('.cam-dtal-lion-aggregation-func').popup();

    if (aggregation_func_values_index.indexOf(aggregation_func) != -1) setAggregationFunc(aggregation_func);
}






function initTypeOptions()
{
    // ---------------------------------------  
    // Initialize object type options
    // ---------------------------------------  

    var types_html  = '';
    var expand_types_html = '';

    for(var i = 0; i < alltypes_code.length; i++)
    {
        types_html += '<div class="item ' + alltypes_code[i] + '" data-value="' + alltypes_code[i] + '">' + alltypes_description[i] + '</div>';

        expand_types_html += '<div class="item nodeexpandtype ' + alltypes_code[i] + '" data-value="' + alltypes_code[i] + '">' + alltypes_description[i] + '</div>';


    }

    $('.cam-dtal-lion-type-options').append(types_html);
    $('.cam-dtal-lion-dialog-node-expandbytype-content').append(expand_types_html);


    revertTypesToInternalValues();  
}   

function initExternalData()
{
    // ---------------------------------------  
    // Initialize any data that depends on external data sources
    // ---------------------------------------  

    $.ajax(
    {
        type:'get',
        url: external_obo_context_url,
        success: function(data) 
        {
            external_obo_context_data = JSON.parse(data);        
        },
        statusCode: 
        {
            404: function() {console.log('Failed to load: ' + external_obo_context_url);}
        }
    }); 
}

function initVariables(reset_callstack)
{
    // ---------------------------------------  
    // Initialize variables 
    // ---------------------------------------  

    // We assume 'initCoreUI' has already run
    // as setting of some variables modifies core UI

    global_src_oid          = "";
    global_dest_oid         = "";

    setDiscoveryMode(discovery_mode_default);   
    setOpenDiscovery(open_discovery_default);   
	setHideLowFrequency(hide_lowfrequency_default);
    setFullAbstract(full_abstract_default);     
    
    visualization_mode = visualization_mode_default;

    setLayoutModeInternal(getLayoutModeDefault());
    setEdgeMetric(edge_metric_default);

    setAggregationFunc(aggregation_func_default);


    updateWeightRangeMinMax();


    if (reset_callstack)
    {
        callstack_recording     = [];
        callstack_running       = [];       
    }   
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// --------------- Getting/saving state via URL -------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function loadStateFromURL()
{
    // ---------------------------------------  
    // Load state from URL 
    // ---------------------------------------  

    // Get all parameters

    var all_params = getAllUrlParams(window.location.href);

    // Initialize call stack

    initCallStack();

    // Callstack parameters are constituted as follows:
    // ------------------------------------------------------
    // addCallStack("init", {mode:, src:, dest:, year_start:, year_end:, filter_year_start:, filter_year_end:, discovery_mode:, open_discovery:, edge_metric});
    // addCallStack("add", {oid: });
    // addCallStack("delete", {oid: });
    // addCallStack("expand", {oid: });
    // addCallStack("collapse", {oid: });
    // addCallStack("deleteorphans", {});
    //
    // and correspond to the url parameters:
    // init:            use src, dest, year_start, year_end, discovery_mode, open_discovery to build init
    // add:             param value 'a'
    // delete:          param value 'd'
    // expand:          param value 'e'
    // collapse:        param value 'c'
    // deleteorphans:   param value 'do'

    // Construct 'init' initial callstack request that contains 
    // context that will be used in all subsequent requests

    var init_params         = {};
    var types_param         = [];
    var filter_types_param  = [];

    for (var i = 0; i < all_params.length; i++)
    {
        var param_name  = all_params[i].name;
        var param_value = all_params[i].value;

        switch(param_name)
        {
            case "mode":
            case "src":         
            case "dest":        
            //case "year_start":  
            case "year_end":    
            //case "filter_year_start":
            case "filter_year_end":
            case "weight_start":
            case "weight_end":
            case "filter_weight_start":
            case "filter_weight_end":
            case "discovery_mode":
			case "open_discovery":
            case "hide_lowfrequency":
            case "full_abstract":
            case "edge_metric":
            case "aggregation_func":
            case "layout_mode":

                init_params[param_name] = param_value;

                break;

			case "db":
                init_params['hide_lowfrequency'] = param_value == 'inmemory' ? false : true ;

                break;

			//case "pd":
            //    init_params['currentdiscoverypage'] = param_value ;

            //     break;

            case "type":

                types_param.push(param_value);

                break;

            case "filter_type":

                filter_types_param.push(param_value);

                break;
        }
    }

    var types_value = types_param;

    if (types_param.length == 0) types_value = getAllTypes();

    init_params['type'] = types_value;

    // Interpret filter_type GET params
    // If empty array, then select all filter types
    // If array has one element which equals 'notype', then select no filter types

    var filter_types_value = filter_types_param;

    if (filter_types_param.length == 0) filter_types_value = init_params['type'];
    else
    {
        if ((filter_types_param.length == 1) && (filter_types_param[0] == "notype")) filter_types_value = [];
    }

    init_params['filter_type'] = filter_types_value;

    addCallStack("init", init_params);

    for (var i = 0; i < all_params.length; i++)
    {
        var param_name  = all_params[i].name;
        var param_value = all_params[i].value;
        var callstack_action = "";

        switch(param_name)
        {
            case "a":       callstack_action = "add";                   break;
            case "d":       callstack_action = "delete";                break;
            case "e":       callstack_action = "expand";                break;
            case "c":       callstack_action = "collapse";              break;
            case "pd":      callstack_action = "discoverypage";         break;
            case "do":      callstack_action = "deleteorphans";         break;
        }

        if (callstack_action == "expand") { 
            var expand_params = param_value.split("++")
            var cs_params = {oid: expand_params[0] }
            if (expand_params.length > 1) cs_params['nodetype'] = expand_params[1];
            console.log('in expand in loadstatefromurl')
            console.log(cs_params)

            addCallStack(callstack_action, cs_params);
        }    
        else if (callstack_action != "") {
            addCallStack(callstack_action, {oid: param_value});
        }
    }   

    runRecordedCallStack();
}

function saveStateToURL()
{   
    // ---------------------------------------  
    // Saves state to URL
    // ---------------------------------------  
	console.log('in savestatetourl')
	console.trace()

	//console.log(getFilterWeightMin())
	//console.log(getFilterWeightMax())
	//console.log(getFilterWeightStart())
	//console.log(getFilterWeightEnd())

 
    var url = "/";
    var query_parameters = [];

    // Add basic parameters

    if (getSource()             != "")                          query_parameters.push("src="                    + (getSource()));
    if (getDestination()        != "")                          query_parameters.push("dest="                   + (getDestination()));  
    //if (getYearStart()          != date_range_year_min)         query_parameters.push("year_start="             + (getYearStart()));
    if (getYearEnd()            != date_range_year_max)         query_parameters.push("year_end="               + (getYearEnd()));
    //if (getFilterYearStart()    != getYearStart())              query_parameters.push("filter_year_start="      + (getFilterYearStart()));
    if (getFilterYearEnd()      != getYearEnd())                query_parameters.push("filter_year_end="        + (getFilterYearEnd()));
    if (getWeightStart() != null && getWeightStart() != getWeightMin())              query_parameters.push("weight_start="           + (getWeightStart()));
    if (getWeightEnd() != null &&  getWeightEnd()          != getWeightMax())              query_parameters.push("weight_end="             + (getWeightEnd()));
    if (getFilterWeightStart() != null && getFilterWeightStart()  != getFilterWeightMin())            query_parameters.push("filter_weight_start="    + (getFilterWeightStart()));
    if (getFilterWeightEnd() != null && getFilterWeightEnd()    != getFilterWeightMax())              query_parameters.push("filter_weight_end="      + (getFilterWeightEnd()));
    //TEJAS - using the above 
	//if (getFilterWeightStart()  != getWeightStart())            query_parameters.push("filter_weight_start="    + (getFilterWeightStart()));
    //if (getFilterWeightEnd()    != getWeightEnd())              query_parameters.push("filter_weight_end="      + (getFilterWeightEnd()));
    //if (getDiscoveryMode()      != discovery_mode_default)      query_parameters.push("discovery_mode="         + (getDiscoveryMode() ? 'true' : 'false'));
    if (getDiscoveryMode()      != discovery_mode_default)      query_parameters.push("discovery_mode="         + getDiscoveryMode());
    if (getOpenDiscovery()      != open_discovery_default)      query_parameters.push("open_discovery="         + getOpenDiscovery());

	//if ((getOpenDiscovery() || getDestination() != "") && getCurrentDiscoveryPage() != 1 )      query_parameters.push("pd="  + getCurrentDiscoveryPage()  );


    //if (getHideLowFrequency()   != hide_lowfrequency_default)   query_parameters.push("hide_lowfrequency="      + (getHideLowFrequency() ? 'true' : 'false'));
    if (getHideLowFrequency()   != hide_lowfrequency_default)   query_parameters.push("db="      + (getHideLowFrequency() ? 'neo4j' : 'inmemory'));
    if (getFullAbstract()       != full_abstract_default)       query_parameters.push("full_abstract="          + (getFullAbstract() ? 'true' : 'false'));
    if (getEdgeMetric()         != edge_metric_default)         query_parameters.push("edge_metric="            + getEdgeMetric());
    if (getAggregationFunc()  != aggregation_func_default)  query_parameters.push("aggregation_func="     + getAggregationFunc());
    if (getVisualizationMode()  != visualization_mode_default)  query_parameters.push("mode="                   + getVisualizationMode());
    if (getLayoutMode()         != getLayoutModeDefault())         query_parameters.push("layout_mode="            + getLayoutMode());


	//console.log(query_parameters)

    // If not all possible filter types selected, add filter types parameters
    // Note: all 'possible' filter types will depend on the types selected from server

    if (getFilterTypes().length != getTypes().length)
    {
        var filter_types_selected = getFilterTypes();

        if (filter_types_selected.length == 0) query_parameters.push("filter_type=notype");
        else
        {
            for(var i = 0; i < filter_types_selected.length; i++) query_parameters.push("filter_type=" + filter_types_selected[i]);
        }
    } 

    if ((getTypes().length != getAllTypes().length) && (getTypes().length != 0))
    {
        var types_selected = getTypes();

        for(var i = 0; i < types_selected.length; i++) query_parameters.push("type=" + types_selected[i]);
    }

    // Add more complex state parameters based on call stack history

	console.log('callstack_recording')
	console.log(callstack_recording)


    for(var i = 0; i < callstack_recording.length; i++)
    {
        var param_name = "";
        var param_value = callstack_recording[i].parameters.oid;
        var param_nodetype = callstack_recording[i].parameters.nodetype;

        switch (callstack_recording[i].action)
        {
            case "add":                 param_name = "a";   break;
            case "delete":              param_name = "d";   break;
            case "expand":              param_name = "e";   break;
            case "collapse":            param_name = "c";   break;
            case "deleteorphans":       param_name = "do";  break;          
            case "discoverypage":       param_name = "pd";  break;
        }

        if (param_name != "")
        {
            var namevalue = param_name + "=";

            if (param_value !== undefined) {
                namevalue += (param_value);
                if (param_nodetype !== undefined) namevalue += ('++' + param_nodetype);
            }
            query_parameters.push(namevalue);
        }
    }   

    if (query_parameters.length != 0) url += "?" + query_parameters.join("&");
    
    $('.cam-dtal-lion-share-url').html(base_url + url);

    window.history.pushState("object or string", "LION Index", url);
}

function getAllUrlParams(url) 
{
    // ---------------------------------------  
    // Get all URL parameters
    // ---------------------------------------  

    // Modified from https://www.sitepoint.com/get-url-parameters-with-javascript/

    // get query string from url (optional) or window

    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here

    var obj = [];

    // if query string exists

    if (queryString) 
    {
        // stuff after # is not part of query string, so get rid of it

        queryString = queryString.split('#')[0];

        // split our query string into its component parts

        var arr = queryString.split('&');

        for (var i=0; i<arr.length; i++) 
        {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2

            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function(v) 
            {
                paramNum = v.slice(1,-1);
                return '';
            });

            // set parameter value (use 'true' if empty)

            var paramValue = typeof(a[1])=== 'undefined' ? true : a[1];

            paramName   = decodeURIComponent(paramName);
            paramValue  = decodeURIComponent(paramValue);

            obj.push({"name": paramName, "value": paramValue});
        }
    }

    return obj;
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------------ Core parameter functions --------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function setSource(src_oid)
{
    // ---------------------------------------  
    // Set source oid
    // ---------------------------------------  

    if (src_oid === undefined) return;

    global_src_oid = src_oid.trim();
}

function getSource()
{
    // ---------------------------------------  
    // Get source oid
    // ---------------------------------------  

    return global_src_oid;
}

function setDestination(dest_oid)
{
    // ---------------------------------------  
    // Set destination oid
    // ---------------------------------------  

    if (dest_oid === undefined) return;

    global_dest_oid = dest_oid.trim();

    graphHasClosed();
}

function getDestination()
{
    // ---------------------------------------  
    // Get destination oid
    // ---------------------------------------  

    return global_dest_oid;
}

function isClosedGraph()
{
    // ---------------------------------------  
    // Clean function to determine whether graph is open or closed
    // ---------------------------------------  

    var src     = getSource();
    var dest    = getDestination();

    if (dest !== undefined) dest = dest.trim();

    if ((dest == "") || (dest === undefined)) return false;

    return true;
}

function graphHasClosed()
{
    // Do anything that follows the graph becoming closed

    setLayoutModeInternal('cola');  
}

function setDiscoveryMode(new_discovery_mode)
{
    // ---------------------------------------  
    // Set discovery mode
    // ---------------------------------------  

    setUIBoolean("discovery_mode", new_discovery_mode, "Discovery mode");
}

function getDiscoveryMode()
{
    // ---------------------------------------  
    // Get state of discovery mode
    // ---------------------------------------  

    return discovery_mode;  
}



function setOpenDiscovery(new_open_discovery)
{
    // ---------------------------------------  
    // Set open_discovery
    // ---------------------------------------  
	console.log("new_open_discovery")
	console.log(new_open_discovery)
	//console.trace()
    if (new_open_discovery === undefined) return;
    open_discovery = new_open_discovery;
	if (open_discovery == 1){
		enableOpenDiscovery()
	} else {
		disableOpenDiscovery()
	}
}

function getOpenDiscovery()
{
    // ---------------------------------------  
    // Get state of open_discovery
    // ---------------------------------------  

    return open_discovery;  
}


function setCurrentDiscoveryPage(currentDiscoveryPage_ )
{
	currentDiscoveryPage = parseInt( currentDiscoveryPage_ )
}


function getCurrentDiscoveryPage()
{
	return currentDiscoveryPage;
}



function setEdgeMetric(edge_metric_value)
{
    // ---------------------------------------  
    // Sets value of edge metric
    // ---------------------------------------  

    if (edge_metric_value === undefined) return;

    $('.cam-dtal-lion-edge-metric-tick').attr("style", "visibility:hidden;");
    $('.cam-dtal-lion-edge-metric-tick-' + edge_metric_value).attr("style", "visibility:visible;");

    if (edge_metric != edge_metric_value)
    {
        edge_metric = edge_metric_value;

        updateWeightRangeMinMax();      
    }
}


function setAggregationFunc(aggregation_func_value)
{
    // ---------------------------------------  
    // Sets value of aggregation metric
    // ---------------------------------------  

    if (aggregation_func_value === undefined) return;

    $('.cam-dtal-lion-aggregation-func-tick').attr("style", "visibility:hidden;");
    $('.cam-dtal-lion-aggregation-func-tick-' + aggregation_func_value).attr("style", "visibility:visible;");

    if (aggregation_func != aggregation_func_value)
    {
        aggregation_func = aggregation_func_value;

        updateWeightRangeMinMax();      
    }
}




function getEdgeMetric()
{
    // ---------------------------------------  
    // Gets value of edge metric
    // ---------------------------------------  

    return edge_metric;
}


function getAggregationFunc()
{
    // ---------------------------------------  
    // Gets value of aggregation metric
    // ---------------------------------------  

    return aggregation_func;
}



function setHideLowFrequency(new_hide_lowfrequency)
{
    // ---------------------------------------  
    // Set whether or not we hide low-frequency terms
    // ---------------------------------------  
	//console.log('setHideLowFrequency')
	//console.log(new_hide_lowfrequency)
    setUIBoolean("hide_lowfrequency", new_hide_lowfrequency, "Hide low frequency");
}

function getHideLowFrequency()
{
    // ---------------------------------------  
    // Get state of whether we hide low-frequence terms
    // ---------------------------------------  

    return hide_lowfrequency;
}

function setFullAbstract(new_full_abstract)
{
    // ---------------------------------------  
    // Set whether or not we show full abstract instead of individual cooccurrences
    // ---------------------------------------  

    setUIBoolean("full_abstract", new_full_abstract, "Show full abstract");
}

function getFullAbstract()
{
    // ---------------------------------------  
    // Get state of whether we show full abstract instead of individual co-occurrences
    // ---------------------------------------  

    return full_abstract;
}

function setWeightMin(new_weight_range_min)
{
    // ---------------------------------------  
    // Sets minimum weight
    // ---------------------------------------  
	//console.log('setWeightMin: '+ new_weight_range_min.toString());

    if (!validateWeight(new_weight_range_min)) return false;

    weight_range_min = new_weight_range_min;
	if (getWeightStart() == null) {setWeightStart(weight_range_min);}

    $('cam-dtal-lion-weight-min').val(weight_range_min);

    //setWeightStart(weight_range_min);
}

function getWeightMin()
{
    // ---------------------------------------  
    // Gets minimum weight
    // ---------------------------------------  
	if (!neo4j_metadata || !neo4j_metadata.hasOwnProperty(getEdgeMetric())){return null }
	return neo4j_metadata[getEdgeMetric()][0]
    //return weight_range_min;
}

function setWeightMax(new_weight_range_max)
{
    // ---------------------------------------  
    // Sets maximum weight
    // ---------------------------------------  

    if (!validateWeight(new_weight_range_max)) return false;

    weight_range_max = new_weight_range_max;
	if (getWeightMax() == null) {setWeightEnd(weight_range_max);}

    $('cam-dtal-lion-weight-max').val(weight_range_max);
    
    //setWeightEnd(weight_range_max);
}

function getWeightMax()
{
    // ---------------------------------------  
    // Gets maximum weight
    // ---------------------------------------  

	if (!neo4j_metadata || !neo4j_metadata.hasOwnProperty(getEdgeMetric())){return null }
	return neo4j_metadata[getEdgeMetric()][1]
    //return weight_range_max;
}

function setWeightStart(new_weight_range_start)
{
    // ---------------------------------------  
    // Set global start weight
    // ---------------------------------------  

	//console.log('in setWeightStart');

    new_weight_range_start = parseFloat(new_weight_range_start);

    if (!validateWeight(new_weight_range_start)) return false;

    weight_range_start = new_weight_range_start;

    // We reset minimum weight filter to this minimum weight

    //$('.cam-dtal-lion-filter-range-weight-min').html(weight_range_start);

    //setFilterWeightStart(weight_range_start);

	//console.log(weight_range_start)
}

function getWeightStart()
{
    // ---------------------------------------  
    // Get global start weight
    // ---------------------------------------  

    return weight_range_start;
}

function setWeightEnd(new_weight_range_end)
{
    // ---------------------------------------  
    // Set global end weight
    // ---------------------------------------  

	//console.log('in setWeightEnd');
    
	new_weight_range_end = parseFloat(new_weight_range_end);

    if (!validateWeight(new_weight_range_end)) return false;

    weight_range_end = new_weight_range_end;    

    // We reset maximum weight filter to this maximum weight

    //$('.cam-dtal-lion-filter-range-weight-max').html(weight_range_end);

    //setFilterWeightEnd(weight_range_end);
	//console.log(weight_range_end)
}

function getWeightEnd()
{
    // ---------------------------------------  
    // Get global end weight
    // ---------------------------------------  

    return weight_range_end;
}

function setFilterWeightMin()
{
	var metrics =  _.map(edges_data, function(item){return item.core.data.metric }  );
	//console.log('old filter_weight_min: ' + filter_weight_min)
	var old_filter_weight_min = filter_weight_min
	filter_weight_min = metrics.length > 0 && isFinite(_.min(metrics)) ?  _.min(metrics)  : getWeightMin()  
	//console.log('new filter_weight_min: ' + filter_weight_min)
	//console.trace();
	if (getFilterWeightStart() == null || getFilterWeightStart() == old_filter_weight_min || 
		getFilterWeightStart() < filter_weight_min){
		
		setFilterWeightStart(filter_weight_min)
	
	}
	//showFilterWeight()
	$('.cam-dtal-lion-filter-range-weight-min').html(round(filter_weight_min,3));
}

function getFilterWeightMin()
{
	return filter_weight_min;
}

function setFilterWeightMax()
{
	var metrics =  _.map(edges_data, function(item){return item.core.data.metric }  );

	//console.log('old filter_weight_max: ' + filter_weight_max)
	var old_filter_weight_max = filter_weight_max
	filter_weight_max = metrics.length > 0 && isFinite(_.max(metrics)) ?  _.max(metrics)  : getWeightMax()  
	//filter_weight_max =  _.max(metrics)
	//console.log('new filter_weight_max: ' + filter_weight_max)
	//console.trace();
	
 
	if (getFilterWeightEnd() == null || getFilterWeightEnd() == old_filter_weight_max || getFilterWeightEnd() > filter_weight_max){
		setFilterWeightEnd(filter_weight_max)
	}
	//showFilterWeight()
	$('.cam-dtal-lion-filter-range-weight-max').html(round(filter_weight_max,3));
}

function getFilterWeightMax()
{
	return filter_weight_max;
}

function setFilterWeightStart(weight_range_start)
{
    // ---------------------------------------  
    // Sets start value of weight filter
    // ---------------------------------------  
	//console.log('calling setFilterWeightStart')
	//console.log(weight_range_start)
	//console.trace();

	if (weight_range_start == null) { 
		filter_weight_range_start =  weight_range_start
		if (filter_weight_range_start != null){
			$('#cam-dtal-lion-filter-weight-range-2').range('set value', filter_weight_range_start);
			$('.cam-dtal-lion-filter-weight-min-start-value').html(filter_weight_range_start);              
		}
		return  
	}

    weight_range_start = parseFloat(weight_range_start);

    if (!validateFilterWeight(weight_range_start)) return false;

    if (filter_weight_range_start != weight_range_start)
    {

		//console.log('updating the filterweightstart on the interface')

        filter_weight_range_start = weight_range_start;

        $('#cam-dtal-lion-filter-weight-range-2').range('set value', filter_weight_range_start);
        $('.cam-dtal-lion-filter-weight-min-start-value').html(filter_weight_range_start);              
    }
}

function getFilterWeightStart()
{
    // ---------------------------------------  
    // Get start value of weight filter
    // ---------------------------------------  

    //if (filter_weight_range_start < getWeightStart()) return getWeightStart();
    //if (filter_weight_range_start > getWeightEnd()) return getWeightEnd();

    return filter_weight_range_start;
}

function setFilterWeightEnd(weight_range_end)
{
    // ---------------------------------------  
    // Sets end value of weight filter
    // ---------------------------------------  
	//console.log('calling setFilterWeightEnd')
	//console.log(weight_range_end)
	//console.trace();

	if (weight_range_end == null) { 
		filter_weight_range_end =  weight_range_end
		if (filter_weight_range_end != null){
			$('#cam-dtal-lion-filter-weight-range-1').range('set value', filter_weight_range_end);
			$('.cam-dtal-lion-filter-weight-max-start-value').html(filter_weight_range_end);              
		}
		return  
	}
    weight_range_end = parseFloat(weight_range_end);

    if (!validateFilterWeight(weight_range_end)) return false;

    if (filter_weight_range_end != weight_range_end)
    {
        filter_weight_range_end = weight_range_end;

        $('#cam-dtal-lion-filter-weight-range-1').range('set value', filter_weight_range_end);
        $('.cam-dtal-lion-filter-weight-max-start-value').html(filter_weight_range_end);                
    }
}

function getFilterWeightEnd()
{
    // ---------------------------------------  
    // Get end value of weight filter
    // ---------------------------------------  

    //if (filter_weight_range_end < getWeightStart()) return getWeightStart();
    //if (filter_weight_range_end > getWeightEnd()) return getWeightEnd();

    return filter_weight_range_end;
}

function setYearStart(year_start)
{

    $('.cam-dtal-lion-filter-range-year-min').html(year_start);
	return false
    // ---------------------------------------  
    // Set start year
    // --------------------------------------- 
	//console.log('set start year')
	//console.log(year_start)
	//console.trace()
    
    if (!validateYear(year_start)) return false;
    
    $('#cam-dtal-lion-date-start').calendar("set date", new Date(year_start, 0, 1), true, false);

    // We reset start year filter to this start year

    $('.cam-dtal-lion-filter-range-year-min').html(year_start);
	//console.log('get here')


    setFilterYearStart(year_start);
}

function getYearStart()
{
    // ---------------------------------------  
    // Get start year
    // ---------------------------------------  

    return $('.cam-dtal-lion-input-date-start').val();
}

function setYearEnd(year_end)
{
    // ---------------------------------------  
    // Set end year
    // ---------------------------------------  

    if (!validateYear(year_end)) return false;
    
    $('#cam-dtal-lion-date-end').calendar("set date", new Date(year_end, 0, 1), true, false);

    $('.cam-dtal-lion-filter-range-year-max').html(year_end);

    // We reset end year filter to this end year
    
    setFilterYearEnd(year_end);
}

function getYearEnd()
{
    // ---------------------------------------  
    // Get end year
    // ---------------------------------------  

    return $('.cam-dtal-lion-input-date-end').val();
}

function setFilterYearStart(year_start)
{
    // ---------------------------------------  
    // Sets value of start year filter
    // but without updating actual graph
    // This is different from global start year as 
    // it only filters currently retrieved results
    // ---------------------------------------  
    //TEJAS - no year_start anymore	
	filter_date_range_year_start = year_start
	$('.cam-dtal-lion-filter-range-year-start-value').html(filter_date_range_year_start);               
	return false
	
	year_start = parseInt(date_range_year_min)

    if (!validateYear(year_start)) return false;
    if (year_start < getYearStart()) return false;

    if (filter_date_range_year_start != year_start)
    {
        $('#cam-dtal-lion-filter-date-range-2').range('set value', year_start);

        filter_date_range_year_start = year_start;
        $('.cam-dtal-lion-filter-range-year-start-value').html(filter_date_range_year_start);               
    }
}

function getFilterYearStart()
{
    // ---------------------------------------  
    // Get value of start year filter
    // ---------------------------------------  

    if (filter_date_range_year_start < getYearStart()) return getYearStart();

    return filter_date_range_year_start;
}

function setFilterYearEnd(year_end)
{
    // ---------------------------------------  
    // Sets value of end year filter
    // but without updating actual graph
    // This is different from global end year as 
    // it only filters currently retrieved results
    // ---------------------------------------  

    if (!validateYear(year_end)) return false;
    if (year_end > getYearEnd()) return false;

    if (filter_date_range_year_end != year_end)
    {
        $('#cam-dtal-lion-filter-date-range-1').range('set value', year_end);
        filter_date_range_year_end = year_end;
        $('.cam-dtal-lion-filter-range-year-end-value').html(filter_date_range_year_end);               
    }


	setMetricValueForEdges()
	setFilterWeightMin()
	setFilterWeightMax()
	showFilterWeight()

}

function getFilterYearEnd()
{
    // ---------------------------------------  
    // Get value of end year filter
    // ---------------------------------------  

    if (filter_date_range_year_end > getYearEnd()) return getYearEnd();

    return filter_date_range_year_end;
}

function setVisualizationMode(mode)
{
    // Set visualization mode

    if (mode === undefined) mode = visualization_mode_default;

    // Make mode tab active and others inactive
    
    $('.cam-dtal-lion-visualization-select').removeClass('active');
    $('.cam-dtal-lion-visualization-select-' + mode).addClass('active');
    $('.cam-dtal-lion-visualization-select-tab-' + mode).addClass('active');

    visualization_mode = mode; 

    saveStateToURL();
}

function setVisualizationModeText()
{
    // Enable text visualization mode 

    setVisualizationMode("text");
}

function setVisualizationModeGraph()
{
    // Enable text visualization mode 

    setVisualizationMode("graph");
}

function getVisualizationMode()
{
    // ---------------------------------------  
    // Get state of visualization mode
    // ---------------------------------------  

    return visualization_mode;
}

function setUIBoolean(name, value, descriptor)
{
    // ---------------------------------------  
    // Set value of UI boolean field
    // ---------------------------------------  

    if (value === undefined) return;

    var variable_class_name     = ".cam-dtal-lion-" + (name.replace("_", "-")); 
    var variable_value          = parseBoolean(value);

    if (variable_value != window[name])
    {
        window[name] = variable_value;
        
        // Set checkbox
        
        if (variable_value) $(variable_class_name).checkbox('set checked');
        else                $(variable_class_name).checkbox('set unchecked');       

        console.log(descriptor + " set to", window[name]);
    }   
}
function parseBoolean(boolean_value)
{
    // ---------------------------------------  
    // Parse boolean value
    // ---------------------------------------  

    if (boolean_value === 'true')   boolean_value = true;
    if (boolean_value === 'false')  boolean_value = false;

    return boolean_value;
}

function setTypes(types_list)
{
    // ---------------------------------------  
    // Set current source types
    // ---------------------------------------  

    if (types_list.length == 0)
    {
        showInfo("Resetting object types", "Impossible to query no object types so resetting to show all types");

        types_list = getAllTypes();
    }

    // If everything selected, then hide add button

    if (types_list.length == getAllTypes().length)
    {
        $('.cam-dtal-lion-type-add').hide();
    }
    else
    {
        $('.cam-dtal-lion-type-add').show();        
        $('.cam-dtal-lion-type-add').removeClass("write refresh");      
        $('.cam-dtal-lion-type-add').addClass("write");     
    }

    source_types = types_list;

    types_set_programmatically = true;

    $('.cam-dtal-lion-type').dropdown('set exactly', getTypes());

    types_set_programmatically = false;

    // Force filter types to match selected types

    setFilterTypes(source_types);
}

function getTypes()
{
    // ---------------------------------------  
    // Gets list of the source types currently set internally
    // ---------------------------------------  

    return source_types;
}

function getAllTypes()
{
    // ---------------------------------------  
    // Gets all possible filter types
    // ---------------------------------------  

    return alltypes_code;
}

function setFilterTypes(filter_types_selected)
{
    // ---------------------------------------  
    // Update internal filter types array and displayed filter types based on supplied array of selected filter types
    // ---------------------------------------  

    filter_types        = [];
    filter_types_all    = getAllTypes();

    // Sanitise list of filter types 

    for(var i = 0; i < filter_types_all.length; i++)
    {
        if (filter_types_selected.indexOf(filter_types_all[i]) != -1) filter_types.push(filter_types_all[i]);
    }

    var filter_types_elements = $('.cam-dtal-lion-filter-type div').toArray();

    for (var i = 0, j = filter_types_elements.length; i < j; i++) 
    {
        var filter_types_code = $(filter_types_elements[i]).attr("data-value");

        $(filter_types_elements[i]).removeClass('disabled');
        $(filter_types_elements[i]).find("i").removeClass('disabled');

        if (filter_types_selected.indexOf(filter_types_code) == -1)
        {
            $(filter_types_elements[i]).addClass('disabled');
            $(filter_types_elements[i]).find("i").addClass('disabled');
        }
    }
}

function getFilterTypes()
{
    // ---------------------------------------  
    // Gets all types to show
    // ---------------------------------------  

    return filter_types;
}


function getLayoutModeDefault()
{
    if (getOpenDiscovery()) {
        return layout_mode_default_od
    } else {
        return layout_mode_default
    }

}


function setLayoutModeInternal(new_layout_mode)
{
    // ---------------------------------------  
    // Sets new layout internally
    // ---------------------------------------  

    if (new_layout_mode === undefined) return;

    layout_mode = new_layout_mode;
}

function setLayoutMode(new_layout_mode)
{
    // ---------------------------------------  
    // Sets new layout
    // ---------------------------------------  

    if (new_layout_mode === undefined) return;

    $('.dropdown.cam-dtal-lion-visualization-graph-layout-set').dropdown('set selected', new_layout_mode);

    setLayoutModeInternal(new_layout_mode);
}

function getLayoutMode()
{
    // ---------------------------------------  
    // Gets current layout
    // ---------------------------------------  

    return layout_mode;
}   

function confirmTypesChange(removed_item)
{
    // ---------------------------------------  
    // Confirm whether user wants to change source types
    // ---------------------------------------  

    // First check whether things have changed at all

    var selected_types      = getTypesSelected();
    var current_types       = getTypes();

    // If removed value is not null, then remove from the selected types
    // so the list accurately reflects the true state of the types multiple selection

    if (removed_item !== null)
    {
        var removed_item_position = selected_types.indexOf(removed_item);

        if (removed_item_position != -1) selected_types.splice(removed_item_position, 1);
    }

    // If nothing changed, do nothing

    if (sameElements(selected_types, current_types)) return;

    showConfirmIfData(  "Change object types",
                        "<h4>Are you sure you want to change the object types retrieved from the server?</h4>" +
                        "<p>This will reset your current graph to its starting position</p>",
                        function() 
                        {                       
                            setTypes(selected_types);

                            variablesChangedResetVisualization();

                            type_dropdown_hide = true;

                            return false;
                        },
                        function ()
                        {
                            hideDialogs();

                            type_dropdown_hide = true;

                            revertTypesToInternalValues();

                            return false;
                        });

    return true;    
}   

function lookupEdgeMetricText(edge_metric_value)
{
    // ---------------------------------------  
    // Gets descriptive text for edge metric based on short code
    // ---------------------------------------  

    var edge_metric_desc_position = edge_metric_values_index.indexOf(edge_metric_value);

    if (edge_metric_desc_position != -1)    return edge_metric_values_data[edge_metric_desc_position].short;
    else                                    return edge_metric_value.toUpperCase();
}

function selectMenuEdgeMetric(selectedItem)
{
    // ---------------------------------------  
    // Select particular edge metric from menu
    // ---------------------------------------  

    var edge_metric_value = $(selectedItem).attr('data-subvalue');

    showConfirmIfData(  'Change edge metric',
                        '<h4>Are you sure you want to change your edge metric settings to <i>' + lookupEdgeMetricText(edge_metric_value) + '</i>?</h4>' +
                        '<p>This will reset your current graph to its starting position</p>',
                        function() 
                        {
                            setEdgeMetric(edge_metric_value);

                            variablesChangedResetVisualization();
                        },
                        null);
                        
    return false;                   
}


function lookupAggregationFuncText(aggregation_func_value)
{
    // ---------------------------------------  
    // Gets descriptive text for aggregation metric based on short code
    // ---------------------------------------  

    var aggregation_func_desc_position = aggregation_func_values_index.indexOf(aggregation_func_value);

    if (aggregation_func_desc_position != -1)    return aggregation_func_values_data[aggregation_func_desc_position].short;
    else                                    return aggregation_func_value.toUpperCase();
}

function selectMenuAggregationFunc(selectedItem)
{
    // ---------------------------------------  
    // Select particular aggregation metric from menu
    // ---------------------------------------  

    var aggregation_func_value = $(selectedItem).attr('data-subvalue');

    showConfirmIfData(  'Change aggregation metric',
                        '<h4>Are you sure you want to change your aggregation metric settings to <i>' + lookupAggregationFuncText(aggregation_func_value) + '</i>?</h4>' +
                        '<p>This will reset your current graph to its starting position</p>',
                        function() 
                        {
                            setAggregationFunc(aggregation_func_value);

                            variablesChangedResetVisualization();
                        },
                        null);
                        
    return false;                   
}









function updateWeightRangeMinMax(keepCurrentWeights)
{
    // ---------------------------------------  
    // Updates weight range minimum and maximum values 
    // based on min/max values availabe from server
    // ---------------------------------------  

    // **** 30/05/2017 ***: Neo4j too slow to return values dynamically so switch off

    /*
    var weight_field            = getEdgeMetric();
    var data_retrieve_deferred  = getWeightRangeMinMax(weight_field);

    $.when(data_retrieve_deferred).then(function(c) 
    {
        // Sometimes the ajax request comes 
        // back unparsed so parse it again
        
        if (c.text === undefined) c = JSON.parse(c);

        setWeightMin(c.weight_min);
        setWeightMax(c.weight_max);
    }); 
    */

	//console.log('in updateWeightRangeMinMax')
	//console.trace();


	if (neo4j_metadata && neo4j_metadata.hasOwnProperty('mention_count')) {
		setWeightMin(neo4j_metadata[getEdgeMetric()][0]);
		setWeightMax(neo4j_metadata[getEdgeMetric()][1]);


		if (!keepCurrentWeights){ 
			setWeightStart(getWeightMin());
			setWeightEnd(getWeightMax());
		}

		setFilterWeightStart(null);
		setFilterWeightEnd(null);
	}



    return;
}

function weightRangeSubmit()
{
    // ---------------------------------------  
    // User has submitted weight range form
    // ---------------------------------------  

    var weight_start    = parseFloat($('.cam-dtal-lion-weight-start').val());
    var weight_end      = parseFloat($('.cam-dtal-lion-weight-end').val());

    if (weight_end <= weight_start)
    {
        $(".cam-dtal-lion-dialog-error-message").show();        
        $(".cam-dtal-lion-dialog-error-message").html("Error: start of weight range is greater than or equal to end of range");     
    }
    else
    {
        hideDialogs();

        setWeightStart(weight_start);
        setWeightEnd(weight_end);

        variablesChangedResetVisualization();       
    }

    return false;
}


function weightRangeReset()
{
    // ---------------------------------------  
    // User has reset min/max server weight
    // ---------------------------------------  

    $('.cam-dtal-lion-weight-start').val(getWeightMin());
    $('.cam-dtal-lion-weight-end').val(getWeightMax());

    return false;
}




function revertTypesToInternalValues()
{
    // ---------------------------------------  
    // Returns the list of types displayed to internal values
    // ie. undoes the user's input
    // ---------------------------------------  

    types_set_programmatically = true;

    $('.cam-dtal-lion-type').dropdown('clear');
    $('.cam-dtal-lion-type').dropdown('set exactly', getTypes());
    $('.cam-dtal-lion-type').dropdown('hide');

    types_set_programmatically = false;
}

function getTypesSelected()
{
    // ---------------------------------------  
    // Gets list of source types selected
    // ---------------------------------------  

    var selected_types_elements = $('.cam-dtal-lion-type a').toArray();

    var selected_types = [];

    for(var i = 0; i < selected_types_elements.length; i++)
    {
        selected_types.push($(selected_types_elements[i]).attr("data-value"));
    }

    return selected_types;  
}

function variablesChangedResetVisualization()
{
    // ---------------------------------------  
    // Variables have changed so reset visualization
    // ---------------------------------------  

	updateWeightRangeMinMax(true);      
    resetCallStackStateVariables(); 

    initVisualization();    
}

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------------- Parameter validation ------------------ 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

function validateYear(year)
{
    // ---------------------------------------  
    // Check valid year
    // ---------------------------------------  

    if (year === undefined) return false;

    var int_year = parseInt(year);
    
    if (isNaN(int_year)) return false;
        
    if (int_year < date_range_year_min) return false;
    if (int_year > date_range_year_max) return false;
    
    return true;
}

function validateWeight(weight_value)
{
    // ---------------------------------------  
    // Validate weight
    // ---------------------------------------  

    if (weight_value === undefined) return false;

    if (isNaN(weight_value)) return false;

    return true;
}

function validateFilterWeight(weight_value)
{
    // ---------------------------------------  
    // Validate filter weight
    // ---------------------------------------  


	//console.log('validating filter weight!')

    if (!validateWeight(weight_value)) return false;
    //if (weight_value < getWeightStart()) return false;
    //if (weight_value > getWeightEnd()) return false;

	//console.log('weight is valid, now validating weight range')

    //if (getFilterWeightMin() != null && weight_value < getFilterWeightMin()) return false;
    //if (getFilterWeightMax() != null && weight_value > getFilterWeightMax()) return false;

	//console.log('weight range is valid')

    return true;
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------ Call stack recording and replaying -----------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function initCallStack()
{
    // ---------------------------------------  
    // Initialize call stack
    // ---------------------------------------  
    
    callstack_recording = [];
}

function addCallStack(action, parameters)
{
    // ---------------------------------------  
    // Add action to call stack
    // ---------------------------------------  
    
    var node_text = "";

    var primary_node_oid = "";

    if ((parameters.oid != "") && (parameters.oid !== undefined)) primary_node_oid = parameters.oid;
    if ((parameters.src != "") && (parameters.src !== undefined)) primary_node_oid = parameters.src;

    if (primary_node_oid != "")
    {       
        var node = getNodeFromIndex(primary_node_oid);
        if (node !== undefined) node_text = node.data.name;

        callstack_recording.push({action: action, node: node_text, parameters: parameters});
    }
    else
    {
        callstack_recording.push({action: action, parameters: parameters});
    }   
}

function addCallStackUpdateURL(action, parameters)
{
    // ---------------------------------------  
    // Add action to call stack and update URL
    // ---------------------------------------  

    addCallStack(action, parameters);

    // Add call stack action into URL

    saveStateToURL();
}

function runEnteredCallStack()
{
    // ---------------------------------------  
    // Reruns particular call stack
    // ---------------------------------------  
    
    hideDialogs();
    
    callstack_running = JSON.parse($("#cam-dtal-lion-call-stack").val());

    performance_timer_start     = performance.now();

    showStatus("Started...");
    
    // Reset conventional call stack which should end up being identical 
    // to call stack that we're running
    
    initCallStack();
    
    processCallStack();     
}

function runRecordedCallStack()
{
    // ---------------------------------------  
    // Replay recorded call stack that may have been built independently
    // ---------------------------------------  

    callstack_running = callstack_recording.slice();

    performance_timer_start     = performance.now();

    // Reset recording call stack

    initCallStack();

    // Process callstack_running

    showMajorProcessingActivity();

    processCallStack();
}

function resetCallStackStateVariables()
{
    // ---------------------------------------  
    // Reset callstack on account of a change in particular state variables
    // Some variables, eg. discovery_mode, may lead to a different set of nodes
    // so to prevent invalid nodes in the navigation history, we must reset 
    // call stack and update everything (ui and url) accordingly
    // ---------------------------------------  

    initCallStack();
    stateVariablesChanged();
}

function stateVariablesChanged()
{
    // ---------------------------------------  
    // State variables have changed so update page UI and URL
    // ---------------------------------------  

    updateUI();
    saveStateToURL();   
}

function processCallStack()
{
    // ---------------------------------------  
    // Process call stack
    // ---------------------------------------  
    
    // Take first element from front of array
	console.log('Processing call stack')
	console.log(callstack_running)	
 
    var call_stack_firstelement = callstack_running.splice(0, 1);

    if (call_stack_firstelement.length == 0)
    {
        showStatus("Finished: " + (parseInt(performance.now() - performance_timer_start)).toLocaleString('en') + " milliseconds.");

        // showInfo("Process finished", "Every item in the call stack has run successfully");
    
        clearStatus();

        renderVisualization(false);

        setTimeout(function()
        {
            fitToWindow();
                
            hideProcessingActivity();
                        
        }, 1000);

        return;     
    }

    call_stack_firstelement     = call_stack_firstelement[0];
    var core_status             = '';
    var parameters              = call_stack_firstelement.parameters;

    if (parameters.oid !== undefined) core_status = parameters.oid; 

    if (call_stack_firstelement.action == "init")
    {
        core_status = parameters.src;

        if (core_status === undefined) core_status = '';

        if ((parameters.dest != "") && (parameters.dest !== undefined)) core_status += ", " + parameters.dest;  
    }

    full_status = call_stack_firstelement.action + " [" + core_status + "] ";

    if (callstack_running.length > 0) full_status += callstack_running.length.toString() + " item(s) left";

    showStatus(full_status);    

    switch (call_stack_firstelement.action)
    {
        case "init":

            initVariables(false);

            setSource(parameters.src);
            setDestination(parameters.dest);                
            setYearStart(parameters.year_start);
            setYearEnd(parameters.year_end);
            setFilterYearStart(parameters.filter_year_start);
            setFilterYearEnd(parameters.filter_year_end);
            setDiscoveryMode(parameters.discovery_mode);
            //setOpenDiscovery(parameters.open_discovery);
            setHideLowFrequency(parameters.hide_lowfrequency);
            //setHideLowFrequency(parameters.db == 'inmemory' ? true : false);
            setFullAbstract(parameters.full_abstract);
            setEdgeMetric(parameters.edge_metric);          
            setAggregationFunc(parameters.aggregation_func);          
            setVisualizationMode(parameters.mode);
            setTypes(parameters.type);
            setFilterTypes(parameters.filter_type);
            setWeightStart(parameters.weight_start);
            setWeightEnd(parameters.weight_end);            
            setFilterWeightStart(parameters.filter_weight_start);
            setFilterWeightEnd(parameters.filter_weight_end);           

			
			/////////////These 2 functions need to go at the end
			selectSearchMode(parameters.dest && parameters.dest.length > 0 ? 'closed' : 
							 parameters.open_discovery == 1  ? 'open'  : 'neighbours' )
			////////////Because they both call saveStateToUrl at some point in their trace		


			stateVariablesChanged();

            setLayoutMode(parameters.layout_mode);
            // Initialize graph data for all visualizations 

            var data_retrieve_deferred = initCoreDataModel();
        
            $.when(data_retrieve_deferred).then(
								//function(){   
								//	uiDiscoveryPagingButtonOnClick(1,parameters.currentdiscoverypage)
								//}).then(
								function(c){processCallStack();}).fail(function() { showAJAXFail() });
            
            break;
            
        case "expand":


            expandNode(parameters.oid, function(c){processCallStack();}, false, parameters.nodetype    );
        
        
            break;
            
        case "collapse":

            collapseNode(parameters.oid);

            processCallStack();
        
            break;

        case "add":
        
            addNode(parameters.oid, function(c){processCallStack();});

            break;
            
        case "delete":

            deleteNode(parameters.oid);
            
            processCallStack();
        
            break;
            
        case "deleteorphans":
        
            deleteOrphanNodes();
            
            processCallStack();
            
            break;          

		
        case "discoverypage":
        
          
			uiDiscoveryPagingButtonOnClick(null,parameters.oid, function(c) { processCallStack()  });	
			
            break;          
		
    }   
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------------ Visualization functions ----------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function initModeGraph()
{
    // ---------------------------------------  
    // Enter graph visualization mode
    // ---------------------------------------  

    setVisualizationModeGraph();
    initVisualization();
}

function initModeText()
{
    // ---------------------------------------  
    // Enter text visualization mode
    // ---------------------------------------  

    setVisualizationModeText(); 
    initVisualization();        
}

function reenterModeGraph(fit_to_window)
{
    // ---------------------------------------  
    // Reenter graph visualization mode
    // ---------------------------------------  

    setVisualizationModeGraph();    
    renderVisualization(false)

    if (fit_to_window) fitToWindow();
}

function reenterModeText()
{
    // ---------------------------------------  
    // Reenter text visualization mode
    // ---------------------------------------  

    setVisualizationModeText();
    renderVisualization(false);
}

function initVisualization()
{
    // ---------------------------------------  
    // Initialize display of data
    // ---------------------------------------  
        
    prepareRedraw();

    // Creating a visualization is a two-step process:

    // 1. Initialize data model
    // 2. Render data model

    // This allows intricate processing to happen on data 
    // model before it's finally rendered

    // Initialize graph data for all visualizations 

    var data_retrieve_deferred = initCoreDataModel();

    $.when(data_retrieve_deferred).then(function(c)
    {


        // Render visualization when graph retrieved

        renderVisualization(false);  

		
   
    }).fail(function() { showAJAXFail() });

    return data_retrieve_deferred;
}

function prepareRedraw()
{
    // ---------------------------------------  
    // Perform any actions that must be run before significant things happen on screen, eg. close tooltips
    // ---------------------------------------  

    hideTooltips();
}


function extendGraphClosedDiscoveryDeferredFn(data_retrieve_deferred, onCompleteFn )
{

    var closed_graph = isClosedGraph();
    showProcessingActivity();

    $.when(data_retrieve_deferred).then(function(c) 
    {
        hideProcessingActivity();
        
        if (c.nodes === undefined) c = JSON.parse(c);
        if (c.nodes !== undefined)
        {
            var nodes = c.nodes;
            var edges = c.edges;
            
            // Add in numeric index to each node and 
            // copy all nodes and edges to internal index

            // If closed graph then add the '_B-PARENT' at the start

            //if (closed_graph) addNodeToIndex({ data: { id: '_B-PARENT', sort: '_B-PARENT' } });
            if (closed_graph) addNodeToIndex({  id: '_B-PARENT', sort: '_B-PARENT' });
            
            for(var i = 0; i < nodes.length; i++)
            {                               
                //nodes[i].data.index = getNodeIndexSize();
                nodes[i].index = getNodeIndexSize();
                                
                if (!closed_graph)
                {
                    //if (i == 0) nodes[i].data.level = 0;
                    //else        nodes[i].data.level = 1;                    
                    if (i == 0) nodes[i].level = 0;
                    else        nodes[i].level = 1;                    
                }
                
                // If closed graph, set class to "closedA/B/C"

                //if (closed_graph) nodes[i].classes = "closed" + nodes[i].data.sort;
                if (closed_graph) nodes[i].classes = "closed" + nodes[i].sort;
                
                addNodeToIndex(nodes[i]);
            }               

            // Copy all edges to internal index
            
            for(var i = 0; i < edges.length; i++) addEdgeToIndex(edges[i]);
                        
            // If open graph, getSource() is expanded node so increment page count for node 
            // to indicate first lot of results for that node has been loaded 

            if (!closed_graph) incrementNodePage(getSource());
        }


		//TEJAS
		//Set the filter weight min/max based on the min/max value of the edges - used after calls to addEdgeToIndex, i.e. after edges added
		console.log("From initCoreDataModel.....")
		setMetricValueForEdges()
		setFilterMinYearToGraphEdges()
		setFilterWeightMin()
		setFilterWeightMax()
		showFilterWeight()



		if (onCompleteFn) { onCompleteFn() }


    }).fail(function() { showAJAXFail() }); 
}


function initCoreDataModel()
{
    // ---------------------------------------  
    // Initialize core data 
    // ---------------------------------------  

    // Initialize nodes index
    
    initNodesEdgesIndex();

    // Reset drawing area
    
    resetGraph();

    // Initialize call stack and add first element

    initCallStack();

    addCallStackUpdateURL("init",   {   
                                        src:                    getSource(), 
                                        dest:                   getDestination(), 
                                        type:                   getTypes(),
                                        filter_type:            getFilterTypes(),  
                                        //year_start:             getYearStart(), 
                                        year_end:               getYearEnd(), 
                                        //filter_year_start:      getFilterYearStart(),
                                        filter_year_end:        getFilterYearEnd(),
                                        weight_start:           getWeightStart(),
                                        weight_end:             getWeightEnd(), 
                                        filter_weight_start:    getFilterWeightStart(),
                                        filter_weight_end:      getFilterWeightEnd(), 
                                        discovery_mode:         getDiscoveryMode(),
                                        open_discovery:         getOpenDiscovery(),
                                        hide_lowfrequency:      getHideLowFrequency(),
                                        full_abstract:          getFullAbstract(), 
                                        mode:                   getVisualizationMode(), 
                                        edge_metric:            getEdgeMetric(), 
                                        aggregation_func:     getAggregationFunc(), 
                                        layout_mode:            getLayoutMode(),
                                    });
        
    // If blank src, don't do anything else

    if (getSource() == "")  return false;
    
    var closed_graph = isClosedGraph();

    showProcessingActivity();

    if (closed_graph)   data_retrieve_deferred = getClosedGraph(getSource(), getDestination());
    else                data_retrieve_deferred = extendGraph(getSource(), [], 1);

    data_loaded = true;
	extendGraphClosedDiscoveryDeferredFn(data_retrieve_deferred)
	/*
    $.when(data_retrieve_deferred).then(function(c) 
    {
        hideProcessingActivity();
        
        if (c.nodes === undefined) c = JSON.parse(c);
        if (c.nodes !== undefined)
        {
            var nodes = c.nodes;
            var edges = c.edges;
            
            // Add in numeric index to each node and 
            // copy all nodes and edges to internal index

            // If closed graph then add the '_B-PARENT' at the start

            //if (closed_graph) addNodeToIndex({ data: { id: '_B-PARENT', sort: '_B-PARENT' } });
            if (closed_graph) addNodeToIndex({  id: '_B-PARENT', sort: '_B-PARENT' });
            
            for(var i = 0; i < nodes.length; i++)
            {                               
                //nodes[i].data.index = getNodeIndexSize();
                nodes[i].index = getNodeIndexSize();
                                
                if (!closed_graph)
                {
                    //if (i == 0) nodes[i].data.level = 0;
                    //else        nodes[i].data.level = 1;                    
                    if (i == 0) nodes[i].level = 0;
                    else        nodes[i].level = 1;                    
                }
                
                // If closed graph, set class to "closedA/B/C"

                //if (closed_graph) nodes[i].classes = "closed" + nodes[i].data.sort;
                if (closed_graph) nodes[i].classes = "closed" + nodes[i].sort;
                
                addNodeToIndex(nodes[i]);
            }               

            // Copy all edges to internal index
            
            for(var i = 0; i < edges.length; i++) addEdgeToIndex(edges[i]);
                        
            // If open graph, getSource() is expanded node so increment page count for node 
            // to indicate first lot of results for that node has been loaded 

            if (!closed_graph) incrementNodePage(getSource());
        }


		//TEJAS
		//Set the filter weight min/max based on the min/max value of the edges - used after calls to addEdgeToIndex, i.e. after edges added
		console.log("From initCoreDataModel.....")
		setMetricValueForEdges()
		setFilterMinYearToGraphEdges()
		setFilterWeightMin()
		setFilterWeightMax()
		showFilterWeight()
    }).fail(function() { showAJAXFail() }); 

	*/

    return data_retrieve_deferred;
}

function renderVisualization(use_stored_settings)
{
    // ---------------------------------------  
    // Render visualization 
    // ---------------------------------------  

    // Don't draw visualization if no src oid
    
    if (getSource() == "") return;

    prepareRedraw();

    switch (getVisualizationMode())
    {
        case "graph":       displayDataAsGraph(use_stored_settings);            break;
        case "text":        displayDataAsText(getSource(), getDestination());   break;
        case "analysis":    initAnalysis();                                     break;
    }    

   
	setUIDiscoveryPagingButton()
}

function showVisualizationArea()
{
    // ---------------------------------------  
    // Show visualization area including hiding any related elements
    // ---------------------------------------  
	$('.cam-dtal-lion-searcharea-spaceabove').hide();
	$('.cam-dtal-lion-maintitle').hide();
    
    $('.cam-dtal-lion-footer').hide();  
    $('#cam-dtal-lion-visualization-area').show();  
    $('.cam-dtal-lion-topbar').addClass("shadow");
    
    resizeVisualizationArea();
}

function hideVisualizationArea()
{
    // ---------------------------------------  
    // Hide visualization area including showing any related elements
    // ---------------------------------------  
	$('.cam-dtal-lion-searcharea-spaceabove').show();
	$('.cam-dtal-lion-maintitle').show();
    
    $('#cam-dtal-lion-visualization-area').hide();  
    $('.cam-dtal-lion-footer').show();      
    $('.cam-dtal-lion-topbar').removeClass("shadow");
    
    resizeVisualizationArea();  
}

function resizeVisualizationArea()
{
    // ---------------------------------------  
    // Maximise size of visualization area
    // ---------------------------------------  

    if (graph_cytoscape !== undefined)
    {
        graph_cytoscape.stop(false, false);
    }
    
    var graph_cytoscape_top     = $("#cam-dtal-lion-visualization-graph-cytoscape").offset();
    var viewport_height         = $(window).height();
    var graph_cytoscape_height  = viewport_height - graph_cytoscape_top.top;
        
    $('#cam-dtal-lion-visualization-graph-cytoscape').css("height", graph_cytoscape_height.toString() + "px");
    
    if (graph_cytoscape !== undefined) 
    {
        graph_cytoscape.resize();   
    
        // Center active node in canvas
        
        // if (recenter) centerGraphOnStartNode();      
    }
}           

function resetVisualization()
{
    // ---------------------------------------  
    // Reset visualization
    // ---------------------------------------  

    switch (getVisualizationMode())
    {
        case "graph":       resetGraph();           break;
        case "text":        break;
    }       
}

function getEdgeText(node_oid)
{
    // ---------------------------------------  
    // Get explanatory edge text for specific node
    // ---------------------------------------  
    
    var edgesShown          = countEdgesCurrent(node_oid);          
    var maxEdgeCount        = countEdgesPossible(node_oid);
    var maxEdgeCountText    = maxEdgeCount.toLocaleString('en');

    if (maxEdgeCount > 999)
    {
        var maxEdgeCountThousands = parseInt(maxEdgeCount / 1000);

        maxEdgeCountText = maxEdgeCountThousands.toLocaleString('en') + "K";
    }

    var edge_text = "edges";

    if (maxEdgeCount == 1) edge_text = "edge";

    if (edgesShown == maxEdgeCount)
    {
        return '<img style="width:14px!important;height:14px!important;" src="static/images/dead_end_icon.png"> All ' + edgesShown.toLocaleString('en') + ' ' + edge_text + ' shown';   
    }
    else
    {
        return edgesShown.toLocaleString('en') + ' / ' +  maxEdgeCountText + ' ' + edge_text + ' shown';    
    }
}

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -------------------- Graph visualization ------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

function getHistoricalMetricRangeForEdgeWidth() {

	var allYearMetrics = _.flatten( _.map(edges_data, function(edge){
		return edge.core.data.hasOwnProperty(getEdgeMetric()+'__arr') ? edge.core.data[getEdgeMetric()+'__arr'] : []
	}) )
	//console.log('allYearMetrics')
	//console.log(allYearMetrics)

	var minMetric = allYearMetrics.length > 0 ? _.min(allYearMetrics) : 0
	var maxMetric = allYearMetrics.length > 0 ? _.max(allYearMetrics) : 1

	//console.log([minMetric, maxMetric])

	return [minMetric, maxMetric]

}

function displayDataAsGraph(use_stored_settings)
{   
    // ---------------------------------------  
    // Display data as graph
    // ---------------------------------------  
        
    renderGraph(use_stored_settings);

    showVisualizationArea();        

    // Set any UI that is dependent on graph

    showGraphInteractiveSettings(); 
}           

function renderGraph(use_stored_settings)
{
    // ---------------------------------------  
    // Render graph using internal data model
    // ---------------------------------------  

    // Check whether graph started or not
    // If not started, then aggregate all nodes and edges and load fresh layout
    // If started, then add undrawn nodes and edges and refresh

    // Determine whether open or closed 

    var closed_graph = isClosedGraph();

    // Aggregate undisplayed nodes and edges

    var elements_for_display = aggregateUndisplayedNodesEdges();

    var zoom = 1;
    var pan = undefined;

    if (use_stored_settings)
    {
        zoom    = getLastZoom();
        pan     = getLastPan();
    }

    if (!graph_render_started)
    {
        // Setup layout for graph
        
        var o_layout = getVisualizationLayout(true);
		var metric_allyear_range = getHistoricalMetricRangeForEdgeWidth()


        graph_cytoscape = window.graph_cytoscape = cytoscape(
        {
            container:              document.getElementById('cam-dtal-lion-visualization-graph-cytoscape'),
            layout:                 o_layout,
            zoom:                   zoom,
            /* pan:                 pan, */
            wheelSensitivity:       0.1,        
            /* elements:                elements_for_display,*/             
            style:                  graph_cytoscape_styles(metric_allyear_range[0], metric_allyear_range[1]),
        });
                    
        graph_cytoscape.on('pan',   function(e){saveGraphSettings(); return canvasPanned(e);});         
        graph_cytoscape.on('zoom', function(e){saveGraphSettings(); return hideTooltips();});           

        graph_cytoscape.on('layoutstart', function(e)
        {

            console.log("layoutstart:", e.cyTarget.options.layoutname);
            graph_layout_running = true;

        }).on('layoutstop', function(e)
        {
            console.log("layoutstop:", e.cyTarget.options.layoutname);

            if (fit_after_redraw)
            {
                fitToWindow();

                fit_after_redraw = false;

                hideProcessingActivity();
            } 

            saveGraphSettings();

            graph_layout_running = false;
        }); 
    }

    // Add undisplayed elements to display

    for(var i = 0; i < elements_for_display.length; i++)
    {
        if (elements_for_display[i].data.name !== undefined)
        {
            elements_for_display[i].data.name = (elements_for_display[i].data.name).trunc(60, 15);
        }
		console.log(elements_for_display[i])	
        graph_cytoscape.add(elements_for_display[i]);       
    } 
        
    // Apply filters that may hide particular elements of graph
    
    applyFilters();
    
    // Update levels of all nodes using breadth-first algorithm
    
    updateLevels();

    runGraphLayout(graph_render_started);   

    graph_render_started = true;

    // Set status of all nodes and edges to displayed

    setNodesEdgesDisplayed();

    // Update handlers for all nodes

    updateGraphEventHandlers(closed_graph);
}

function getVisualizationLayout(is_firstload)
{
    // Gets particular visualization layout depending on mode
    
    var layout;
    
    // Increment layout count so we can track which layouts stopped/started
    
    graph_layout_count++;

    // If closed graph, then always use 'cola' layout

    var closed_graph    = isClosedGraph();

    if (closed_graph) setLayoutModeInternal('cola');
    
    var layout_mode     = getLayoutMode();
    
    switch(layout_mode)
    {
        case "cola":
        
            layout = 
            {
                fit:                false,
                pan:                false,
                name:               'cola',
                animate:            true,
                randomize:          false,
                maxSimulationTime:  1,
            };
        
            break;
            
        case "concentric":

            layout = 
            {
                name:       'concentric',
                fit:        false,  
                pan:        false,  
                concentric: function( node )
                {       
                    var level = (5 - parseInt(getNodeLevel(node.data().id)));
                    
                    if (level < 0) level = 0;
                    
                    return (level);
                },
                levelWidth: function( nodes )
                {
                    return 1;
                },
                padding: 1,
                minNodeSpacing: 1,
                spacingFactor: 0.5
            };
        
            break;
            
        case "cose-bilkent":
        
            layout = 
            {
                name:               'cose-bilkent',
                fit:                false,      
                animate:            true,               
                maxSimulationTime:  1000,
                idealEdgeLength:    100,
                nodeRepulsion:      90000,
            };
        
            break;
    }
    
    // Parameters that should be specifically set if starting new layout
    
    if (is_firstload)
    {
        layout.fit                  = true; 
        // layout.maxSimulationTime     = 1;
    }

    if (closed_graph)
    {
        // Force nodes of type A/C to be arranged along horizontal
        // while other nodes are evenly spaced along the centre vertical
        
        layout.alignment = function( node )
        {       
            var sort        = node.data('sort');
            var node_oid    = node.data('id');

            if (sort == 'A')    return { x: 0, y: 0 };
            if (sort == 'C')    return { x: 1000, y: 0};

            if (node.data('parent') == "_B-PARENT")
            {
                var b_nodes             = getBNodes();
                var number_b_nodes      = b_nodes.length;
                var node_position       = b_nodes.indexOf(node_oid);

                if (number_b_nodes == 1) return {x:500, y: 0 - 15};

                var y_pos = (node_position * (1000 / (number_b_nodes - 1))) - 500;
				if (y_pos > -3 || y_pos < 3) { y_pos = y_pos - 15 }

                return {x:getRandomArbitrary(400,600), y: y_pos};
            }

            if (isConnectedToCOnly(node_oid))
            {
                return {x:getRandomArbitrary(1100, 1400), y: getRandomArbitrary(-500, 500)};
            }
            else
            {
                return {x:getRandomArbitrary(-200, -100), y: getRandomArbitrary(-500, 500)};
            }
                        
            // If not 'A/C' node, then allow default constraints to operate
            
            return null;
        }   
    }   

    layout.layoutname = layout_mode + " " + graph_layout_count.toString();
        
    return layout;
}

function getRandomArbitrary(min, max) 
{
    // ---------------------------------------  
    // Get random number between 'min' and 'max'
    // ---------------------------------------  

    return Math.random() * (max - min) + min;
}
    
function updateLevels()
{
    // ---------------------------------------  
    // Update style sheet for node based on its distance from starting node
    // ---------------------------------------  
        
    if (getSource() == "") return;
        
    var bfs = graph_cytoscape.elements().bfs(
    {
        roots: "node[id='" + getSource() + "']",
        visit: function(i, depth, curr_node, curr_edge, e)
        {
            // Remove all level-specific classes from element
            
            var node_oid = curr_node.data('id');
                    
            setNodeLevel(node_oid, depth);
            
            graph_cytoscape.$("node[id='" + node_oid + "']").data("level", depth);              
            graph_cytoscape.$("node[id='" + node_oid + "']").removeClass("node-level-depth-0 node-level-depth-1 node-level-depth-2 node-level-depth-3 node-level-depth-4");

            // Then add in class according to depth
            
            if (parseInt(depth) < 4)
            {
                graph_cytoscape.$("node[id='" + node_oid + "']").addClass("node-level-depth-" + depth.toString());
            }
            else
            {
                graph_cytoscape.$("node[id='" + node_oid + "']").addClass("node-level-depth-4");
            }
                        
            if (curr_edge !== undefined)
            {
                var edge_oid = curr_edge.data('id');

                graph_cytoscape.$("edge[id='" + edge_oid + "']").removeClass("edge-level-depth-0 edge-level-depth-1 edge-level-depth-2 edge-level-depth-3 edge-level-depth-4");

                // Then add in class according to depth
                
                if (parseInt(depth) < 4)
                {
                    graph_cytoscape.$("edge[id='" + edge_oid + "']").addClass("edge-level-depth-" + depth.toString());
                }
                else
                {
                    graph_cytoscape.$("edge[id='" + edge_oid + "']").addClass("edge-level-depth-4");
                }                   
            }
            
        },
        directed: false
    });

    return;
}

function runGraphLayout(is_firstload)
{
    // ---------------------------------------  
    // Animate nodes        
    // ---------------------------------------  
    
    hideTooltips();
    
    // Stop existing layout animation

    if (graph_layout_current !== undefined)
    {
        console.log("Attempting to stop current layout");
        graph_layout_current.stop(true, false); 
    }
    
    // Get layout depending on particular layout mode
    
    graph_layout_current = graph_cytoscape.makeLayout(getVisualizationLayout(is_firstload));
    graph_layout_current.run();                         
}

function showGraphInteractiveSettings()
{
    // ---------------------------------------  
    // Show interactive settings
    // ---------------------------------------  

    $('.cam-dtal-lion-visualization-graph-elements').show();    

    showFilterTypes();
    showFilterDate();
    showFilterWeight();

    // If closed graph, then we hide graph selector

    if (isClosedGraph())    $('.cam-dtal-lion-visualization-graph-layout-set').hide();
    else                    $('.cam-dtal-lion-visualization-graph-layout-set').show();  
}

function resetGraph()
{
    // ---------------------------------------  
    // Resets graph
    // ---------------------------------------  

    if (graph_cytoscape !== undefined) graph_cytoscape.destroy();

    graph_render_started = false;

    resetNodesEdgesDisplayed();
}

function initiateRerender()
{
    // ---------------------------------------  
    // Initiate rerender based on filtering
    // ---------------------------------------  

    applyFilters();
}

function checkRenderingError()
{
    // ---------------------------------------  
    // Check for rendering error and if necessary redraw
    // ---------------------------------------  

    if (graph_cytoscape === undefined) return;

    var all_nodes_zero_position     = true;
    var all_nodes                   = graph_cytoscape.nodes();

    for(var i = 0; i < all_nodes.length; i++)
    {
        var node_position = all_nodes[i].position();

        if ((node_position.x != 0) | (node_position.y != 0))
        {
            all_nodes_zero_position = false;
            break;          
        } 
    }

	console.log('cytoscape nodes')
	console.log(all_nodes.length)

    if (all_nodes_zero_position)
    {
        console.log("Possible rendering error, redrawing...");

        showProcessingActivity();

        fit_after_redraw = true;

        runGraphLayout(true);       
    }

    return;
}

// -----------------------------------------------------------
// ----------------- Graph zoom/pan functions ----------------
// -----------------------------------------------------------

function fitToWindow()
{
    // ---------------------------------------  
    // Fit drawing pane to available area
    // ---------------------------------------  
    
    if (graph_cytoscape !== undefined) graph_cytoscape.fit();
}       

function zoomHighlightNode(node_oid)
{
    // ---------------------------------------  
    // Zoom and highlight node
    // ---------------------------------------  

    if (graph_cytoscape === undefined) return;

    graph_cytoscape.nodes().removeClass("highlightednode");     
    graph_cytoscape.edges().removeClass("highlightededge");     

    graph_cytoscape.nodes("[id='" + node_oid + "']").addClass("ultrahighlightednode");      

    setTimeout(function()
    {
        centerGraphOnNode(node_oid, 3);
    }, 500);    

    setTimeout(function()
    {
        centerGraphOnNode(node_oid, 1);

        graph_cytoscape.nodes("[id='" + node_oid + "']").removeClass("ultrahighlightednode");       
    }, 2000);   
}

function centerGraphOnStartNode()
{
    // ---------------------------------------  
    // Centers graph on start node
    // ---------------------------------------  
    
    centerGraphOnNode(getSource()); 
}

function centerGraphOnNode(node_oid, zoom_factor)
{
    // ---------------------------------------  
    // Centers graph on particular node
    // ---------------------------------------  
    
    if (graph_cytoscape === undefined) return;

    graph_cytoscape.animate({zoom: zoom_factor, center: {eles: graph_cytoscape.$("node[id='" + node_oid + "']")}});
}

function canvasPanned(e)
{
    // ---------------------------------------  
    // Canvas has been panned
    // ---------------------------------------  
    
    if (graph_pan_position !== undefined)
    {
        var pan_newposition = e.cy.pan();
        var tooltip_position = $('#cam-dtal-lion-tooltip').position();
        var pan_x = (pan_newposition.x - graph_pan_position.x);
        var pan_y = (pan_newposition.y - graph_pan_position.y);
        var tooltip_left    = tooltip_position.left + pan_x;
        var tooltip_top     = tooltip_position.top + pan_y;
        
        // Ideally tooltip would be hidden by accordion area but for some 
        // reason it's not. So as a workaround just hide the tooltip 
        
        if (tooltip_top <= 0)
        {
            hideTooltips();
        }
        else
        {
            graph_pan_position = {x: pan_newposition.x, y: pan_newposition.y};
            $('#cam-dtal-lion-tooltip').css({top: tooltip_top, left: tooltip_left});        
        }   
    }   
}

function saveGraphSettings()
{
    // ---------------------------------------  
    // Store graph settings
    // ---------------------------------------  

    if (graph_cytoscape === undefined) return;

    graph_settings_zoom     = graph_cytoscape.zoom();
    graph_settings_pan      = graph_cytoscape.pan();
}

function getLastZoom()
{
    // ---------------------------------------  
    // Get last zoom setting
    // ---------------------------------------  

    if (graph_settings_zoom === undefined) return 1;

    return graph_settings_zoom;
}

function getLastPan()
{
    // ---------------------------------------  
    // Get last zoom setting
    // ---------------------------------------  

    if (graph_settings_pan === undefined) return {x:0, y:0};

    return graph_settings_pan;
}

// -----------------------------------------------------------
// ----------- Graph-specific UI filter functions ------------
// -----------------------------------------------------------

function showFilterTypes()
{
    // ---------------------------------------  
    // Initialize type filter that allows client-only type filtering
    // ---------------------------------------  

    $('.cam-dtal-lion-filter-type').empty();

    var filter_types_html = '';
    var types                   = getTypes();
    var filter_types_selected   = getFilterTypes();

    for(var i = 0; i < types.length; i++)
    {
        var disabled_class      = "";
        var type_position       = alltypes_code.indexOf(types[i]);
        var type_description    = alltypes_description[type_position];

        if (filter_types_selected.indexOf(types[i]) == -1) disabled_class = " disabled";

        filter_types_html += '<div class="cam-dtal-lion-filter-type-element' + disabled_class + '" data-value="' + types[i] + '"><i class="ui icon small circular ' + types[i] + disabled_class + '"></i><div class="cam-dtal-lion-filter-type-element-description">' + type_description + '</div></div>'; 
    }

    $('.cam-dtal-lion-filter-type').append(filter_types_html);
}

function showFilterDate()
{
    // ---------------------------------------  
    // Initialize date filter that allows client-only interactive date filtering
    // ---------------------------------------  

    // Uses Semantic UI range extension
    // https://github.com/tyleryasaka/semantic-ui-range


	var edge_years = edges_data ?  _.map(edges_data, function(o){return o.core.data.year } ) : []
	var min_year = parseInt(date_range_year_min)
	if (edge_years.length > 0){
		setYearStart((_.min(edge_years) - 5).toString())
		setFilterYearStart((_.min(edge_years) - 5).toString())
		min_year = _.min(edge_years) - 5
	} else {
		setYearStart(date_range_year_min)
		setFilterYearStart(date_range_year_min)
	}



	//console.log('min year is! ' + min_year)

    $('#cam-dtal-lion-filter-date-range-1').empty();
    $('#cam-dtal-lion-filter-date-range-2').empty();

    $('#cam-dtal-lion-filter-date-range-1').range({
        //TEJAS - no year_start
		min: min_year,
		//min: getYearStart(),
        max: getYearEnd(),
        start:  filter_date_range_year_end,
        onChange: function(value, meta) {
            if(meta.triggeredByUser) {

                var has_changed = false;

				/*
                if (value < filter_date_range_year_start)
                {
                    filter_date_range_year_end = filter_date_range_year_start;

                    $('#cam-dtal-lion-filter-date-range-1').range('set value', filter_date_range_year_end);

                    has_changed = true;
                }
                else
                {
				*/
                    if (value != filter_date_range_year_end) has_changed = true;

                    filter_date_range_year_end = value;                 
                /*
				}
				*/

                if (has_changed) $('.cam-dtal-lion-filter-range-year-end-value').html(filter_date_range_year_end);              

                if ((filter_range_1_setup_date === true) && (has_changed))
                {
                    saveStateToURL();

                    initiateRerender();
                }

                filter_range_1_setup_date = true;


				setMetricValueForEdges()
				setFilterWeightMin()
				setFilterWeightMax()
				showFilterWeight()

            }       
        }    
    });

	//No year start, just year now
	/*
    $('#cam-dtal-lion-filter-date-range-2').range({
        min: getYearStart(),
        max: getYearEnd(),
        start: filter_date_range_year_start,
        onChange: function(value, meta) {
            if(meta.triggeredByUser) {

                var has_changed = false;

                if (value > filter_date_range_year_end)
                {
                    filter_date_range_year_start = filter_date_range_year_end;

                    $('#cam-dtal-lion-filter-date-range-2').range('set value', filter_date_range_year_start);

                    has_changed = true;
                }
                else
                {
                    if (value != filter_date_range_year_start) has_changed = true;

                    filter_date_range_year_start = value;                   
                }

                if (has_changed) $('.cam-dtal-lion-filter-range-year-start-value').html(filter_date_range_year_start);              

                if ((filter_range_2_setup_date === true) && (has_changed))
                {
                    saveStateToURL();

                    initiateRerender();
                }

                filter_range_2_setup_date = true;
            }       
        }    
    });
	*/

    $('#cam-dtal-lion-filter-date-range-1').find(".thumb").prepend('<div class="ui top pointing basic label cam-dtal-lion-filter-range-year-end-value">' + filter_date_range_year_end.toString() + '</div>');
    $('#cam-dtal-lion-filter-date-range-2').find(".thumb").append('<div class="ui bottom pointing basic label cam-dtal-lion-filter-range-year-start-value">' + filter_date_range_year_start.toString() + '</div>');
}

function showFilterWeight()
{
	if (filter_weight_range_start == null || filter_weight_range_end == null || 
		getFilterWeightMin() == null || getFilterWeightMax() == null ){return }
	//console.log('running showFilterWeight')

    // ---------------------------------------  
    // Initialize weight filter that allows client-only interactive weight filtering
    // ---------------------------------------  

    // Uses Semantic UI range extension
    // https://github.com/tyleryasaka/semantic-ui-range

    $('#cam-dtal-lion-filter-weight-range-1').empty();
    $('#cam-dtal-lion-filter-weight-range-2').empty();

    $('#cam-dtal-lion-filter-weight-range-1').range({
        //min: getWeightStart(),
        //max: getWeightEnd(),
        //step: getWeightStepSize(getWeightStart(), getWeightEnd()),
		min: getFilterWeightMin(),
		max: getFilterWeightMax(),
		step: getWeightStepSize( getFilterWeightMin() , getFilterWeightMax() ),
        start: filter_weight_range_end,        
		onChange: function(value, meta) {
            if(meta.triggeredByUser) {

                var has_changed = false;

                if (value < filter_weight_range_start)
                {
                    filter_weight_range_end = filter_weight_range_start;

                    $('#cam-dtal-lion-filter-weight-range-1').range('set value', filter_weight_range_end);

                    has_changed = true;
                }
                else
                {
                    if (value != filter_weight_range_end) has_changed = true;

                    filter_weight_range_end = value;                    
                }

                if (has_changed) $('.cam-dtal-lion-filter-range-weight-end-value').html(filter_weight_range_end);               

                if ((filter_range_1_setup_weight === true) && (has_changed))
                {

					console.log('saving state to url in filter fn')

                    saveStateToURL();

                    initiateRerender();
                }

                filter_range_1_setup_weight = true;
            }       
        }    
    });

    $('#cam-dtal-lion-filter-weight-range-2').range({
        //min: getWeightStart(),
        //max: getWeightEnd(),
        //step: getWeightStepSize(getWeightStart(), getWeightEnd()),      
		min: getFilterWeightMin(),
		max: getFilterWeightMax(),
		step: getWeightStepSize( getFilterWeightMin() , getFilterWeightMax() ),
        start: filter_weight_range_start,
        onChange: function(value, meta) {
            if(meta.triggeredByUser) {

                var has_changed = false;

                if (value > filter_weight_range_end)
                {
                    filter_weight_range_start = filter_weight_range_end;

                    $('#cam-dtal-lion-filter-weight-range-2').range('set value', filter_weight_range_start);

                    has_changed = true;
                }
                else
                {
                    if (value != filter_weight_range_start) has_changed = true;

                    filter_weight_range_start = value;                  
                }

                if (has_changed) $('.cam-dtal-lion-filter-range-weight-start-value').html(filter_weight_range_start);               

                if ((filter_range_2_setup_weight === true) && (has_changed))
                {
					console.log('saving state to url in filter fn 2')
                    saveStateToURL();

                    initiateRerender();
                }

                filter_range_2_setup_weight = true;
            }       
        }    
    });

    $('#cam-dtal-lion-filter-weight-range-1').find(".thumb").prepend('<div class="ui bottom pointing basic label cam-dtal-lion-filter-range-weight-end-value">' + filter_weight_range_end.toString() + '</div>');
    $('#cam-dtal-lion-filter-weight-range-2').find(".thumb").append('<div class="ui top pointing basic label cam-dtal-lion-filter-range-weight-start-value">' + filter_weight_range_start.toString() + '</div>');
}

function resetFilters()
{
    // ---------------------------------------  
    // Reset any dynamic filters that might be responsible for hiding nodes
    // ---------------------------------------  

    setFilterTypes(getTypes());
    //setFilterYearStart(getYearStart());
    setFilterYearEnd(getYearEnd());
    //setFilterWeightStart(getWeightStart());
    //setFilterWeightEnd(getWeightEnd());
    setFilterWeightStart(getFilterWeightMin());
    setFilterWeightEnd(getFilterWeightMax());
}

function getWeightStepSize(weight_start, weight_end)
{
    // ---------------------------------------  
    // Calculates size of step given start and end
    // We assume 20 steps always
    // ---------------------------------------  

    var step_size = parseFloat((weight_end - weight_start) / 20);

    return step_size;
}

function toggleFilterElementType(e)
{
    // ---------------------------------------  
    // Toggle highlighting of filter type element
    // ---------------------------------------  

    var element_clicked = $(e.target).parent();

    if (!($(element_clicked).hasClass("cam-dtal-lion-filter-type-element"))) return;

    if ($(element_clicked).hasClass("disabled"))
    {
        $(element_clicked).removeClass("disabled");
        $(element_clicked).find("i").removeClass("disabled");
    }
    else
    {
        $(element_clicked).addClass("disabled");
        $(element_clicked).find("i").addClass("disabled");
    }

    updateInternalFilterType();

    saveStateToURL();

    initiateRerender();
}

function updateInternalFilterType()
{
    // ---------------------------------------  
    // Iterate through all filter type elements and update internal filter type array
    // ---------------------------------------  

    filter_types = [];

    var filter_types_elements = $('.cam-dtal-lion-filter-type div.cam-dtal-lion-filter-type-element').toArray();

    for (var i = 0, j = filter_types_elements.length; i < j; i++) 
    {
        var filter_types_code = $(filter_types_elements[i]).attr("data-value");

        if (!($(filter_types_elements[i]).hasClass("disabled")))
        {
            filter_types.push(filter_types_code);
        }
    }
}

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -------------------- Text visualization -------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

function displayDataAsText(src_oid, dest_oid)
{
    // ---------------------------------------  
    // Display text version of visualization
    // ---------------------------------------  
    
    performanceStart("displayDataAsText");

    setVisualizationModeText()
    
    $("#cam-dtal-lion-visualization-text").empty();

    showVisualizationArea();

    var node_src = getNodeFromIndex(src_oid).data;
    
    var delete_text = "";

    if ((src_oid != getSource()) && (src_oid != getDestination()))
    {
        delete_text = '<div class="cam-dtal-lion-visualization-text-icons" data-content="Delete node"><i class="ui large red icon trash cam-dtal-lion-visualization-text-edges-delete" data-content="' + encodeURIComponent(getSource() + " " + src_oid) + '"></i></div>';                                              
    }

    var source_html =   '<div class="ui huge header" style="display:inline;padding-right:10px">' + node_src.fullname + '</div>' +
                        '<div class="ui horizontal label" style="margin-bottom:10px;position:relative;top:-4px;margin-top:20px;">' + 
                        '<div class="ui active tiny inline loader cam-dtal-lion-visualization-text-edges-loader" style="position:relative;left:0px;top:0px;margin-bottom:0px;margin-right:10px;display:none;"></div>' +                     
                        '<div style="display:inline;" class="cam-dtal-lion-visualization-text-edgecount-main"></div>' +
                        '</div>' + 
                        '<div class="cam-dtal-lion-visualization-text-icons" data-content="Load more edges"><i class="ui large green icon expand cam-dtal-lion-visualization-text-edges-expand" data-content="' + encodeURIComponent(src_oid) + '"></i></div>' +                                                
                        '<div class="cam-dtal-lion-visualization-text-icons" data-content="View node in graph mode"><i class="ui large blue icon object ungroup cam-dtal-lion-visualization-text-node-graph" data-content="' + encodeURIComponent(src_oid) + '"></i></div>' +                                       
                        delete_text +       
                        '<div style="padding-bottom:20px;">' + node_src.equivalents + '</div>' +
                        '<div class="cam-dtal-lion-visualization-text-edges-main"></div>' +
                        '<div class="ui active inline loader cam-dtal-lion-visualization-text-edges-loader" style="position:relative;left:50%;top:20px;width:0px;margin-bottom:30px;display:none;"></div>' +
                        '<div class="ui button basic fluid cam-dtal-lion-visualization-text-edges-expand" data-content="' + encodeURIComponent(src_oid) + '"><i class="ui large green icon expand"></i> Load more edges</div>';
    
    $("#cam-dtal-lion-visualization-text").append(source_html);
    
    $('.cam-dtal-lion-visualization-text-icons').popup();

    updateTextVisualizationWithEdges(src_oid);

    performanceStop();
}

function updateTextVisualizationWithEdges(node_oid)
{
    // ---------------------------------------  
    // Update text for node's edges
    // ---------------------------------------  
    
    var node_statistics     = getNodeStatistics(node_oid);
    var node_insertafter    = "";

    var edge_metric             = getEdgeMetric();
    var edge_metric_position    = edge_metric_values_index.indexOf(edge_metric);
    var edge_metric_details     = null;

    if (edge_metric_position != -1) edge_metric_details = edge_metric_values_data[edge_metric_position];
    
    for(var i = 0; i < node_statistics.EdgeMetrics.oids.length; i++)
    {
    
        var current_node_oid            = node_statistics.EdgeMetrics.oids[i];
        var current_node                = getNodeFromIndex(current_node_oid);
        var current_node_oid_for_CSS    = cleanOIDForCSS(current_node_oid); 
        var current_element_id          = "cam-dtal-lion-visualization-text-edge-" + current_node_oid_for_CSS;
        var current_element_mentions    = "cam-dtal-lion-visualization-text-edge-mentions-" + current_node_oid_for_CSS;
        var current_element_delete_text = "";

        if ((current_node_oid != getSource()) && (current_node_oid != getDestination()))
        {
            current_element_delete_text = '<div class="cam-dtal-lion-visualization-text-icons" data-content="Delete node"><i class="ui large red icon trash cam-dtal-lion-visualization-text-edges-delete" data-content="' + encodeURIComponent(node_oid + " " + current_node_oid) + '"></i></div>';                                                
        }

        // Check whether element already exists
        
        if (!($('.' + current_element_id).length))
        {
            var statistics_size = "mini";
            
            if (node_statistics.EdgeMetrics.values[i] >= 5) statistics_size = "tiny";
            if (node_statistics.EdgeMetrics.values[i] >= 50) statistics_size = "small";
            // if (node_statistics.EdgeMetrics.values[i] >= 250) statistics_size = "";
            // if (node_statistics.EdgeMetrics.values[i] >= 500) statistics_size = "large";
            // if (node_statistics.EdgeMetrics.values[i] >= 100000) statistics_size = "small";
        
            var current_node_statistics = getNodeStatistics(current_node_oid);
            var current_node_neighbours_text = "";


            for(var j = 0; j < current_node_statistics.EdgeMetrics.oids.length; j++)
            {
                var neighbour_node_oid      = current_node_statistics.EdgeMetrics.oids[j];
                var neighbour_node_category = current_node_statistics.EdgeMetrics.types[j];
                var neighbour_node_name     = current_node_statistics.EdgeMetrics.labels[j];
                var neighbour_node_score    = current_node_statistics.EdgeMetrics.values[j];
                var neighbour_delete_text   = '';
                var neighbour_prefix_text   = '';

                if ((neighbour_node_oid != getSource()) && (neighbour_node_oid != getDestination()))
                {
                    neighbour_delete_text = '<div style="margin-left:5px;" class="cam-dtal-lion-visualization-text" data-position="right center" data-content="Delete node"><i class="ui icon remove cam-dtal-lion-visualization-text-edges-delete" data-content="' + encodeURIComponent(node_oid + " " + neighbour_node_oid) +'"></i></div>';
                }

                if (neighbour_node_oid == getSource())  neighbour_prefix_text = " start";
                if (neighbour_node_oid == getDestination()) neighbour_prefix_text = " end";

                if (neighbour_node_oid != node_oid)
                {
                    current_node_neighbours_text += '<div class="cam-dtal-lion-visualization-text" data-content="Refocus on' + neighbour_prefix_text + ' node: ' + (neighbour_node_name) + '" data-value="' + encodeURIComponent(neighbour_node_oid) + '"><div class="ui label cam-dtal-lion-visualization-text-edges-node ' + neighbour_node_category + '" data-value="' + encodeURIComponent(neighbour_node_oid) + '">' + neighbour_node_name + '<div data-position="bottom left" data-content="Number of co-occurrences of ' + neighbour_node_name + ' with ' + current_node.data.fullname + '" class="ui blue label cam-dtal-lion-visualization-text cam-dtal-lion-visualization-text-edges-node-value">' + neighbour_node_score.toLocaleString('en') + '</div>' + neighbour_delete_text + '</div></div>';
                }
            }

            var edge_metric_text = "";

            if (edge_metric_details != null)
            {
                edge_metric_text = '<div class="cam-dtal-lion-visualization-text-info cam-dtal-lion-metric popup" data-content="' + (edge_metric_details["full"]) + '" data-position="top left" data-variation="basic"><i class="ui law icon"></i> <b>' + edge_metric_details["short"] + ': </b>' + node_statistics.EdgeMetrics.metrics[i] + '</div>'; 
            }

            var edge_html = '<div class="ui accordion cam-dtal-lion-visualization-text-edge ' + current_element_id + '" data-content="' + encodeURIComponent(node_oid + " " + current_node_oid) + '">' +

                                '<div class="title">' + 

                                    '<div class="ui items">' +
                                        '<div class="item">' +

                                            '<div id="' + current_element_mentions + '-loader" class="ui active inline loader float left" style="position:relative;left:50%;top:20px;width:0px;display:none;">' +
                                            '</div>' +

                                            '<div class="ui grid stackable" style="width:100%;margin:0px;padding:0px;">' + 

                                                '<div class="row">' +

                                                    '<div class="twelve wide column" style="margin:0px;padding:0px;">' + 
        
                                                        '<i style="margin:10px 20px 10px 0px;" class="ui left floated icon large circular ' + current_node.data.type + '" title="' + current_node.data.type + '"></i>' +
                                                        '<div class="content" style="padding-left:0px;padding-top:10px;">' +
                                                            '<div data-content="Refocus on node: ' + current_node.data.fullname + '" class="cam-dtal-lion-visualization-text cam-dtal-lion-visualization-text-edges-node" data-value="' + encodeURIComponent(current_node_oid) + '">' +
                                                                '<div class="ui header" style="display:inline;padding-right:10px;">' + (current_node.data.fullname) + '</div>' +
                                                                '<i class="ui icon large arrow blue right cam-dtal-lion-visualization-text-icons"></i>' +
                                                            '</div>' +
                                                            '<div style="padding-left:20px;" class="cam-dtal-lion-visualization-text-icons" data-content="View node in graph mode"><i class="ui large blue icon object ungroup cam-dtal-lion-visualization-text-node-graph" data-content="' + encodeURIComponent(current_node_oid) + '"></i></div>' +                                       
                                                            current_element_delete_text + 
                                                            '<div>' + 
                                                                '<div class="cam-dtal-lion-visualization-text-info" data-content="Earliest publication date" data-variation="basic" style="display:inline;"><i class="ui calendar icon"></i> ' + node_statistics.EdgeMetrics.years[i] + '</div>' + 
                                                                '<div class="cam-dtal-lion-visualization-text-info" data-content="Number of documents" data-variation="basic" style="display:inline;padding-left:10px;"><i class="ui book icon"></i> ' + node_statistics.EdgeMetrics.documentcounts[i].toLocaleString('en') + '</div>' + 
                                                            '</div>' + 
                                                            edge_metric_text + 
                                                            '<div class="meta">' +
                                                                '<span>' + (current_node.data.equivalents) + '</span>' +
                                                            '</div>' +
                                                        '</div>' +  
                                                    '</div>' +

                                                    '<div class="four wide center aligned column">' +

                                                        '<div data-content="Show/hide mentions" class="ui right floated cam-dtal-lion-visualization-text-edges-mentions" data-value="' + encodeURIComponent(node_oid + " " + current_node_oid) + '" style="padding:0px 0px 20px 20px;">' + 
                                                            '<i class="ui icon chevron down"></i>' +
                                                        '</div>' +

                                                        '<div class="ui ' + statistics_size + ' statistic" style="margin-bottom:0px;">' +
                                                            '<div class="value">' + node_statistics.EdgeMetrics.values[i].toLocaleString('en') + '</div>' +
                                                            '<div class="label">Co-occurrences</div>' +
                                                        '</div>' +                                                  
                                                    '</div>' +

                                                '</div>' +

                                                '<div class="row">' +

                                                    '<div class="sixteen wide column" style="padding:0px 0px 0px 0px;">' +

                                                        '<div class="neighbours" style="max-height:150px;overflow-y:auto;">' + current_node_neighbours_text + 
                                                        '</div>' +

                                                    '</div>' +

                                                '</div>' +

                                            '</div>' + 
                                        '</div>' +
                                    '</div>' +
                                '</div>' + 

                                '<div class="content cam-dtal-lion-mentions" style="max-height:300px;overflow-y:auto;padding:15px;margin:10px 0px 40px 0px;background-color:rgba(238, 238, 238, 0.36)" id="' + current_element_mentions +'">' +
                                '</div>' +
                            '</div>';           
            
            if (node_insertafter == "")
            {
                $('.cam-dtal-lion-visualization-text-edges-main').prepend(edge_html);
            }
            else
            {
                $(edge_html).insertAfter($('.' + node_insertafter));
            }
        }

        node_insertafter = current_element_id;
    }
    
    $('.cam-dtal-lion-visualization-text-edges-mentions, .cam-dtal-lion-visualization-text, .cam-dtal-lion-visualization-text-icons, .cam-dtal-lion-metric, .cam-dtal-lion-visualization-text-info').popup();

    $('.cam-dtal-lion-visualization-text-edgecount-main').html(getEdgeText(node_oid));  
    
    var edgesShown          = countEdgesCurrent(node_oid);          
    var maxEdgeCount        = countEdgesPossible(node_oid);

    // If enough edges shown then hide "Load more edges" link
    
    if (edgesShown >= maxEdgeCount)
    {
        $('.cam-dtal-lion-visualization-text-edges-expand').hide(); 
    }
    else
    {
        $('.cam-dtal-lion-visualization-text-edges-expand').show(); 
    }

    // Infinite scroll on text visualization mentions area

    $('.cam-dtal-lion-mentions').unbind('scroll');
    $('.cam-dtal-lion-mentions').on(
        'scroll',
        function() 
        {           
            var scrollTop           = $(this)[0].scrollTop;
            var windowHeight        = $(this).height();
            var height              = $(this)[0].scrollHeight - windowHeight;
            var scrollPercentage    = (scrollTop / height);
            var pixelsToBottom      = (height - scrollTop);

            // if less than 10 pixels to bottom, then scroll

            if (pixelsToBottom < 35) 
            {                               
                var mentions_context = $(this).attr("id");
                var mentions_state = getMentionsState(mentions_context);
                
                if (!(mentions_state.loading))
                {               
                    // Add mentions
                    
                    addMentions(mentions_context);
                }               
            }           
        }
    );  

    // Hide loader regardless 

    $('.cam-dtal-lion-visualization-text-edges-loader').hide();

    // Scroll to top of page as new elements have been added - which may be right at top

    window.scrollTo(0, 0);
}

function visualizationTextToggleMentions(e)
{
    // ---------------------------------------  
    // Open/close mentions accordion on text visualization
    // ---------------------------------------  

    var clicked_link;

    if ($(e.target).hasClass("cam-dtal-lion-visualization-text-edges-mentions"))
    {
        clicked_link    = $(e.target);
    }
    else
    {
        clicked_link    = $(e.target).parent();
    }

    var accordion_open  = false;
    var edge_id         = decodeURIComponent(clicked_link.attr("data-value"));
    var edge_elements   = edge_id.split(" ");
    var edge            = getEdgeFromIndex(edge_elements[0], edge_elements[1]);
    edge.source         = edge_elements[0];
    edge.target         = edge_elements[1];         
    var context         = "cam-dtal-lion-visualization-text-edge-mentions-" + cleanOIDForCSS(edge_elements[1]); 
    var clicked_icon    = clicked_link.find("i");

    if (clicked_icon.hasClass("up")) accordion_open = true;

    if (accordion_open)
    {
        clicked_icon.removeClass("up").addClass("down");

        $('#' + context + '-loader').show();                
        $('#' + context).removeClass("active");

        // Remove content from accordion to save memory on client
            
        $('#' + context).empty();
        $('#' + context + '-loader').hide();                        
    }
    else
    {
        clicked_icon.removeClass("down").addClass("up");

        $('#' + context).addClass("active");

        if ($('#' + context).children().length == 0)
        {
            initMentions(context, edge);
        }
    }   
}

function visualizationTextSelect(oid)
{
    // ---------------------------------------  
    // Set 'src' to what user just clicked on
    // ---------------------------------------  
    
    setSource(oid);

    stateVariablesChanged();

    initVisualization()
}

function visualizationTextNodeExpand(element)
{
    // ---------------------------------------  
    // Load more text edges for current node in text visualization mode
    // ---------------------------------------  

    var node_oid = decodeURIComponent($(element.target).attr('data-content'));
    
    if (node_oid == undefined)
    {
        console.log("Is undefined");
        node_oid = decodeURIComponent($(element.target).parent().attr('data-content'));
    }

    // Show loader and hide extra edges link

    $('.cam-dtal-lion-visualization-text-edges-loader').show();
    $('.cam-dtal-lion-visualization-text-edges-expand').hide(); 

    expandNodeAndDisplay(node_oid, function()
    {
        updateTextVisualizationWithEdges(node_oid);
    });
}   

function visualizationTextNodeGraphView(element)
{
    // ---------------------------------------  
    // View node in graph
    // ---------------------------------------  

    var node_oid = decodeURIComponent($(element.target).attr('data-content'));

    // Switch to cola as Cose Bilkent causes problems

    if (getLayoutMode() == "cose-bilkent") setLayoutMode("cola");

    // Remove all filters in case node in text view - where no filters apply 
    // is invisible on graph

    resetFilters();

    reenterModeGraph(false);

    // Scroll to top of page as we're coming out of page that may have been scrolled to bottom

    window.scrollTo(0, 0);

    // Highlight node we're centering on then remove highlight after pause

    zoomHighlightNode(node_oid);
}

function visualizationTextNodeOpen(element)
{
    // ---------------------------------------  
    // Open visualization text for particular node
    // ---------------------------------------  

    var node_oid = decodeURIComponent($(element.target).parent().attr('data-value'));

    displayDataAsText(node_oid, null);

    return false;
}

function visualizationTextNodeDelete(element)
{
    // ---------------------------------------  
    // Delete node from within text visualization
    // This will also delete node from graph
    // ---------------------------------------  

    var edge_oid        = decodeURIComponent(element.target.dataset.content);
    var edge_elements   = edge_oid.split(" ");
    var edge_start_oid  = edge_elements[0];
    var edge_end_oid    = edge_elements[1];

    userInterfaceNodeDelete(edge_end_oid, function()
    {
        if (edge_start_oid == edge_end_oid)
        {
            displayDataAsText(getSource(), getDestination());
        }
        else
        {
            displayDataAsText(edge_start_oid, null);
        }
    });

    return false;
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------------- UI functions -----------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

// -----------------------------------------------------------
// -------------------- Main UI functions --------------------
// -----------------------------------------------------------

function updateUI()
{
    // Update UI after possible changes in state variables
    
    // In the event 'src' or 'dest' non-empty, get their canonical text equivalents
    
    if (getSource() == "")
    {
        resetPage(false);
        return;
    }
    else
    {   
        //if (!destination_visible) showAddDestinationButton();

        updateInputFromOID(getSource(), '#cam-dtal-lion-search-term-src-input');
    }   
                
    if (getDestination() == "")
    {
        hideDestinationField();
        $('#cam-dtal-lion-search-term-dest-input').val("");     
        syncFieldsToInputs();
    }
    else
    {
        showDestinationField();

        updateInputFromOID(getDestination(), '#cam-dtal-lion-search-term-dest-input');
    }       
}

function resetPage(reset_url)
{
    // ---------------------------------------  
    // Reset page and possibly URL state
    // Note: doesn't reset all variables as we 
    // wish to keep some global state parameters
    // ---------------------------------------  

    data_loaded = false;

    setSource("");
    setDestination(""); 

    if (reset_url) resetCallStackStateVariables();
    
    hideAddDestinationButton();

    $('#cam-dtal-lion-search-term-src-input').val("");          
    $('#cam-dtal-lion-search-term-dest-input').val("");

    $('.cam-dtal-lion-hide-search-box').hide();
    $('.cam-dtal-lion-search-box-toggle').hide();
                
    hideDestinationField();
            
    initVisualization();

    syncFieldsToInputs();
    
    hideVisualizationArea();
}

function syncFieldsToInputs()
{
    // ---------------------------------------  
    // Synchronize non-input fields to input fields
    // ---------------------------------------  
    
    if (getSource() == "")
    {
        $('.cam-dtal-lion-hide-search-box').hide();
        $('.cam-dtal-lion-search-box-toggle').hide();       
        $('.cam-dtal-lion-search-term-src-input').html("");     
    }
    else
    {
        $('.cam-dtal-lion-hide-search-box').show();
        $('.cam-dtal-lion-search-box-toggle').show();       
        $('.cam-dtal-lion-search-term-src-input').html($('#cam-dtal-lion-search-term-src-input').val());        
    }
    
    if (getDestination() == "")
    {
        $('.cam-dtal-lion-search-term-connector').attr('style', 'display:none;');       
        $('.cam-dtal-lion-search-term-dest-input').html("");                        
    }
    else
    {
        $('.cam-dtal-lion-search-term-connector').attr('style', 'display:inline;');     
        $('.cam-dtal-lion-search-term-dest-input').html($('#cam-dtal-lion-search-term-dest-input').val());              
    }
}

function searchItemSelected(field, value)
{
    // ---------------------------------------  
    // User has clicked on element in the input auto-suggest list
    // ---------------------------------------  
        
    // Workaround for Semantic UI bug where selection fires success twice 
    
    if ((field == "src")    && (src_selected)) return;
    if ((field == "dest")   && (dest_selected)) return;
    
    if (field == "src")     {src_selected   = true;}
    if (field == "dest")    {dest_selected  = true;}
    
    setSearchItemValue(field, value);

    syncFieldsToInputs();
    
    // As we may have changed value of src/dest,   
    // update url to reflect new state

    saveStateToURL();       
}

function setSearchItemValue(field, value)
{
    // ---------------------------------------  
    // Set value for 'src' or 'dest' 
    // ---------------------------------------  

    switch(field)
    {
        case "src":     setSource(value);       break;
        case "dest":    setDestination(value);  break;      
    }
        
    if ((field == "dest") && (value != ""))
    {
        //showAddDestinationButton();
		setOpenDiscovery(0)
	}
    
    syncFieldsToInputs();
    
    // Update visualization
    if ($('#cam-dtal-lion-reveal-destination').hasClass('active') && (!getDestination() || getDestination().length  == 0)){

    } else  {	
		initVisualization();    
	}
}

function showDestinationField()
{
    // ---------------------------------------  
    // Show 'dest' field
    // ---------------------------------------  
    
    if (!destination_visible)
    {
        //hideAddDestinationButton();

        $('#cam-dtal-lion-search-term-dest-input').val("");
        $('.cam-dtal-lion-search-term-dest-input').html("");        
        $('#cam-dtal-lion-search-destination').transition("vertical flip");     
        
        syncFieldsToInputs();
        resizeVisualizationArea();
        
        destination_visible = true;
    }   
}

function focusDestinationField()
{
    // ---------------------------------------  
    // Focus on 'dest' field
    // ---------------------------------------  

    if (destination_visible)
    {
        $('#cam-dtal-lion-search-term-dest-input').focus();
    }
}

function hideDestinationField()
{
    // ---------------------------------------  
    // Hide 'dest' field
    // ---------------------------------------  
    
    if (destination_visible)
    {
        //showAddDestinationButton();

        $('#cam-dtal-lion-hide-destination').popup("hide all"); 
        
        $('#cam-dtal-lion-search-term-dest-input').val(""); 
        $('.cam-dtal-lion-search-term-dest-input').html("");                
        $("#cam-dtal-lion-search-destination").slideUp(400, function()
        {
            $(this).removeClass("visible");
            $(this).addClass("hidden");
            
            resizeVisualizationArea();          
        });

        syncFieldsToInputs();
        
        destination_visible = false;
    }   
}


function enableOpenDiscovery()
{
	//$("#cam-dtal-lion-set-open-discovery").removeClass("disabled");  
	$("#cam-dtal-lion-set-open-discovery").addClass("active");  
	//hideDestinationField(); 
	//setSearchItemValue("dest", ""); 
	disableClosedDiscovery()
	disableNeighbours()
	setCurrentDiscoveryPage(1)
        setSearchItemValue('src', getSource())
        setLayoutMode('concentric');  
}


function disableOpenDiscovery()
{
	$("#cam-dtal-lion-set-open-discovery").removeClass("active");  
	//$("#cam-dtal-lion-set-open-discovery").addClass("disabled");  
}


function showAddDestinationButton()
{
    // ---------------------------------------  
    // Show button that allows 'dest' field to be added
    // ---------------------------------------  
     
    //$("#cam-dtal-lion-reveal-destination").removeClass("disabled");  
    $("#cam-dtal-lion-reveal-destination").addClass("active");  
}

function hideAddDestinationButton()
{
    // ---------------------------------------  
    // Hide button that allows 'dest' field to be added
    // ---------------------------------------  
    
    $("#cam-dtal-lion-reveal-destination").removeClass("active"); 
    //$("#cam-dtal-lion-reveal-destination").addClass("disabled");    
    //$('#cam-dtal-lion-reveal-destination').popup("hide all");   
}



function enableClosedDiscovery() {
	disableNeighbours();
	disableOpenDiscovery()
	setCurrentDiscoveryPage(1)
	showDestinationField();
	focusDestinationField();
	showAddDestinationButton();
}


function disableClosedDiscovery() {
	hideDestinationField(); 
	setSearchItemValue("dest", ""); 
	saveStateToURL();
	hideAddDestinationButton();
}


function enableNeighbours() {


	//$("#cam-dtal-lion-set-neighbours").removeClass("disabled");  
	
	$("#cam-dtal-lion-set-neighbours").addClass("active");  
	setOpenDiscovery(0)
	//hideDestinationField(); 
	//setSearchItemValue("dest", ""); 
	//hideAddDestinationButton();
	disableClosedDiscovery();
	//just use this to redo the visualisation - but only when the user has entered a src
	setSearchItemValue('src', getSource())
}

function disableNeighbours() {
	$("#cam-dtal-lion-set-neighbours").removeClass("active");  
	//$("#cam-dtal-lion-set-neighbours").addClass("disabled");  
}


function selectSearchMode(mode) 
{
	console.log('selecting search mode')
	console.log(mode)
	//console.trace()
	switch(mode)
	{
		case "open":    
			//if (!($("#cam-dtal-lion-set-open-discovery").hasClass("disabled"))) 
			//{
			//	setOpenDiscovery(0)
				//this isn't run when you disable open discovery, it is run by one of the sub-functions	when you enanle it
			//	initVisualization();    
			//}
			//else {
				setOpenDiscovery(1) 
			//}
			break;
		case "closed":  
			enableClosedDiscovery(); 
			break;
		case "neighbours": 
			enableNeighbours(); 
			break; 
	}
	saveStateToURL();

}



// -----------------------------------------------------------
// ---------------------- Show status ------------------------
// -----------------------------------------------------------

function showStatus(status)
{
    // ---------------------------------------  
    // Output status text
    // ---------------------------------------  

    if (status != "") $('.cam-dtal-lion-networkactivity').show();
    $('.cam-dtal-lion-topbar-dynamicstatus').html(status);
    if (status == "") $('.cam-dtal-lion-networkactivity').hide();
    
    if (status != "") console.log(status);
}

function clearStatus()
{
    // ---------------------------------------  
    // Clear status text
    // ---------------------------------------  
    
    showStatus(""); 
    $('.cam-dtal-lion-networkactivity').hide();
}


function setUIDiscoveryPagingButton() {

    // ---------------------------------------  
    // Clear status text
    // ---------------------------------------  





	//if (_.filter(nodes_data, function(node){return node.core.data.sort == 'C'}).length == 0 && 
	//	 (global_src_oid.length == 0  || _.filter( edges_data, function(edge){return 
	//		edge.core.data.source == global_src_oid || edge.core.data.target == global_src_oid }  ).length == 0)
	//   ){
	if (open_discovery == 1 || global_dest_oid && global_dest_oid.length > 0  ){
		$('.cam-dtal-lion-visualization-graph-options-button').show();
	} else {
		$('.cam-dtal-lion-visualization-graph-options-button').hide();
	}
	
}


function uiDiscoveryPagingButtonOnClick(currentPage,page, callbackFn) {

	console.log('hello uiDiscoveryPagingButtonOnClick')

	if (page === null || page === undefined){ return; }
	
	//var currentPage = getCurrentDiscoveryPage()

	var pages = _.range(currentPage !== null ? currentPage + 1 : parseInt( page), parseInt( page)+1)

	console.log(currentPage)
	console.log(pages)

	_.forEach(pages, function(i) {

		console.log('discovery paging')
		console.log(i)
		console.log(i == page)

		if (open_discovery == 1 ) {
			var data_retrieve_deferred = extendGraph(getSource(), getNodeIdList(), i)
			extendGraphClosedDiscoveryDeferredFn(data_retrieve_deferred, 
				i == page ? 
				function () {
					console.log('running extendGraphClosedDiscoveryDeferredFn callback')	
					console.log(i)
					console.log(page)
					setCurrentDiscoveryPage(i); 
					renderGraph(false); 
					addCallStackUpdateURL('discoverypage', {oid: i })
					//saveStateToURL();
				    if (callbackFn)	{ callbackFn() }
				} :
			   	function () {}
		    )				
		}
		else if (global_dest_oid && global_dest_oid.length > 0  ){
			//addCallStackUpdateURL('discoverypage', {oid:  1})
			var data_retrieve_deferred = getClosedGraph(getSource(), getDestination(), i)
			extendGraphClosedDiscoveryDeferredFn(data_retrieve_deferred, 
				i == page ? 
				function () {
					console.log('running extendGraphClosedDiscoveryDeferredFn callback')	
					console.log(i)
					console.log(page)
					setCurrentDiscoveryPage(i); 
					renderGraph(false); 
					addCallStackUpdateURL('discoverypage', {oid: i })
					//saveStateToURL(); 
				    if (callbackFn)	{ callbackFn() }
				} :
			   	function () {}
			 )
		}

	})

}


// -----------------------------------------------------------
// --------------- Show/hide processing activity -------------
// -----------------------------------------------------------

function showMajorProcessingActivity()
{
    // ---------------------------------------  
    // Show major activity preventing user from carrying out further activities
    // ---------------------------------------  

    $('.cam-dtal-lion-global-loader').show();
}

function showProcessingActivity()
{
    // ---------------------------------------  
    // Show indication of network activity
    // ---------------------------------------  
    
    $('.ajax-loading-panel').show();
    $('.cam-dtal-lion-networkactivity').show();

}

function hideProcessingActivity()
{
    // ---------------------------------------  
    // Hide indication of network activity
    // ---------------------------------------  

    $('.cam-dtal-lion-global-loader').hide();
    $('.cam-dtal-lion-networkactivity').hide(); 
    $('.ajax-loading-panel').hide();
}

// -----------------------------------------------------------
// ---------------------- Miscellaneous ----------------------
// -----------------------------------------------------------

function updateInputFromOID(node_oid, input_selector)
{
    // ---------------------------------------  
    // Update input field using canonical text based on node oid
    // ---------------------------------------  

    // Attempt to retrieve value from cache

    var cache_canonicaltext_position = cache_canonicaltext_index.indexOf(node_oid);

    if (cache_canonicaltext_position != -1) return cache_canonicaltext_data[cache_canonicaltext_position];

    // Not in cache

    // If cache has grown too large, reset it

    if (cache_canonicaltext_index.length > 100)
    {
        cache_canonicaltext_index   = [];
        cache_canonicaltext_data    = [];
    }

    // Retrieve canonical text from server

    data_retrieve_deferred = getCanonicalNodeText(node_oid);

    $.when(data_retrieve_deferred).then(function(c) 
    {
        // Sometimes the ajax request comes 
        // back unparsed so parse it again
        
        if (c.text === undefined) c = JSON.parse(c);
    
        cache_canonicaltext_index.push(node_oid);
        cache_canonicaltext_data.push(c.text);

        $(input_selector).val(c.text);          

        syncFieldsToInputs();
    }).fail(function() { showAJAXFail() }); 
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ------------------- Nodes and edges UI --------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

// -----------------------------------------------------------
// ---------------- General nodes and edges UI ---------------
// -----------------------------------------------------------

function addNodeAndDisplay(node_oid, callback_fn)
{
    // ---------------------------------------  
    // Add node with node_oid in center of graph area and display on graph
    // ---------------------------------------  

    // Hide tooltips
    
    hideTooltips(); 

    var data_retrieve_deferred = addNode(node_oid, function()
    {
        renderVisualization(false);

        callback_fn();
    });
}




function expandNodeAndDisplay(node_oid, fn_callback,nodetype)
{
    // ---------------------------------------  
    // Expand particular node and update graph accordingly
    // ---------------------------------------  

    // Hide tooltips
    
    hideTooltips(); 

    var data_retrieve_deferred = expandNode(node_oid, fn_callback, true,nodetype);

    $.when(data_retrieve_deferred).then(function(c) 
    {   
        renderGraph(false); 
    }).fail(function() { showAJAXFail() });
}

function collapseNodeAndDisplay(node_oid)
{
    // ---------------------------------------  
    // Collapse node and update display
    // ---------------------------------------  

    showProcessingActivity();

    collapseNode(node_oid);

    runGraphLayout(false);
    
    hideProcessingActivity();
}

function addNode(node_oid, callback_fn)
{
    // ---------------------------------------  
    // Add node with node_oid in center of graph area
    // ---------------------------------------  
    
    addCallStackUpdateURL("add", {oid: node_oid});
    
    showProcessingActivity();       

    // Get node information and new edges via ajax
    
    var data_retrieve_deferred = getGraphNode(node_oid, getNodeIdList());
            
    $.when(data_retrieve_deferred).then(function(c) 
    {       
        // Fix bug when not receiving parsed JSON
        
        hideProcessingActivity();
        
        if (c.nodes === undefined) c = JSON.parse(c);
                                            
        var nodes   = c.nodes;          
        var edges   = c.edges;
        
        // Ensure added node is new
                
        //nodes[0].data.sort = "B";
        nodes[0].sort = "B";


        //if (!isNodeInIndex(nodes[0].data.id)) addNodeToIndex(nodes[0]);                                                     
        if (!isNodeInIndex(nodes[0].id)) addNodeToIndex(nodes[0]);                                                     
            
        for(var i = 0; i < edges.length; i++)
        {               
            //if (!isEdgeInIndex(edges[i].data.source, edges[i].data.target)) addEdgeToIndex(edges[i]);
            if (!isEdgeInIndex(edges[i].source, edges[i].target)) addEdgeToIndex(edges[i]);
        }               

		//TEJAS
		//Set the filter weight min/max based on the min/max value of the edges - used after calls to addEdgeToIndex, i.e. after edges added
		setMetricValueForEdges()
		setFilterMinYearToGraphEdges()
		setFilterWeightMin()
		setFilterWeightMax()
		showFilterWeight()


        callback_fn();
    }).fail(function() { showAJAXFail() }); 

    return data_retrieve_deferred;
}

function deleteNode(node_oid)
{
    // ---------------------------------------  
    // Delete node, generating entry in call stack
    // ---------------------------------------  

    // Check whether node exists

    if (!isNodeInIndex(node_oid)) return undefined;

    addCallStackUpdateURL("delete", {oid: node_oid});
    
    deleteNodeSafe(node_oid);   
}

function addSearchNode(node_oid, node_label)
{
    // ---------------------------------------  
    // Add or search for node
    // ---------------------------------------  

    node_oid = node_oid.trim();
    var node = getNodeFromIndex(node_oid);

    // Clear input field

    $('#cam-dtal-lion-search-term-searchadd-input').val("");

    if (node === undefined)
    {
        // Node does not exist so add it

        showConfirm(    'Add node?',
                        '<h4>Do you want to add <i>' + node_label + '</i> to the graph?</h4>',
                        function() 
                        {
                            addNodeAndDisplay(node_oid, function()
                            {
                                // As graph takes time to redraw, give it some time

                                setTimeout(function()
                                {
                                    zoomHighlightNode(node_oid);
                                }, 500);
                            });
                        }, 
                        null);
    }
    else
    {
        // Node exists so zoom in on it

        zoomHighlightNode(node_oid);
    }
}


function expandNodeByType(e) {

    var type = $(e.target).attr('data-value');
    var oid = decodeURIComponent( $('#cam-dtal-lion-dialog-node-expandbytype').attr('data-value') )

    console.log('in expandNodeByType')
    console.log(type)
    console.log(oid)

    var ele = graph_cytoscape.$("node[id='" + oid + "']");
    ele.trigger('hidetooltip'); 
    expandNodeAndDisplay(oid, function(){},type);
    hideExpandNodeByType();
}


function expandNode(node_oid, fn_callback, show_ui, nodetype)
{
    // ---------------------------------------  
    // Expand particular node
    // ---------------------------------------  


    console.log("expandNode: ", node_oid);

    // Check whether node exists

    if (!isNodeInIndex(node_oid))
    {
        fn_callback();

        return false;   
    }

    // Check whether node can be expanded
    
    if (!isUnopenedNode(node_oid))
    {
        console.log("expandNode: Node not expandable", node_oid);

        fn_callback();

        return false;   
    }

    var stackparams = {oid: node_oid}
    if (nodetype) { stackparams['nodetype'] = nodetype   }
    addCallStackUpdateURL("expand", stackparams);
                
    showMajorProcessingActivity();

    // Get graph extra nodes via ajax
    
    var data_retrieve_deferred = extendGraph(node_oid, getNodeIdList(), getNodePage(node_oid,nodetype),nodetype);
            
    $.when(data_retrieve_deferred).then(function(c) 
    {       
        hideProcessingActivity();
        incrementNodePage(node_oid,nodetype);

        // Fix bug when not receiving parsed JSON       
        
        if (c.nodes === undefined) c = JSON.parse(c);
        
        var nodes   = c.nodes;          
        var edges   = c.edges;
        
        // Ensure all nodes are new
        
        var new_nodes = [];
        
        for(var i = 0; i < nodes.length; i++)
        {
            //if (!isNodeInIndex(nodes[i].data.id)) new_nodes.push(nodes[i]);
            if (!isNodeInIndex(nodes[i].id)) new_nodes.push(nodes[i]);
        }
    
        if (new_nodes.length == 0)
        {
            if (show_ui)
            {
                showConfirm(    "Load more nodes?",
                                "<h4>The last attempt to expand the node returned no new nodes</h4>" +
                                "<p>This may be because all the nodes that would have been retrieved are already in the graph. Would you like to expand the node some more?</p>",                           
                                function() {return expandNodeAndDisplay(node_oid, fn_callback,nodetype);}, 
                                fn_callback());             
            }
            else fn_callback();
                            
            return;
        }
        
        for(var i = 0; i < new_nodes.length; i++)   addNodeToIndex(new_nodes[i]);                                                                   
        for(var i = 0; i < edges.length; i++)       addEdgeToIndex(edges[i]);


		//TEJAS
		//Set the filter weight min/max based on the min/max value of the edges - used after calls to addEdgeToIndex, i.e. after edges added
		setMetricValueForEdges()
		setFilterMinYearToGraphEdges()
		setFilterWeightMin()
		setFilterWeightMax()
		showFilterWeight()

        if (fn_callback != null) fn_callback();     
    }).fail(function() { showAJAXFail() }); 

    return data_retrieve_deferred;
}
    
function collapseNode(node_oid)
{
    // ---------------------------------------  
    // Collapse node on graph
    // ---------------------------------------  

    // This means deleting all the non-primary neighbours of the particular node
    // The first neighbour will have been added first and will represent 
    // the original node that first added this node
    
    // Check whether node exists

    if (!isNodeInIndex(node_oid)) return undefined;

    addCallStackUpdateURL("collapse", {oid: node_oid});
                    
    // Examine neighbours that were added after initial connection to node 
    
    var added_neighbours = getAddedNeighboursFromIndex(node_oid);
    
    for(var i = 0; i < added_neighbours.length; i++) deleteNodeSafe(added_neighbours[i]);
    
    resetNodePage(node_oid);
}

function deleteOrphanNodes()
{
    // ---------------------------------------  
    // Remove nodes that are not connected to anything
    // ---------------------------------------  

    addCallStackUpdateURL("deleteorphans", {});
    
    var nodes_index_copy    = nodes_index.slice(0);
    var nodes_data_copy     = nodes_data.slice(0);
    
    for(var i = 0; i < nodes_index_copy.length; i++)
    {
        var edges_count = nodes_data_copy[i].edges.length;

        if (edges_count == 0) deleteNodeSafe(nodes_index_copy[i]);
    }
}

function userInterfaceNodeDelete(node_oid, callback_fn)
{
    // ---------------------------------------  
    // Function called by user interface to delete node
    // ---------------------------------------  

    showConfirm(    "Delete node?",
                    "<h4>Are you sure you want to delete this node?</h4>" +
                    "<p>This action cannot be undo, although the node may be added when other nodes are expanded.</p>",                         
                    function() 
                    {
                        hideTooltips();

                        showProcessingActivity();
                                                
                        deleteNode(node_oid);   

                        renderGraph(false);

                        if (callback_fn != null) callback_fn();

                        hideProcessingActivity();
                    }, 
                    null);
}

function calculateOffsetBySegment(nSegmentIndex, nTotalSegments)
{
    // ---------------------------------------  
    // Position nodes in a circle
    // ---------------------------------------  
    
    var angle = Math.PI * 2 * nSegmentIndex / nTotalSegments;

    // Add 45 degrees so graph grows sideways
    
    angle += (Math.PI * 2 / 4);
    
    return {x: Math.sin(angle), y: Math.cos(angle)};
}


// -----------------------------------------------------------
// ----------------- Node/edge mouse events ------------------
// -----------------------------------------------------------

function updateGraphEventHandlers(closed_graph)
{
    // ---------------------------------------  
    // Update events for graph nodes and edges
    // ---------------------------------------  

    // Update unopened nodes
    
    highlightUnopenedNodes();       
        
    // Hide tooltips
    
    hideTooltips();
                
    graph_cytoscape.$('node').off('tap');           
    graph_cytoscape.$('node').off('tapend');    
    graph_cytoscape.$('node').off('tapdrag');               
    graph_cytoscape.$('node').off('tapdragover');       
    graph_cytoscape.$('node').off('tapdragout');                

    // Only activate nodes that are not '_B-PARENT' nodes

    graph_cytoscape.$('node[id!="_B-PARENT"]').on('tap',            function(e) {showClosableTooltip(e);});         
    graph_cytoscape.$('node[id!="_B-PARENT"]').on('tapend',         function(e) {});            
    graph_cytoscape.$('node[id!="_B-PARENT"]').on('taphold',        function(e) {nodeHold(e);});    
    graph_cytoscape.$('node[id!="_B-PARENT"]').on('tapdragover',    function(e) {nodeDragOver(e);});    
    graph_cytoscape.$('node[id!="_B-PARENT"]').on('tapdragout',     function(e) {nodeDragOut(e);});             
    
    graph_cytoscape.$('edge').off('tap');       
    graph_cytoscape.$('edge').off('tapdragover');       
    graph_cytoscape.$('edge').off('tapdragout');                
    graph_cytoscape.$('edge').on('tap',             function(e) {edgeTap(e);}); 
    graph_cytoscape.$('edge').on('tapdragover',     function(e) {edgeDragOver(e);});    
    graph_cytoscape.$('edge').on('tapdragout',      function(e) {edgeDragOut(e);});                             
}

function highlightUnopenedNodes()
{
    // ---------------------------------------  
    // Highlights opened/unopened nodes, ie. nodes where clicking would open more nodes
    // Note: we only ever open a maximum number of neighbouring nodes on each load, 
    // regardless of how many neighbouring nodes actually exist, to reduce clutter
    // ---------------------------------------  
            
    for(var i = 0; i < nodes_index.length; i++)
    {   
        resetNodeUI(nodes_index[i]);
        
        node_oid = nodes_data[i].core.data.id;

        if (node_oid == '_B-PARENT') continue;

        if (isUnopenedNode(nodes_index[i]))
        {
            graph_cytoscape.nodes("[id='" + node_oid + "']").addClass("unopenednode");      
            graph_cytoscape.nodes("[id='" + node_oid + "']").removeClass("openednode"); 
        }
        else
        {
            graph_cytoscape.nodes("[id='" + node_oid + "']").addClass("openednode");        
            graph_cytoscape.nodes("[id='" + node_oid + "']").removeClass("unopenednode");   
        }
    }       
}

function nodeHold(e)
{
    // ---------------------------------------  
    // Mouse/pointer is dragging node
    // ---------------------------------------  
    
    nodeDragOut(e);
}

function nodeDragOver(e)
{
    // ---------------------------------------  
    // Mouse/pointer is floating over node
    // ---------------------------------------  
    
    // Delay before showing tooltip
    
    clearTimeout(tooltip_show_timer);  
    clearTimeout(tooltip_hide_timer);


    var xPos        = (20 + e.cyRenderedPosition.x).toString() + "px"   
    var yPos        = e.cyRenderedPosition.y.toString() + "px";
    var node_oid    = e.cyTarget.data().id;
    
    if (node_oid == "_B-PARENT") return;
    
    var node        = getNodeFromIndex(node_oid);
    var node_object = getObjectFromIndex(node_oid);
    var node_edges  = node_object.edges;

    var current_node_oid = decodeURIComponent($('#cam-dtal-lion-tooltip').attr('data-content'));
    if (current_node_oid != node_oid && !tooltipHasClose() ) { hideTooltips(); }


    // Only show tooltip on mouse over when screen is large enough 
    // On small screens, require click/tap to show tooltip
    
    if ($('#cam-dtal-lion-visualization-graph-cytoscape').width() > semanticui_mobilewidth)
    {
        tooltip_show_timer = setTimeout(function()
        {

            console.log('rolled over timeout function running')
            showTooltip(e, xPos, yPos, false);   
            //showClosableTooltip(e);           
        }, 800);
    }
    
    // Highlight node

    e.cyTarget.addClass('highlightednode'); 
    
    if (e.cyTarget.hasClass('unopenednode'))
    {       
        $('.cam-dtal-lion-visualization-graph-info').html("<small><b>" + node.data.fullname + "</b> - unopened neighbours</small>");        
    }   
    
    // Highlight all connected edges 
    
    for(var i = 0; i < node_edges.length; i++)
    {
        graph_cytoscape.edges("[id='" + node_oid + ' ' + node_edges[i] + "']").addClass("highlightededge");                                     
        graph_cytoscape.edges("[id='" + node_edges[i] + ' ' + node_oid + "']").addClass("highlightededge");                                         
    }
}

function nodeDragOut(e)
{
    // ---------------------------------------  
    // Mouse/pointer has left edge
    // ---------------------------------------  

    clearTimeout(tooltip_show_timer);  
    clearTimeout(tooltip_hide_timer);   

    var node_oid = e.cyTarget.data().id;

    if (node_oid == "_B-PARENT") return;
    
    tooltip_hide_timer = setTimeout(function()
    {
        if (!tooltipHasClose())
        {
            $("#cam-dtal-lion-tooltip").transition('fade');
        }
    }, 1000);
    
    resetNodeUI(node_oid);
}

function edgeTap(e)
{
    // ---------------------------------------  
    // Edge of graph has been clicked/tapped 
    // ---------------------------------------  
        
    initMentions("cam-dtal-lion-mentions", e.cyTarget.data());  
}

function edgeDragOver(e)
{
    // ---------------------------------------  
    // Mouse/pointer is floating over edge
    // ---------------------------------------  
    
    var src_node    = getNodeFromIndex(e.cyTarget.data().source);
    var dest_node   = getNodeFromIndex(e.cyTarget.data().target);

    if ((src_node !== undefined) && (dest_node !== undefined))
    {
        var info_text = "<small><b>" + src_node.data.fullname + "</b> to <b>" + dest_node.data.fullname + "</b> (" + e.cyTarget.data().year + ")&nbsp;&nbsp;&nbsp;<i class=\"ui left align icon\"></i>" + convertDecimal(e.cyTarget.data().count).toLocaleString('en') + "&nbsp;&nbsp;&nbsp;<i class=\"ui book icon\"></i>" + convertDecimal(e.cyTarget.data().doc_count).toLocaleString('en') + "&nbsp;&nbsp;&nbsp;<i class=\"ui law icon\"></i>" + convertDecimal(e.cyTarget.data().metric).toString() + "</small>";
        
        $('.cam-dtal-lion-visualization-graph-info').html(info_text);
    }
        
    e.cyTarget.addClass('highlightededge'); 
}

function edgeDragOut(e)
{
    // ---------------------------------------  
    // Mouse/pointer has left edge
    // ---------------------------------------  

    $('.cam-dtal-lion-visualization-graph-info').html("");

    e.cyTarget.removeClass('highlightededge');      
}

function resetNodeUI(node_oid)
{
    // ---------------------------------------  
    // Reset state of node so no longer highlighted
    // ---------------------------------------  

    $('.cam-dtal-lion-visualization-graph-info').html("");

    graph_cytoscape.nodes("[id='" + node_oid + "']").removeClass("highlightednode");                                        

    var node_object = getObjectFromIndex(node_oid);
    var node_edges  = node_object.edges;
    
    // Unhighlight all connected edges 
    
    for(var i = 0; i < node_edges.length; i++)
    {
        graph_cytoscape.edges("[id='" + node_oid + ' ' + node_edges[i] + "']").removeClass("highlightededge");                                      
        graph_cytoscape.edges("[id='" + node_edges[i] + ' ' + node_oid + "']").removeClass("highlightededge");                                          
    }   
}

function isUnopenedNode(node_oid)
{
    // ---------------------------------------  
    // Determine whether node is unopened or not
    // ---------------------------------------  
    
    var max_neighbouring_nodes  = 15;       
    var node_edges_current      = countEdgesCurrent(node_oid);
    var node_edges_possible     = countEdgesPossible(node_oid);
    
    // if (node_edges_possible > max_neighbouring_nodes) node_edges_possible = max_neighbouring_nodes;
    
    // If more neighbours are available, node is unopened
    
    if (node_edges_current < node_edges_possible) return true;

    return false;
}

// -----------------------------------------------------------
// --------------------- Node tooltip UI ---------------------
// -----------------------------------------------------------

function showTooltip(e, xPos, yPos, closable)
{
    // ---------------------------------------  
    // Show tooltip
    // ---------------------------------------  

    console.log('in showTooltip')
    console.log(closable)

    var node_oid            = e.cyTarget.data().id; 
    var node_oid_for_CSS    = cleanOIDForCSS(node_oid); 
    var node                = getNodeFromIndex(node_oid);
    var node_fullobject     = getObjectFromIndex(node_oid);

    if (node_fullobject === undefined) return;
    
    var node_edges          = node_fullobject.edges;
    var node_statistics     = getNodeStatistics(node_oid);
    var tooltipBody         = "";
    var tooltipClose        = "";
    var tooltipNodeType     = node.data.type;
    var tooltipRibbonText   = node_oid;
    var fullscreen_class    = "";
    var show_left           = false;
    var show_above          = false;
    var show_fullscreen     = false;
    var tooltip_width       = 280;
    var tooltip_height;



    //var current_node_oid = decodeURIComponent($('#cam-dtal-lion-tooltip').attr('data-content'));
    //if (current_node_oid == node_oid) { return; }
    var current_closable = tooltipHasClose()


    // Save current pan position
            
    graph_pan_position = {x: e.cy.pan().x, y: e.cy.pan().y};
    
    // Turn position into integers
    
    xPos = parseInt(xPos);
    yPos = parseInt(yPos);
    
    // If drawable width not wide enough then make tooltip full screen

    var drawable_width  = $('#cam-dtal-lion-visualization-graph-cytoscape').width();
    var drawable_height = $('#cam-dtal-lion-visualization-graph-cytoscape').height();
    
    if (drawable_width < semanticui_mobilewidth) show_fullscreen = true;
        
    // If show full screen then close mentions sidebar

    if (show_fullscreen) $('#cam-dtal-lion-sidebar-mentions').sidebar('hide');
    
    if (node.data.equivalents != "")    tooltipBody = '<div style="padding-bottom:10px;" class="cam-dtal-lion-custom-scrollbar"><p class="small cam-dtal-lion-custom-scrollbar cam-dtal-lion-tooltip-equivalents">' + node.data.equivalents + '</p></div>';
    if (closable || current_closable)                       tooltipClose = '<i class="ui close small icon cam-dtal-lion-tooltip-close" data-content="Close info box" style="position:absolute;left:10px;top:10px;"></i>';

    // Generate statistics table
        
    var table_text = "";
    for(var i = 0; i < node_statistics.EdgeMetrics.labels.length; i++)
    {
        table_text += '<tr class="cam-dtal-lion-tooltip-statistics cam-dtal-lion-tooltip-statistics-1 cam-dtal-lion-tooltip-statistics-1-' + i.toString() + '" data-content="' + encodeURIComponent(node_oid + " " + node_statistics.EdgeMetrics.oids[i]) + '"><td style="width:70px;padding-left:5px;overflow-x:hidden;max-width:70px;">' + node_statistics.EdgeMetrics.labels[i] + '</td><td class="right aligned" style="width:35px;padding-right:5px;">' + node_statistics.EdgeMetrics.values[i].toLocaleString('en') + '</td></tr>'; 
    }
    var statistics_table = '<table class="ui very basic compact small fixed unstackable table transition visible cam-dtal-lion-tooltip-statistics-table-1" style="font-size:70%;line-height:100%;width:115px;"><tbody>' + table_text + '</tbody></table>';
        
    external_url = generateURLFromOID(node_oid);
    
    if (external_url != "")
    {
        tooltipRibbonText = '<a class="cam-dtal-lion-tooltip-tooltips" data-content="Open entity page (external link)" target="_new" href="' + external_url + '" style="color:black!important;"><i class="ui external icon"></i>' + node_oid + '</a>';
    }

    var tooltip_text = 
    '<div class="cam-dtal-lion-tooltip-box">' + tooltipClose +
    '<div class="ui '+ tooltipNodeType + ' small right ribbon label">' + tooltipRibbonText + '</div>' + 
    '<div class="ui header small cam-dtal-lion-tooltip-header">' + node.data.fullname + '</div>' +
    tooltipBody +
    '<div data-position="left center" data-content="Number of mentions" class="ui blue label cam-dtal-lion-tooltip-node-count"><i class="ui align left icon" style="margin-right:0.25em;"></i>' + 
		node.data.count[node.data.count.length - 1 - (getYearEnd() - getFilterYearEnd())].toLocaleString('en') + 
	'</div><div data-position="left center" data-content="Number of documents" class="ui orange label cam-dtal-lion-tooltip-node-count"><i class="ui book icon" style="margin-right:0.25em;"></i>' + 
		node.data.doc_count[node.data.doc_count.length - 1 - (getYearEnd() - getFilterYearEnd())].toLocaleString('en') + 
	'</div>' +
    '<div class="ui horizontal label cam-dtal-lion-node-edgecount-' + cleanOIDForCSS(node_oid) + '"></div>' +
    '<div class="cam-dtal-lion-tooltip-icons cam-dtal-lion-visualization-text-edges-node" data-content="View node in text mode" data-value="' + encodeURIComponent(node_oid) + '">' + 
    '<i class="ui large blue icon newspaper"></i>' + 
    '</div>' + 
    '<div class="cam-dtal-lion-tooltip-icons" data-content="Expand node">' + 
    '<i class="ui large green icon expand cam-dtal-lion-node-expand cam-dtal-lion-node-expand-'+ cleanOIDForCSS(node_oid) + '" data-content="' + encodeURIComponent(node_oid) + '"></i>' + 
    '</div>' + 
    '<div class="cam-dtal-lion-tooltip-icons" data-content="Expand node by type">' + 
    '<i class="ui large yellow icon expand cam-dtal-lion-node-expandbytype cam-dtal-lion-node-expandbytype-'+ cleanOIDForCSS(node_oid) + '" data-content="' + encodeURIComponent(node_oid) + '"></i>' + 
    '</div>' + 
    '<div class="cam-dtal-lion-tooltip-icons" data-content="Collapse node">' + 
    '<i class="ui large orange icon compress cam-dtal-lion-node-collapse cam-dtal-lion-node-collapse-'+ cleanOIDForCSS(node_oid) + '" data-content="' + encodeURIComponent(node_oid) + '"></i>' + 
    '</div>' + 
    '<div class="cam-dtal-lion-tooltip-icons" data-content="Delete node">' + 
    '<i class="ui large red icon trash cam-dtal-lion-node-delete cam-dtal-lion-node-delete-' + cleanOIDForCSS(node_oid) + '" data-content="' + encodeURIComponent(node_oid) + '"></i>' + 
    '</div>' +
    '<div class="ui accordion cam-dtal-lion-tooltip-graph">' +
    '<div class="title" style="padding-bottom:0px;">' +
    '<i class="dropdown icon"></i> <div class="cam-dtal-lion-tooltip-graph" data-content="Display co-occurrence data" style="display:inline;"><i data-content="View graph" class="blue bar chart icon"></i>Co-occurrence</div>' +
    '</div>' +
    '<div class="content center aligned" style="padding-top:0px;">' +
    '<p class="transition hidden">' + 
    '<div class="cam-dtal-lion-tooltip-graph-clickable" style="float:left;width:110px;height:110px;"><canvas id="cam-dtal-lion-tooltip-graph-1"></canvas></div>' + 
    '<div class="cam-dtal-lion-custom-scrollbar" style="float:left;padding-left:20px;"><div id="cam-dtal-lion-tooltip-statistics-scrolling-1" class="cam-dtal-lion-custom-scrollbar" style="width:130px;height:110px;overflow-y:auto;overflow-x:hidden;">' + statistics_table + '</div></div>' + 
    '</p>' + 
    '</div>' +
    '</div>' +      
    '</div>';


    $('#cam-dtal-lion-tooltip').html(tooltip_text); 

    $('#cam-dtal-lion-tooltip').attr('data-content', encodeURIComponent(node_oid))



    $('.cam-dtal-lion-tooltip-tooltips,.cam-dtal-lion-tooltip-node-count,.cam-dtal-lion-tooltip-icons,.cam-dtal-lion-tooltip-graph').popup();
    
    var colour_array = convertTypesToColours(node_statistics.EdgeMetrics.types);
            
    if (graph_tooltip !== undefined)
    {
        graph_tooltip == undefined;
        graph_tooltip.destroy();
    }
                    
    $('.ui.accordion.cam-dtal-lion-tooltip-graph').accordion(
    {
        onOpening: function()
        {
            if (graph_tooltip !== undefined) graph_tooltip.destroy();       
        },
        onOpen: function() 
        {           
            var ctx = document.getElementById("cam-dtal-lion-tooltip-graph-1");
            graph_tooltip = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: node_statistics.EdgeMetrics.labels,
                    datasets: [{
                        data:               node_statistics.EdgeMetrics.values,
                        backgroundColor:    colour_array,
                        borderWidth:        1,
                        borderColor:        '#CCC',
                        saved:
                        {
                            backgroundColor:    colour_array,
                            borderWidth:        1,
                            borderColor:        '#CCC',
                        },
                        hoverBackgroundColor:   "#2185D0",
                        hoverBorderColor:       "#2185D0",
                        hoverBorderWidth:       2,
                    }]
                },      
                options: {  
                    animation:
                    {   
                        currentStep:    0,
                        duration:       500,
                        easing:         "easeOutQuart",
                        animateRotate:  true,
                        animateScale:   true,
                        onComplete:     function(){},                       
                    },
                    title:
                    {
                        display:    false,
                    },
                    legend:
                    {
                        display:    false,
                    },
                    tooltips: 
                    {   
                        enabled: false,
                        custom: function(tooltip) 
                        {
                            if (!tooltip) {return;}
                        },                  
                        callbacks: 
                        {
                            label: function(tooltipItem, data) 
                            {       
                                var activeItem = $('.cam-dtal-lion-tooltip-statistics-1-' + tooltipItem.index.toString());
                                $('.cam-dtal-lion-tooltip-statistics-1').removeClass('active');
                                activeItem.addClass('active');                              
                                
                                var container = $('#cam-dtal-lion-tooltip-statistics-scrolling-1');
                                
                                container.scrollTop
                                (
                                    activeItem.offset().top - container.offset().top + container.scrollTop()
                                );
                                return "";                      
                            }
                        }
                    },  
                }
            }); 
        }   
    });
    
    if (show_fullscreen)
    {
        $("#cam-dtal-lion-tooltip").css({top: "14px", left: "0px", width: "100%", height: "100%", "z-index": "1000000"});       
    }
    else
    {   
        // To get height of tooltip, we use a trick from
        // http://stackoverflow.com/questions/1472303/jquery-get-width-of-element-when-not-visible-display-none
        
        if (!current_closable){
            $('#cam-dtal-lion-tooltip').css({ position: "absolute", top: "0px", left: "0px", width: "300px", height: "auto", visibility: "hidden", display: "block" });
            tooltip_height  = $('#cam-dtal-lion-tooltip').outerHeight();
            $('#cam-dtal-lion-tooltip').css({ position: "", visibility: "", display: "" });
                
            if ((drawable_width - xPos)     < tooltip_width) show_left = true;
            if ((drawable_height - yPos)    < tooltip_height) show_above = true;
            
            if (show_left)  xPos -= (tooltip_width + 80);
            if (show_above) yPos -= (tooltip_height);

            $("#cam-dtal-lion-tooltip").css({top: yPos, left: xPos, width: "300px", height: "auto"});   
        }
    }
    
    $("#cam-dtal-lion-tooltip").transition('show');

    
    if (isUnopenedNode(node_oid))
    {
        $('.cam-dtal-lion-node-expand-' + node_oid_for_CSS).show();
    }
    else
    {
        $('.cam-dtal-lion-node-expand-' + node_oid_for_CSS).hide();             
    }

    var collapse_show = true;

    if (getDestination() == "")
    {
        var node_edges = countEdgesCurrent(node_oid);
    
        if (node_edges <= 1) collapse_show = false;
    }
    else
    {
        var node_edges = countEdgesCurrentExcludeNodes(node_oid, [getSource(), getDestination()]);
        
        if (node_edges <= 2) collapse_show = false;
    }
    
    if (collapse_show)  $('.cam-dtal-lion-node-collapse-' + node_oid_for_CSS).show();               
    else                $('.cam-dtal-lion-node-collapse-' + node_oid_for_CSS).hide();                               
    
    // Hide delete icon if node is starting node or dest node
    
    if ((node_oid == getSource()) | (node_oid == getDestination()))
    {
        $('.cam-dtal-lion-node-delete-' + node_oid_for_CSS).hide();                                             
    }
    
    // Update edges shown and total edge count 
        
    $('.cam-dtal-lion-node-edgecount-' + node_oid_for_CSS).html(getEdgeText(node_oid));         
}

function showClosableTooltip(e)
{
    // ---------------------------------------  
    // Show tooltip with closeable box
    // ---------------------------------------  
    
    clearTimeout(tooltip_show_timer);  
    clearTimeout(tooltip_hide_timer);

    var xPos = (20 + e.cyRenderedPosition.x).toString() + "px"  
    var yPos = e.cyRenderedPosition.y.toString() + "px";
        
    showTooltip(e, xPos, yPos, true);           
}

function hideTooltips()
{
    // ---------------------------------------  
    // Hide all tooltips
    // ---------------------------------------  

    $('#cam-dtal-lion-tooltip').transition('hide');
    $('#cam-dtal-lion-tooltip').css({left: "-1000px", top: "-1000px"});
    $('#cam-dtal-lion-tooltip').attr('data-content', '')
    $('#cam-dtal-lion-tooltip').html('')
}

function tooltipNodeExpand(element)
{
    // ---------------------------------------  
    // Handle 'expand' click on node popup
    // ---------------------------------------  
    
    var node_oid = decodeURIComponent(element.target.dataset.content);
        
    var ele = graph_cytoscape.$("node[id='" + node_oid + "']");
    ele.trigger('hidetooltip'); 
    
    expandNodeAndDisplay(node_oid, function(){});
}

function tooltipNodeCollapse(element)
{
    // ---------------------------------------  
    // Handle 'collapse' click on node popup
    // ---------------------------------------  
    
    var node_oid = decodeURIComponent(element.target.dataset.content);

    var ele = graph_cytoscape.$("node[id='" + node_oid + "']");
    ele.trigger('hidetooltip'); 
    
    collapseNodeAndDisplay(node_oid);
}

function tooltipNodeDelete(element)
{
    // ---------------------------------------  
    // Handle 'delete' click on node popup
    // ---------------------------------------  
    
    var node_oid = decodeURIComponent(element.target.dataset.content);

    userInterfaceNodeDelete(node_oid, null);
}

function highlightGraphReset(graph_index)
{
    // ---------------------------------------  
    // Reset graph as if no highlights
    // ---------------------------------------  
    
    graph_tooltip.chart.config.data.datasets.forEach(function(dataset) 
    {
        if (dataset.saved.backgroundColor.constructor === Array)    dataset.backgroundColor = dataset.saved.backgroundColor.slice(0);
        else                                                        dataset.backgroundColor = dataset.saved.backgroundColor;        
        
        if (dataset.saved.borderWidth.constructor === Array)    dataset.borderWidth = dataset.saved.borderWidth.slice(0);
        else                                                    dataset.borderWidth = dataset.saved.borderWidth;                
        
        if (dataset.saved.borderColor.constructor === Array)    dataset.borderColor = dataset.saved.borderColor.slice(0);   
        else                                                    dataset.borderColor = dataset.saved.borderColor;                    
    });
    
    graph_tooltip.update();
}

function highlightGraphElement(graph_index, element_index)
{
    // ---------------------------------------  
    // Highlight specific element on graph
    // ---------------------------------------  
    
    // From http://stackoverflow.com/questions/32154202/how-to-highlight-single-bar-in-bar-chart-using-chartjs

    if (graph_tooltip === undefined) return;        
    
    highlightGraphReset(graph_index);
    
    graph_tooltip.activeElements = [];

    graph_tooltip.chart.config.data.datasets.forEach(function (dataset) 
    {
        var data_length = dataset.data.length;
        
        if (dataset.backgroundColor.constructor !== Array)  dataset.backgroundColor = utilityFill(new Array(data_length), dataset.backgroundColor);
        if (dataset.borderWidth.constructor !== Array)      dataset.borderWidth = utilityFill(new Array(data_length), dataset.borderWidth);             
        if (dataset.borderColor.constructor !== Array)      dataset.borderColor = utilityFill(new Array(data_length), dataset.borderColor);

        dataset.backgroundColor[element_index] = "#2185D0";
        dataset.borderColor[element_index] = "#2185D0";
        dataset.borderWidth[element_index] = 2;
    });

    graph_tooltip.update();
}

function mouseOverStatistics(e)
{
    // ---------------------------------------  
    // Mouse over a line of statistics
    // ---------------------------------------  
    
    var table_row       = $(e.target).parent();
    var row_index       = table_row.index();
        
    if (table_row.hasClass('cam-dtal-lion-tooltip-statistics-1'))
    {
        $('.cam-dtal-lion-tooltip-statistics-1').removeClass('active');     
        table_row.addClass('active');
        
        highlightGraphElement(1, row_index);
    }   
    
    return true;
}

function clickTooltipStatistics(e)
{
    // ---------------------------------------  
    // Mouse clicked on a line of statistics
    // ---------------------------------------  
    
    var parent = $(e.target).parent();
    
    if (parent.hasClass('cam-dtal-lion-tooltip-statistics-1'))
    {
        var edge_data       = decodeURIComponent(parent.attr('data-content'));
        var edge_elements   = edge_data.split(" ");
        var edge            = getEdgeFromIndex(edge_elements[0], edge_elements[1]);
        
        edge.source         = edge_elements[0];
        edge.target         = edge_elements[1];
        
        initMentions("cam-dtal-lion-mentions", edge);       
    }   
    
    return false;
}

function clickTooltipGraph(e)
{
    // ---------------------------------------  
    // Mouse clicked on graph
    // ---------------------------------------  
    
    if (graph_tooltip !== undefined)
    {
        if ($('.cam-dtal-lion-tooltip-statistics-1.active').length != 0)
        {
            var active_value = $('.cam-dtal-lion-tooltip-statistics-1.active').first().attr("data-content");
            
            if (active_value != undefined)
            {
                var edge_data       = decodeURIComponent(active_value);
                var edge_elements   = edge_data.split(" ");
                var edge            = getEdgeFromIndex(edge_elements[0], edge_elements[1]);

                edge.source         = edge_elements[0];
                edge.target         = edge_elements[1];

                initMentions("cam-dtal-lion-mentions", edge);       
            }
        }       
    }
    
    return true;
}

function tooltipMouseover(event)
{
    // ---------------------------------------  
    // Mouse over actual tooltip
    // ---------------------------------------  
    
    clearTimeout(tooltip_show_timer);               
    clearTimeout(tooltip_hide_timer);           
        
    event.stopPropagation();
    
    return true;
}

function tooltipMouseleave(event)
{
    // ---------------------------------------  
    // Mouse over actual tooltip
    // ---------------------------------------  

    // We don't do anything if box has close button
    
    if (tooltipHasClose()) return;

    // Check whether the reason for leaving is  
    // a popup in which case do nothing

    if (event.toElement === undefined) return;

    if (event.toElement !== null)
    {
        var class_list = Array.prototype.slice.call(event.toElement.classList);
        
        if (class_list.indexOf("popup") != -1) return;      
    }
    
    clearTimeout(tooltip_show_timer);               
    clearTimeout(tooltip_hide_timer);       
        
    hideTooltips();
}

function tooltipHasClose()
{
    // ---------------------------------------  
    // Check whether tooltip has close box
    // Typically if it does then we don't allow delayed closed when mouse out
    // ---------------------------------------  
    
    if ($('.cam-dtal-lion-tooltip-close').length) return true;
    
    return false;   
}

function convertTypesToColours(types_list)
{
    // ---------------------------------------  
    // Convert list of types into array of colours  
    // ---------------------------------------  
    
    var colours_list = [];
    
    for(var i = 0; i < types_list.length; i++)
    {
        var colour = getColourFromCategory(types_list[i]);
        
        colours_list.push(colour);
    }

    return colours_list;
}

// -----------------------------------------------------------
// ----------------------- Mentions UI -----------------------
// -----------------------------------------------------------

function initMentions(context, edgeData)
{   
    // ---------------------------------------  
    // Initialize display of mentions
    // ---------------------------------------  
    
    var sEdgeSrcOID     = edgeData.source;
    var sEdgeDestOID    = edgeData.target;
    
    // Empty contents of mention area
    
    $('#' + context).empty();                       

    // Show 'loader', ie. spinning wheel
    
    $('#' + context + '-loader').show();
    
    // Show sidebar if appropriate

    if (context == "cam-dtal-lion-mentions")
    {   
        $('#cam-dtal-lion-sidebar-mentions').sidebar(
        {
            dimPage:    false,
            closable:   false,
            onShow:     function() 
            {           
                if (graph_cytoscape !== undefined)
                {
                    graph_cytoscape.resize();
                }
            },
            onHidden:   function()
            {
                if (graph_cytoscape !== undefined)
                {
                    graph_cytoscape.resize();
                }       
            }
        });
        
        $('#cam-dtal-lion-sidebar-mentions').sidebar('show');

        // Get info about src and dest nodes
        
        node_src    = getNodeFromIndex(sEdgeSrcOID);
        node_dest   = getNodeFromIndex(sEdgeDestOID);

        // Remove 'type' class from circular icon
        
		//TEJAS: These have been substituted for Mutation
        //$('#cam-dtal-lion-sidebar-mentions-src-icon').removeClass('Chemical Disease DNAMutation Gene Hallmark ProteinMutation SNP Species');
        //$('#cam-dtal-lion-sidebar-mentions-dest-icon').removeClass('Chemical Disease DNAMutation Gene Hallmark ProteinMutation SNP Species');
        $('#cam-dtal-lion-sidebar-mentions-src-icon').removeClass('Chemical Disease Mutation Gene Hallmark Species');
        $('#cam-dtal-lion-sidebar-mentions-dest-icon').removeClass('Chemical Disease Mutation Gene Hallmark Species');
        
        // Add in new 'type' class

        $('#cam-dtal-lion-sidebar-mentions-src-icon').addClass(node_src.data.type);
        $('#cam-dtal-lion-sidebar-mentions-dest-icon').addClass(node_dest.data.type);
        $('#cam-dtal-lion-sidebar-mentions-src-icon').attr("title", node_src.data.type);
        $('#cam-dtal-lion-sidebar-mentions-dest-icon').attr("title", node_dest.data.type);

        // Add in text for src and dest nodes
        
        $('#cam-dtal-lion-sidebar-mentions-src-header').html(node_src.data.fullname);
        $('#cam-dtal-lion-sidebar-mentions-dest-header').html(node_dest.data.fullname);
        $('#cam-dtal-lion-sidebar-mentions-src-details').html(node_src.data.equivalents);
        $('#cam-dtal-lion-sidebar-mentions-dest-details').html(node_dest.data.equivalents);

        // Add in edge information

        $('#cam-dtal-lion-sidebar-mentions-year').html(edgeData.year);
        
        var edge_metric             = getEdgeMetric();
        var edge_metric_position    = edge_metric_values_index.indexOf(edge_metric);
        var edge_metric_text        = "";

        if (edge_metric_position != -1)
        {
            edge_metric_details = edge_metric_values_data[edge_metric_position];
            edge_metric_text = '<div class="popup" data-content="' + (edge_metric_details["full"]) + '"><div class="ui header small">' + edge_metric_details["short"] + '</div>' + edgeData.metric + '</div>'; 
        }

        $('#cam-dtal-lion-sidebar-mentions-weight').html(edge_metric_text);

        $('#cam-dtal-lion-sidebar-mentions-statistics').html(edgeData.count.toLocaleString('en') + " cooccurrence(s)");

        $('#cam-dtal-lion-sidebar-mentions-documentcount').html(edgeData.doc_count.toLocaleString('en') + " document(s)");
    }
    
    setMentionsState(context, "page", 1);
    setMentionsState(context, "last_document_id", "");
    setMentionsState(context, "src", sEdgeSrcOID);
    setMentionsState(context, "dest", sEdgeDestOID);
    setMentionsState(context, "loading", false);

    addMentions(context);
}

function addMentions(context)
{
    // ---------------------------------------  
    // Add mentions to particular context
    // ---------------------------------------  

    var mentions_state              = getMentionsState(context);
    var mentions_page               = mentions_state.page;
    var mentions_last_document_id   = mentions_state.last_document_id;
    var mentions_src                = mentions_state.src;
    var mentions_dest               = mentions_state.dest;
    var mentions_loading            = mentions_state.loading;
    
    // If mentions_page == -1, then we have loaded everything so don't load anymore
    
    if (mentions_page == -1) return;
    
    // If already loading, then don't repeat
    
    if (mentions_loading) return;
    
    // If not loading, then set loading boolean
    
    setMentionsState(context, "loading", true);
    
    // If not first mention then show loading icon and scroll to bottom of it
    
    if (mentions_page != 1) 
    {
        $('#' + context).append('<div id="' + context + '-loader-more" class="ui active centered inline loader"></div>');

        if (context == "cam-dtal-lion-mentions")
        {
            $('#cam-dtal-lion-sidebar-mentions').stop().animate(
            {
                scrollTop: $('#cam-dtal-lion-sidebar-mentions')[0].scrollHeight
            }, 800);    
        }       
    }

    mentions = getMentions(mentions_src, mentions_dest, mentions_page);

    $.when(mentions).then(function(mention_values) 
    {
        if (!Array.isArray(mention_values)) c = JSON.parse(mention_values);
        if (Array.isArray(mention_values))
        {   
            hideProcessingActivity();
            
            var mentions = convertFlattenedJSONMentionsToArray(mention_values);
                        
            if (mentions.length == 0)
            {
                // We have retrieved the entire list

                mentions_page = -1;

                // Hide all loaders and show "End of results"
                
                $('#' + context + '-loader').hide();                
                $('#' + context + '-loader-more').remove();                     
                $('#' + context).append('<div class="ui horizontal divider">End of results</div>');                     

                return;
            }
            
            var output_html = "";
            var mentions_list_aggregated = [];

            for(var i = 0; i < mentions.length; i++)
            {
                var document_preview_for_annotation = '';               
                var document_id = mentions[i].target.id;

                // We only show document title if the last mentioned document 
                // (from previous batch load) is different from the current document. 
                // In the event we're loading more annotations from same document - 
                // whose title is already on screen - then don't show document's title
                
                if (mentions_last_document_id != document_id)
                {
                    var document_url            = getPubmedURL(document_id);
                    mentions_last_document_id   = document_id;
                    document_title              = getFirstSentence(mentions[i].target.value);

                    if (document_url === null)
                    {
                        output_html += '<div class="ui small header">' + document_title + '</div>';                 
                    }
                    else
                    {
                        output_html += '<div class="ui small header"><a target="_new" href="' + document_url + '"><i class="ui external icon"></i>' + document_title + '</a></div>';                    
                    }
                }
            
                var mention1 = convertTargetToStartEnd(mentions_src,    "src",  mentions[i].body.from.target);
                var mention2 = convertTargetToStartEnd(mentions_dest,   "dest", mentions[i].body.to.target);
                                                
                var mentions_list = [];
                
                mentions_list.push(mention1);
                mentions_list.push(mention2);
                mentions_list_aggregated.push(mentions_list);

                if (getFullAbstract())
                {
                    // If we're at end of loop or next mention is for different document, then output 
                    // full abstract with cooccurrence sentences - as opposed to actual terms - marked

                    if ((i == (mentions.length - 1)) || (mentions[i + 1].target.id != document_id))
                    {
                        document_preview_for_annotation = getFullabstractAnnotated(mentions[i].target.value, mentions_list_aggregated);
                        
                        mentions_list_aggregated = [];
                    }
                }
                else
                {
                    document_preview_for_annotation = getDocumentPreview(mentions[i].target.value, mentions_list);                      
                }

                if (document_preview_for_annotation != '') output_html += '<p>' + document_preview_for_annotation + '</p>';                                                             
            }

            setMentionsState(context, "last_document_id", mentions_last_document_id);
            
            // Store scroll position before we add content

            if (context == "cam-dtal-lion-mentions")
            {
                var scrollPosition = $('#cam-dtal-lion-sidebar-mentions')[0].scrollTop;
            }
            
            // Remove 'loading more' loader if present
            
            $('#' + context + '-loader-more').remove();     

            // Remove general loader
            
            $('#' + context + '-loader').hide();                

            // Add content to context 
            
            $('#' + context).append(output_html);                       

            // Restore scroll position after content added

            if (context == "cam-dtal-lion-mentions")
            {
                $('#cam-dtal-lion-sidebar-mentions').stop().animate({scrollTop: scrollPosition}, 800);  
            }
            
            setMentionsState(context, "page", 1 + mentions_page);
            
            // Change boolean global after timeout to prevent instant adding
        
            setTimeout(function() {setMentionsState(context, "loading", false);}, 1000);
            
            console.log("Finished loading mentions");               
        }                       
    }).fail(function() { showAJAXFail() });     
}

function setMentionsState(context, name, value)
{
    // ---------------------------------------  
    // Set state for particular mentions context
    // ---------------------------------------  

    if (mentions_state_index.indexOf(context) == -1)
    {
        mentions_state_index.push(context);
        mentions_state_data.push({"page": 0, "last_document_id": "", "src": "", "dest": "", "loading": false});
    }   
    
    var mentions_state_position = mentions_state_index.indexOf(context);

    if (mentions_state_position != -1)
    {
        mentions_state_data[mentions_state_position][name] = value;
    }
}

function getMentionsState(context)
{
    // ---------------------------------------  
    // Get state for particular mentions context
    // ---------------------------------------  
    
    var mentions_state_position = mentions_state_index.indexOf(context);

    if (mentions_state_position != -1) return mentions_state_data[mentions_state_position];
    
    return null;    
}

function incorporateAnnotations(sentence_text, localised_annotations)
{
    // ---------------------------------------  
    // Substitute in annotations into sentence with annotations whose
    // positions are localised to the sentence
    // ---------------------------------------  
    
    var insert_before_elements = Array(sentence_text.length);
    var insert_after_elements = Array(sentence_text.length);
    
    utilityFill(insert_before_elements, "");
    utilityFill(insert_after_elements, "");
    
    for(var i = 0; i < localised_annotations.length; i++)
    {
        var type_text = "";

        // Substract one to deal with js zero-based indexing
        
        var annotation_start    = (localised_annotations[i].start - 1);
        var annotation_end      = (localised_annotations[i].end - 1);
        
        switch(localised_annotations[i].type)
        {
            case "src":     type_text = "red"; break;
            case "dest":    type_text = "blue"; break;
        }
        
        // insert_before_elements[annotation_start]     = '<span style="color:' + type_text + ';">';
        // insert_after_elements[annotation_end]        = '</span>';

        if (isHallmark(localised_annotations[i].oid))
        {
            insert_before_elements[annotation_start]    = '';
            insert_after_elements[annotation_end]       = '';                   
        }
        else
        {
            insert_before_elements[annotation_start]    = '<b style="color:#db2828!important">';
            insert_after_elements[annotation_end]       = '</b>';                   
        }
    }
    
    var markedup_text = "";
    
    var tag_open = false;

    for(var i = 0; i < sentence_text.length; i++)
    {
        if (insert_before_elements[i] != "")
        {
            if (tag_open)
            {
                // Tag is already open and we want to open it again
                // This causes problems so don't attempt to open again

                insert_before_elements[i] = "";

                console.log("Deleting opening tag to avoid overlapping tags")
            }

            tag_open = true;
        }

        if (insert_after_elements[i] != "")
        {
            if (!tag_open)
            {
                // Tag is already closed and we want to close it again
                // This causes problems so don't attempt to close again

                insert_after_elements[i] = "";

                console.log("Deleting closing tag to avoid overlapping tags")
            }

            tag_open = false;
        }

        markedup_text += insert_before_elements[i] + sentence_text.charAt(i) + insert_after_elements[i];
    }
    
    return markedup_text;
}

function getFullabstractAnnotated(document_text, annotations_aggregated)
{
    // ---------------------------------------  
    // Annotate the full sentences within a full abstract
    // ---------------------------------------  

    if (annotations_aggregated.length == 0) return document_text;

    var sentence_annotations            = [];
    var sentence_annotations_starts     = [];
    var sentence_annotations_ends       = [];

    for(var i = 0; i < annotations_aggregated.length; i++)
    {
        var annotations                 = annotations_aggregated[i];
        var annotations_sentence_start  = document_text.length;
        var annotations_sentence_end    = 0;

        for(var j = 0; j < annotations.length; j++)
        {
            if (annotations[j].start    < annotations_sentence_start)   annotations_sentence_start  = parseInt(annotations[j].start);
            if (annotations[j].end      > annotations_sentence_end)     annotations_sentence_end    = parseInt(annotations[j].end);         
        }

        var position_to_previous_period     = document_text.substring(0, annotations_sentence_start).lastIndexOf(".");
        var position_to_next_period         = document_text.substring(annotations_sentence_end, document_text.length).indexOf(".");
        
        if (position_to_previous_period != 0)   annotations_sentence_start  = (position_to_previous_period + 2);
        if (position_to_next_period != 0)       annotations_sentence_end    += (position_to_next_period + 1);       

        var position_start  = sentence_annotations_starts.indexOf(annotations_sentence_start);
        var position_end    = sentence_annotations_ends.indexOf(annotations_sentence_end);
        var add_annotation  = false;

        // Ensure we push to widest possible width when sentences overlap

        if (position_start != -1)
        {
            var matching_end = sentence_annotations_ends[position_start];

            if (matching_end < annotations_sentence_end)
            {
                sentence_annotations_ends[position_start] = annotations_sentence_end;
            }
        }
        else
        {
            if (position_end != -1)
            {
                matching_start = sentence_annotations_starts[position_end];

                if (matching_start > annotations_sentence_start)
                {
                    sentence_annotations_starts[position_end] = matching_start;
                }
            }
            else
            {
                // Neither start nor end match what we already have 
                // so add annotation entry into index

                sentence_annotations_starts.push(annotations_sentence_start);
                sentence_annotations_ends.push(annotations_sentence_end);
            }
        }
    }

    // Iterate through all starts/ends and remap to doubles

    var final_annotations = [];

    for (var i = 0; i < sentence_annotations_starts.length; i++)
    {
        final_annotations.push({"start": sentence_annotations_starts[i], "end": sentence_annotations_ends[i]});
    }       

    return incorporateAnnotations(document_text, final_annotations);
}

function getDocumentPreview(document_text, annotations)
{
    // ---------------------------------------  
    // Get sentence immediately before and immediately after sentence(s) containing annotations
    // ---------------------------------------  
    
    // Determine minimum of all annotations starts and max of annotations ends
    // and also determine start and end of longest annotated sentence 
    
    var annotations_sentence_start;
    var annotations_sentence_end;
    
    if (annotations.length == 0)
    {
        annotations_sentence_start  = 0;
        annotations_sentence_end    = document_text.length;
    }
    else
    {   
        annotations_sentence_start  = document_text.length;
        annotations_sentence_end    = 0;

        for(var i = 0; i < annotations.length; i++)
        {
            if (annotations[i].start    < annotations_sentence_start)   annotations_sentence_start  = parseInt(annotations[i].start);
            if (annotations[i].end      > annotations_sentence_end)     annotations_sentence_end    = parseInt(annotations[i].end);         
        }
        
        var position_to_previous_period     = document_text.substring(0, annotations_sentence_start).lastIndexOf(".");
        var position_to_next_period         = document_text.substring(annotations_sentence_end, document_text.length).indexOf(".");
        
        if (position_to_previous_period != 0)   annotations_sentence_start  = (position_to_previous_period + 1);
        if (position_to_next_period != 0)       annotations_sentence_end    += (position_to_next_period + 1);       
    }
            
    // Determine prefix and suffix sentence to annotated sentence
    
    var document_annotatedsentence_prefix   = document_text.substring(0, annotations_sentence_start);
    var document_annotatedsentence          = document_text.substring(annotations_sentence_start, annotations_sentence_end);
    var document_annotatedsentence_suffix   = document_text.substring(annotations_sentence_end, document_text.length);
    
    var position_period_prefix = document_annotatedsentence_prefix.lastIndexOf(".");
    var position_period_suffix = document_annotatedsentence_suffix.indexOf(".");

    if (position_period_prefix != -1)
    {
        var position_period_prefix2 = document_annotatedsentence_prefix.substring(0, position_period_prefix).lastIndexOf(".");
        
        if (position_period_prefix2 != -1)
        {
            document_annotatedsentence_prefix = "..." + document_annotatedsentence_prefix.substring((position_period_prefix2 + 1), document_annotatedsentence_prefix.length);
        }
    }
    
    if (position_period_suffix != -1)
    {
        document_annotatedsentence_suffix = document_annotatedsentence_suffix.substring(0, (position_period_suffix)) + "...";
    }
    
    // Localise annotations to the annotated sentence
    
    var localised_annotations = annotations;
    
    for(var i = 0; i < annotations.length; i++)
    {
        localised_annotations[i].start -= annotations_sentence_start;
        localised_annotations[i].end -= annotations_sentence_start;     
    }
    
    return incorporateAnnotations(document_annotatedsentence, localised_annotations);   
}

function convertFlattenedJSONMentionsToArray(input_array)
{
    // ---------------------------------------  
    // Convert flattened JSON mentions into multi-level array
    // ---------------------------------------  
    
    // Create separate arrays of relations, spans, and documents
    
    relations_index = [];
    relations_data  = [];
    spans_index     = [];
    spans_data      = [];
    documents_index = [];
    documents_data  = [];
    
    for(var i = 0; i < input_array.length; i++)
    {
        var id = input_array[i].id;
        
        switch (input_array[i].type)
        {
            case "Relation":
                if (relations_index.indexOf(id) == -1)
                {
                    relations_index.push(id);
                    relations_data.push(input_array[i]);
                }
                break;
            case "Span":
                if (spans_index.indexOf(id) == -1)
                {
                    spans_index.push(id);
                    spans_data.push(input_array[i]);
                }           
                break;
            default:
                if (documents_index.indexOf(id) == -1)
                {
                    documents_index.push(id);
                    documents_data.push(input_array[i]);
                }           
                break;
        }
    }
    
    // Loop through all relations and add in related objects
        
    for(var i = 0; i < relations_index.length; i++)
    {   
        var documents_position = documents_index.indexOf(relations_data[i].target);
        
        if (documents_position != -1)
        {
            relations_data[i].target = documents_data[documents_position];
        }
        
        var spans_position_from = spans_index.indexOf(relations_data[i].body.from);
        var spans_position_to = spans_index.indexOf(relations_data[i].body.to);
        
        if (spans_position_from != -1)
        {
            relations_data[i].body.from = spans_data[spans_position_from];
        }
        
        if (spans_position_to != -1)
        {
            relations_data[i].body.to = spans_data[spans_position_to];
        }               
    }
    
    return relations_data;
}

function convertTargetToStartEnd(oid, type, target_text)
{
    // ---------------------------------------  
    // Converts target text in the form "doc_id#char=start,end"
    // to {oid:, type:, start:, end:} array
    // ---------------------------------------  

    var start_end = {"oid": oid, "type": type, "start": 0, "end": 0};
        
    var target_split = target_text.split('#');

    if (target_split.length > 1)
    {       
        var namevalue_split = target_split[1].split("=");
        
        if (namevalue_split.length > 1)
        {           
            var comma_split = namevalue_split[1].split(",");
            
            if (comma_split.length > 1)
            {
                start_end = {"oid": oid, "type": type, "start": comma_split[0], "end": comma_split[1]};
            }
        }
    }

    return start_end;
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------- Nodes and edges data model ---------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ----- Avoids dependency on particular graphing library ----
// ------- and allows graph data model to be built and -------
// -------- modified independently of actual rendering -------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function initNodesEdgesIndex()
{
    // ---------------------------------------  
    // Initialize internal index
    // ---------------------------------------  
    
    nodes_index             = [];
    nodes_data              = [];
    nodes_count             = 0;
    edges_index             = [];
    edges_data              = [];
}

function addNodeToIndex(node_)
{
    // ---------------------------------------  
    // Add node to internal index
    // ---------------------------------------  
	node = {group: 'nodes', type: node_['type'], data: node_  }	

    var id = node.data.id;
    
    if (nodes_index.indexOf(id) == -1)
    {
        nodes_index.push(id);


        var pages = {all:1}
        _.each(alltypes_code, function (o) { pages[o] = 1 })

        nodes_data.push({core: node, edges: [], page: pages});  
        nodes_count++;
    }  

}

function getNodeFromIndex(node_oid)
{
    // ---------------------------------------  
    // Get node from internal index
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid);
    
    if (node_position != -1) return nodes_data[node_position].core;
    
    return undefined;
}

function deleteNodeFromIndex(node_oid)
{
    // ---------------------------------------  
    // Delete node from index
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid);
    
    if (node_position == -1) return;

    // If node is displayed, then remove appropriate graph_cytoscape elements

    if (nodes_data[node_position].displayed === true)
    {
        if (graph_cytoscape !== undefined)
        {
            // Remove all bound events the node and connected edges

            graph_cytoscape.$("edge[source='" + node_oid + "']").off("tap tapend tapdragover tapdragout");
            graph_cytoscape.$("edge[target='" + node_oid + "']").off("tap tapend tapdragover tapdragout");
            graph_cytoscape.$("node[id='" + node_oid + "']").off("tap tapend tapdragover tapdragout");          
                        
            // Delete edges and node from actual graph

            graph_cytoscape.$("edge[source='" + node_oid + "']").remove();
            graph_cytoscape.$("edge[target='" + node_oid + "']").remove();
            graph_cytoscape.$("node[id='" + node_oid + "']").remove();          
        }
    }   

    var edges = nodes_data[node_position].edges.slice(0);
    
    for(var i = 0; i < edges.length; i++)
    {
        deleteEdgeFromIndex(node_oid, edges[i]);
        
        // Reset page count for destination node as will need to start from 
        // scratch when loading nodes using pagination
        
        resetNodePage(edges[i]);        
    }
    
    nodes_index.splice(node_position, 1);
    nodes_data.splice(node_position, 1);
    nodes_count--;

}

function getNodeStatistics(node_oid)
{
    // ---------------------------------------  
    // Get statistics on particular node
    // ---------------------------------------  
 	
 
    node_fullobject         = getObjectFromIndex(node_oid);
    node_edges              = node_fullobject.edges;

	console.log('getNodeStatistics')
	console.log(node_fullobject)
	console.log(node_edges)

    statistics_EdgeMetrics  = [];
    
    for(var i = 0; i < node_edges.length; i++)
    {
        var node_secondary = getNodeFromIndex(node_edges[i]);
        var edge = getEdgeFromIndex(node_oid, node_edges[i]);


        statistics_EdgeMetrics.push({"oid": node_secondary.data.id, "name": node_secondary.data.fullname, "type": node_secondary.data.type, "year": edge.year, "doc_count": edge.doc_count, "metric": edge.metric, "value": edge.count});
    }   
    
    statistics_EdgeMetrics                  = _.sortBy(statistics_EdgeMetrics, 'value');
    statistics_EdgeMetrics_oids             = [];
    statistics_EdgeMetrics_labels           = [];
    statistics_EdgeMetrics_values           = [];
    statistics_EdgeMetrics_types            = [];
    statistics_EdgeMetrics_metrics          = [];
    statistics_EdgeMetrics_years            = [];
    statistics_EdgeMetrics_documentcounts   = [];
    
    for(var i = 0; i < statistics_EdgeMetrics.length; i++)
    {
        statistics_EdgeMetrics_oids.push(statistics_EdgeMetrics[i].oid);
        statistics_EdgeMetrics_labels.push(statistics_EdgeMetrics[i].name);
        statistics_EdgeMetrics_types.push(statistics_EdgeMetrics[i].type);
        statistics_EdgeMetrics_values.push(statistics_EdgeMetrics[i].value);        
        statistics_EdgeMetrics_metrics.push(statistics_EdgeMetrics[i].metric);      
        statistics_EdgeMetrics_years.push(statistics_EdgeMetrics[i].year);              
        statistics_EdgeMetrics_documentcounts.push(statistics_EdgeMetrics[i].doc_count);                        
    }

    statistics_EdgeMetrics_oids             = statistics_EdgeMetrics_oids.reverse();
    statistics_EdgeMetrics_labels           = statistics_EdgeMetrics_labels.reverse();
    statistics_EdgeMetrics_types            = statistics_EdgeMetrics_types.reverse();   
    statistics_EdgeMetrics_values           = statistics_EdgeMetrics_values.reverse();
    statistics_EdgeMetrics_metrics          = statistics_EdgeMetrics_metrics.reverse();
    statistics_EdgeMetrics_years            = statistics_EdgeMetrics_years.reverse();
    statistics_EdgeMetrics_documentcounts   = statistics_EdgeMetrics_documentcounts.reverse();
    
    var statistics_array = 
    {
        "EdgeMetrics": 
        {
            "oids":             statistics_EdgeMetrics_oids,
            "labels":           statistics_EdgeMetrics_labels,
            "types":            statistics_EdgeMetrics_types,
            "values":           statistics_EdgeMetrics_values,
            "metrics":          statistics_EdgeMetrics_metrics, 
            "years":            statistics_EdgeMetrics_years,           
            "documentcounts":   statistics_EdgeMetrics_documentcounts
        },          
    };
    
    return statistics_array;
}

function countEdgesPossible(node_oid)
{
    // ---------------------------------------  
    // Count number of possible edges for node
    // ---------------------------------------  

    var node = getNodeFromIndex(node_oid);      
    return node.data.edgecount;

/*
    // DEPRECATED: 12/05/2017: Neo4J too slow to return edge count for discovery mode
    // so use existing edge count
    
    // The latest number of 'all' possible edges for a particular node will 
    // depend on the number of visible first-level nodes... and these may vary
    // So we add in the latest number of edges connecting the node to all 
    // visible first-level nodes

    var node            = getNodeFromIndex(node_oid);       
    var edges_possible  = node.data.edgecount;
    
    if (discovery_mode)
    {
        if (node_oid != getSource()) edges_possible += getNumberLevelOneEdges(node_oid);    
    }
    
    return edges_possible;  
*/  
}

function deleteNodeSafe(node_oid)
{
    // ---------------------------------------  
    // Delete node from graph but in safe way checking we don't delete start or dest node
    // ---------------------------------------  
    
    if ((node_oid == getSource()) | (node_oid == getDestination()) | (node_oid == '_B-PARENT')) return;

    deleteNodeFromIndex(node_oid);      
}

function isNodeInIndex(node_oid)
{
    // ---------------------------------------  
    // Check whether node exists in index
    // ---------------------------------------  

    var node = getNodeFromIndex(node_oid);

    return (node === undefined) ? false: true;  
}

function getNodeIdList()
{
    // ---------------------------------------  
    // Returns list of active node ids
    // ---------------------------------------  
    
    return nodes_index;
}


function setMetricValueForEdges() 
{

	console.log('in setMetricValueForEdges -----------------------')

	_.forEach(edges_data, function(edge){

		if (edge.core.data.hasOwnProperty(getEdgeMetric()+'__arr')){
			edge.core.data.metric = 
			edge.core.data[getEdgeMetric()+'__arr'][
				edge.core.data[getEdgeMetric()+'__arr'].length -1 - (getYearEnd() - getFilterYearEnd())]
			edge.core.data.positive = edge.core.data.metric > 0

			//update the values of curent graph elements too!
			if (graph_cytoscape){
				graph_cytoscape.edges("[id='" + edge.core.data.id + "']").data("metric", edge.core.data.metric);
				graph_cytoscape.edges("[id='" + edge.core.data.id + "']").data("positive", edge.core.data.positive);
			}
		}

		edge.core.data['count'] = edge.core.data['count__arr'][
			edge.core.data['count__arr'].length - 1 - (getYearEnd() - getFilterYearEnd()) ]	
		edge.core.data['doc_count'] = edge.core.data['doc_count__arr'][
			edge.core.data['doc_count__arr'].length - 1 - (getYearEnd() - getFilterYearEnd()) ]	


		//Update the edge list for each node depending on whether the edge existed in that year
		var src = edge.core.data.source
		var target = edge.core.data.target

		var src_position    = nodes_index.indexOf(src);
		var dest_position   = nodes_index.indexOf(target);
		var edge_position   = edges_index.indexOf(edge.core.data.id);
	
	
		if (src_position != -1)
		{
			if (nodes_data[src_position].edges.indexOf(target) == -1 && edge.core.data.year <= getFilterYearEnd() )
			{
				nodes_data[src_position].edges.push(target);
			}
			else if (nodes_data[src_position].edges.indexOf(target) != -1 && edge.core.data.year > getFilterYearEnd())
			{
				nodes_data[src_position].edges = _.filter(nodes_data[src_position].edges, function (o) {return o !== target});
			}
		}

		if (dest_position != -1)
		{
			if (nodes_data[dest_position].edges.indexOf(src) == -1 && edge.core.data.year <= getFilterYearEnd())
			{
				nodes_data[dest_position].edges.push(src);
			}       
			else if (nodes_data[dest_position].edges.indexOf(src) != -1 && edge.core.data.year > getFilterYearEnd())
			{
				nodes_data[dest_position].edges = _.filter(nodes_data[dest_position].edges, function (o) {return o !== src});
			}
		}
		
		

	})


	//TODO: I need to update this in the cytoscape graph itself!
}

function setFilterMinYearToGraphEdges()
{
	showFilterDate()
}


function addEdgeToIndex(edge_data_)
{
    // ---------------------------------------  
    // Add edge to internal idex
    // ---------------------------------------  
    edge_data = {group:'edges', data: edge_data_ }
 
    var src             = edge_data.data.source;
    var target          = edge_data.data.target;

    var edge_oid        = edge_data.data.source + ' ' + edge_data.data.target;    

	edge_data.data.id = edge_oid;
	if (edge_data.data.hasOwnProperty(getEdgeMetric())){
			
		edge_data.data[getEdgeMetric()+'__arr'] = edge_data.data[getEdgeMetric()]
		edge_data.data.metric = edge_data.data[getEdgeMetric()+'__arr'].slice(-1)[0]
		edge_data.data.positive = edge_data.data.metric > 0
	}
	edge_data.data['count__arr'] = edge_data.data['count']
	edge_data.data['doc_count__arr'] = edge_data.data['doc_count']

	edge_data.data['count'] = edge_data.data['count__arr'].slice(-1)[0]	
	edge_data.data['doc_count'] = edge_data.data['doc_count__arr'].slice(-1)[0]	


	var src_position    = nodes_index.indexOf(src);
    var dest_position   = nodes_index.indexOf(target);
    var edge_position   = edges_index.indexOf(edge_oid);
    
    if (src_position != -1)
    {
        if (nodes_data[src_position].edges.indexOf(target) == -1)
        {
            nodes_data[src_position].edges.push(target);
        }
    }

    if (dest_position != -1)
    {
        if (nodes_data[dest_position].edges.indexOf(src) == -1)
        {
            nodes_data[dest_position].edges.push(src);
        }       
    }
    
    if (edge_position == -1)
    {
        edges_index.push(edge_oid);
        edges_data.push({"core": edge_data});
    }



}

function getEdgeFromIndex(src_oid, dest_oid)
{
    // ---------------------------------------  
    // Get edge object from index
    // ---------------------------------------  
    
    var edge_id1 = getEdgeIdFromEdges(src_oid, dest_oid);
    var edge_id2 = getEdgeIdFromEdges(dest_oid, src_oid);
    
    var edge_position1 = edges_index.indexOf(edge_id1);
    var edge_position2 = edges_index.indexOf(edge_id2);
    
    if (edge_position1 != -1)
    {
        return edges_data[edge_position1].core.data;
    }
    
    if (edge_position2 != -1)
    {
        return edges_data[edge_position2].core.data;    
    }
    
    return undefined;   
}

function getEdgeIdFromEdges(src_oid, dest_oid)
{
    // ---------------------------------------  
    // Get edge id from src and dest
    // ---------------------------------------  

    return src_oid + " " + dest_oid;
}

function deleteEdgeFromIndex(src_oid, dest_oid)
{
    // ---------------------------------------  
    // Delete edge from internal index
    // ---------------------------------------  
    
    var node_src_position   = nodes_index.indexOf(src_oid);
    var node_dest_position  = nodes_index.indexOf(dest_oid);
    var edge_position1      = edges_index.indexOf(getEdgeIdFromEdges(src_oid, dest_oid));
    var edge_position2      = edges_index.indexOf(getEdgeIdFromEdges(dest_oid, src_oid));
    
    // Delete edge from src
    
    if (node_src_position != -1)
    {
        var edges_src = nodes_data[node_src_position].edges.slice(0);
        var edges_dest_position = edges_src.indexOf(dest_oid);
        
        if (edges_dest_position != -1)
        {
            edges_src.splice(edges_dest_position, 1);
            nodes_data[node_src_position].edges = edges_src;            
        }
    }
    
    // Delete edge from dest
    
    if (node_dest_position != -1)
    {
        var edges_dest = nodes_data[node_dest_position].edges.slice(0);
        var edges_src_position = edges_dest.indexOf(src_oid);
        
        if (edges_src_position != -1)
        {
            edges_dest.splice(edges_src_position, 1);
            nodes_data[node_dest_position].edges = edges_dest;
        }
    }

    // Delete edge from index
    
    if (edge_position1 != -1)
    {
        edges_index.splice(edge_position1, 1);
        edges_data.splice(edge_position1, 1);
    }

    if (edge_position2 != -1)
    {
        edges_index.splice(edge_position2, 1);
        edges_data.splice(edge_position2, 1);
    }

}

function isEdgeInIndex(src_oid, dest_oid)
{
    // ---------------------------------------  
    // Check whether edge already in index - and so doesn't need to be drawn 
    // ---------------------------------------  
    
    var src_position    = nodes_index.indexOf(src_oid);
    var dest_position   = nodes_index.indexOf(dest_oid);

    if (src_position != -1)
    {
        if (nodes_data[src_position].edges.indexOf(dest_oid) != -1)
        {
            return true;
        }
    }
    
    if (dest_position != -1)
    {
        if (nodes_data[dest_position].edges.indexOf(src_oid) != -1)
        {
            return true;
        }
    }
    
    return false;   
}

function countEdgesCurrent(node_oid)
{
    // ---------------------------------------  
    // Count number of edges of node
    // ---------------------------------------  
    
    var edges_count     = 0;
    var node_position   = nodes_index.indexOf(node_oid);
    
    if (node_position != -1) return nodes_data[node_position].edges.length;
    
    return 0;
}

function countEdgesCurrentExcludeNodes(node_oid, nodes_list)
{
    // ---------------------------------------  
    // Count number of edges of node that are not in list
    // ---------------------------------------  
    
    var edges_count     = 0;
    var node_position   = nodes_index.indexOf(node_oid);
    
    if (node_position != -1)
    {
        var nodes_current = nodes_data[node_position].edges;
        
        for(var i = 0; i < nodes_current.length; i++)
        {
            if (nodes_list.indexOf(nodes_current[i]) == -1) edges_count++;
        }
    }
    
    return edges_count;
}

function markAllBNodes()
{
    // ---------------------------------------  
    // Go through all B nodes and mark them accordingly
    // including making their parents '_B-PARENT'
    // ---------------------------------------  

    // If not closed graph, then B node concept doesn't apply

    if (!isClosedGraph()) return;

    var src             = getSource();
    var destination     = getDestination();

    // Loop through all nodes and see if they are linked to both src and destination

    for (var i = 0; i < nodes_index.length; i++)
    {
        if (nodes_data[i].core.data.sort === undefined)     continue;

        var edges = nodes_data[i].edges;

        if ((edges.indexOf(src) != -1) && (edges.indexOf(destination) != -1))
        {
            // We have a B node

            nodes_data[i].core.data.sort    = "B";
            nodes_data[i].core.data.parent  = "_B-PARENT";
        }
    }
}

function incrementNodePage(node_oid,type)
{
    // ---------------------------------------  
    // Increment page count for node so it loads more neighbours
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid); 

    if (node_position != -1)
    {
        if (!type){
            nodes_data[node_position].page.all++;
        } else {
            nodes_data[node_position].page[type]++;
        }
    }       
}

function setNodePage(node_oid, page,type )
{
    // ---------------------------------------  
    // Set page count for node
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid); 

    if (node_position != -1)
    {
        if (!type){
            nodes_data[node_position].page.all = page;
        } else {
            nodes_data[node_position].page[type] = page;
        }    
    }       
}

function resetNodePage(node_oid)
{
    // ---------------------------------------  
    // Increment page count for node so it loads more neighbours
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid); 

    var pages = {all:1}
    _.each(alltypes_code, function (o) { pages[o] = 1 })

    if (node_position != -1) nodes_data[node_position].page = pages;
}

function setNodeLevel(node_oid, level)
{
    // ---------------------------------------  
    // Sets level/depth of particular node
    // ---------------------------------------  

    var node_position = nodes_index.indexOf(node_oid); 

    if (node_position != -1) nodes_data[node_position].core.data.level = level;     
}

function getNodeLevel(node_oid)
{
    // ---------------------------------------  
    // Gets level/depth of particular node
    // ---------------------------------------  

    var node_position = nodes_index.indexOf(node_oid); 

    if (node_position != -1) return nodes_data[node_position].core.data.level;      

    return 0;
}

function getNodePage(node_oid,type)
{
    // ---------------------------------------  
    // Get page count for node that is used to load more neighbours
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid); 

    if (node_position != -1) {
        if (!type) {return nodes_data[node_position].page.all }
        return nodes_data[node_position].page[type];
    }

    return 1;
}

function getObjectFromIndex(node_oid)
{
    // ---------------------------------------  
    // Get full object which includes node from internal index
    // ---------------------------------------  

    var node_position = nodes_index.indexOf(node_oid);
    
    if (node_position != -1) return nodes_data[node_position];
    
    return undefined;   
}

function getNeighboursFromIndex(node_oid)
{
    // ---------------------------------------  
    // Get all neighbours for node
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid);
    
    if (node_position != -1)
    {
        var edges = nodes_data[node_position].edges.slice(0);
                
        return edges;
    }
    
    return [];  
}

function getAddedNeighboursFromIndex(node_oid)
{
    // ---------------------------------------  
    // Get all non-primary added neighbours for node
    // ---------------------------------------  
    
    var node_position = nodes_index.indexOf(node_oid);
    
    if (node_position != -1)
    {
        var edges = nodes_data[node_position].edges.slice(0);
        
        // If not first node, then remove first edge from added neighbours 
        // as this represents edge from node that created current node
        
        if (node_position != 0) edges.splice(0, 1);
        
        return edges;
    }
    
    return [];  
}

function getNodeIndexSize()
{
    // ---------------------------------------  
    // Gets size of node index
    // ---------------------------------------  

    return nodes_count;
}

function getLevelOneNodes()
{
    // ---------------------------------------  
    // Get an array of all level one nodes
    // ---------------------------------------  
    
    var nodes_levelone = [];
    
    for(var i = 0; i < nodes_index.length; i++)
    {
        if (nodes_data[i].core.data.level == 1) nodes_levelone.push(nodes_index[i]);
    }
    
    return nodes_levelone;
}

function getBNodes()
{
    // ---------------------------------------  
    // Gets an array of all B nodes
    // ---------------------------------------  

    var b_nodes = [];

    for(var i = 0; i < nodes_data.length; i++)
    {
        if (nodes_data[i].core.data.parent == "_B-PARENT") b_nodes.push(nodes_data[i].core.data.id);
    }

    return b_nodes;
}

function getFirstNodeOfType(sort_type)
{
    // ---------------------------------------  
    // Gets first node of particular type
    // ---------------------------------------  

    for(var i = 0; i < nodes_data.length; i++)
    {
        if (nodes_data[i].core.data.sort == sort_type) return nodes_data[i].core.data.id;
    }

    return null;
}

function isConnectedToCOnly(node_oid)
{
    // ---------------------------------------  
    // Checks whether non-B node is connected to C and not A
    // ---------------------------------------  

    var node_A      = getFirstNodeOfType('A');
    var node_C      = getFirstNodeOfType('C');
    var node        = getObjectFromIndex(node_oid);
    var node_edges  = node.edges;

    if ((node_A != null) && (node_C != null))
    {
        if ((node_edges.indexOf(node_A) == -1) &&
            (node_edges.indexOf(node_C) != -1))
        {
            return true;
        }
    }

    return false;
}

function getNumberLevelOneEdges(node_oid)
{
    // ---------------------------------------  
    // Get number of edges connecting to level one nodes
    // ---------------------------------------  

    var number_edges    = 0;    
    var node_position   = nodes_index.indexOf(node_oid); 

    if (node_position != -1)
    {
        var nodes_levelone  = getLevelOneNodes();   
        var node_edges      = nodes_data[node_position].edges;
        
        for(var i = 0; i < node_edges.length; i++)
        {
            if (nodes_levelone.indexOf(node_edges[i]) != -1) number_edges++;
        }       
    }           

    return number_edges;
}

// -----------------------------------------------------------
// --------------------- Filters on index --------------------
// -----------------------------------------------------------

function applyFilters()
{
    // ---------------------------------------  
    // Apply any relevant filters to data
    // ---------------------------------------  

    // Create array to track removed nodes and edges

    var removed_nodes = [];
    var removed_edges = [];

    // Apply types filter

    // Remove nodes based on type first, also removing any edges they are attached to

    if (getFilterTypes().length != getAllTypes().length)
    {
        // Iterate through all nodes and remove types not selected

        var selected_types = getFilterTypes();

        for(var i = 0; i < nodes_data.length; i++)
        {
            var node_oid    = nodes_data[i].core.data.id;
            var node_type   = nodes_data[i].core.type;

            if ((node_oid == getSource()) || (node_oid == getDestination()) || (node_oid == "_B-PARENT")) continue;

            if (selected_types.indexOf(node_type) == -1)
            {
                removed_nodes.push(node_oid);

                var related_edges = nodes_data[i].edges;

                for(var j = 0; j < related_edges.length; j++)
                {
                    var edge1_id = getEdgeIdFromEdges(node_oid, related_edges[j]);
                    var edge2_id = getEdgeIdFromEdges(related_edges[j], node_oid);

                    var edge1_position = removed_edges.indexOf(edge1_id);
                    var edge2_position = removed_edges.indexOf(edge2_id);

                    if (edge1_position == -1) removed_edges.push(edge1_id);
                    if (edge2_position == -1) removed_edges.push(edge2_id);
                }               
            }
        }
    }

    // Apply weight filter
	//console.log('Node metrics in applyfilters')
	//console.log(_.map(_.sortBy(_.map(edges_data, function(o){return o.core.data } ), [function(item){return item.metric}]), 
	//										function(item){return item.metric} ) )

    // Only apply weight filter if range differs from what is retrieved from server

    //if ((getFilterWeightStart()     != getWeightStart()) ||
    //    (getFilterWeightEnd()       != getWeightEnd()))
    if ((getFilterWeightStart()     != getFilterWeightMin()) ||
        (getFilterWeightEnd()       != getFilterWeightMax()) && getFilterWeightStart() != null && getFilterWeightEnd() != null )
    {
        // Filter edges

        for(var i = 0; i < edges_data.length; i++)
        {
            var weight = edges_data[i].core.data.metric;

            if ((weight < getFilterWeightStart())  || (weight > getFilterWeightEnd()))
            {
                var remove_oid = edges_data[i].core.data.id;

                if (removed_edges.indexOf(remove_oid) == -1) removed_edges.push(remove_oid);
            }
        }
    }

    // Apply date filter

    // Only apply date filter if range differs from what is retrieved from server

    if (//(getFilterYearStart()   != getYearStart()) ||
        (getFilterYearEnd()     != getYearEnd()))
    {
        // Filter edges

        for(var i = 0; i < edges_data.length; i++)
        {
            var year = edges_data[i].core.data.year;

            if (//(year < getFilterYearStart())  || 
				(year > getFilterYearEnd()))
            {
                var remove_oid = edges_data[i].core.data.id;

                if (removed_edges.indexOf(remove_oid) == -1) removed_edges.push(remove_oid);
            }
        }
    }

    // Convert removed edges array into a more structured format

    var structured_removed_edges_data   = [];
    var structured_removed_edges_index  = [];

    for(var i = 0; i < removed_edges.length; i++)
    {
        var edge_id             = removed_edges[i];
        var edge_id_elements    = edge_id.split(" ");
        var edge_id_src         = edge_id_elements[0];
        var edge_id_dest        = edge_id_elements[1];

        if (structured_removed_edges_index.indexOf(edge_id_src) == -1)
        {
            structured_removed_edges_index.push(edge_id_src);
            structured_removed_edges_data.push([]);
        }

        if (structured_removed_edges_index.indexOf(edge_id_dest) == -1)
        {
            structured_removed_edges_index.push(edge_id_dest);
            structured_removed_edges_data.push([]);
        }

        var edge_id_src_position    = structured_removed_edges_index.indexOf(edge_id_src);
        var edge_id_dest_position   = structured_removed_edges_index.indexOf(edge_id_dest);

        if (structured_removed_edges_data[edge_id_src_position].indexOf(edge_id_dest) == -1)
        {
            structured_removed_edges_data[edge_id_src_position].push(edge_id_dest); 
        }

        if (structured_removed_edges_data[edge_id_dest_position].indexOf(edge_id_src) == -1)
        {
            structured_removed_edges_data[edge_id_dest_position].push(edge_id_src); 
        }
    }

    // Loop through structured array and determine whether nodes should be removed too

    for(var i = 0; i < structured_removed_edges_index.length; i++)
    {
        var src_oid             = structured_removed_edges_index[i];
        var src_node            = getObjectFromIndex(src_oid);
        var src_removed_edges   = structured_removed_edges_data[i];
        var src_actual_edges    = src_node.edges;

        var src_common_edges = intersect(src_removed_edges, src_actual_edges);

        // If nodes edges are same as removed edges, then remove node

        if (src_common_edges.length == src_actual_edges.length)
        {           
            if (removed_nodes.indexOf(src_oid) == -1)
            {
                if ((src_oid != getSource()) && (src_oid != getDestination())) removed_nodes.push(src_oid);
            } 
        }
    }

    // Hide all removed nodes and edges

    // for(var i = 0; i < removed_nodes.length; i++)    nodes_data[nodes_index.indexOf(removed_nodes[i])].show = false; 
    // for(var i = 0; i < removed_edges.length; i++)    edges_data[edges_index.indexOf(removed_edges[i])].show = false;

	if (graph_cytoscape) {
		graph_cytoscape.nodes().removeClass("hidden");                                      
		graph_cytoscape.edges().removeClass("hidden");                                      
	}


    for(var i = 0; i < removed_nodes.length; i++)
    {
        graph_cytoscape.nodes("[id='" + removed_nodes[i] + "']").addClass("hidden");                                        
    }   

    for(var i = 0; i < removed_edges.length; i++)
    {
        graph_cytoscape.edges("[id='" + removed_edges[i] + "']").addClass("hidden");                                        
    }
}
function resetNodesEdgesForFilters()
{
    // ---------------------------------------  
    // Reset all nodes and edges as if they're not filtered
    // ---------------------------------------  

    for(var i = 0; i < nodes_data.length; i++)  nodes_data[i].show = true;
    for(var i = 0; i < edges_data.length; i++)  edges_data[i].show = true;
}

function aggregateUndisplayedNodesEdges()
{
    // ---------------------------------------  
    // Aggregates all undisplayed nodes and edges from index in display-ready format
    // ---------------------------------------  

    var elements = [];

    resetNodesEdgesForFilters();

    // Mark all B Nodes first

    markAllBNodes();

    for(var i = 0; i < nodes_data.length; i++)
    {
        if ((nodes_data[i].displayed !== true) && (nodes_data[i].show)) elements.push(nodes_data[i].core);          
    } 

    for(var i = 0; i < edges_data.length; i++)
    {
        if ((edges_data[i].displayed !== true) && (edges_data[i].show)) elements.push(edges_data[i].core);
    }

    return elements;
}

function setNodesEdgesDisplayed()
{
    // ---------------------------------------  
    // Sets 'display' value of all nodes and edges to 'true'
    // ---------------------------------------  

    for(var i = 0; i < nodes_data.length; i++) nodes_data[i].displayed = true;
    for(var i = 0; i < edges_data.length; i++) edges_data[i].displayed = true;
}

function resetNodesEdgesDisplayed()
{
    // ---------------------------------------  
    // Resets 'display' value of all nodes and edges
    // ---------------------------------------  

    for(var i = 0; i < nodes_data.length; i++) nodes_data[i].displayed = false;
    for(var i = 0; i < edges_data.length; i++) edges_data[i].displayed = false; 
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------- AJAX external data calls ----------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function appendGlobalParameters(query)
{
    // ---------------------------------------  
    // Add global parameters to query path sent via AJAX
    // ---------------------------------------  

    // We assume no parameters are currently attached to path
    // and append '&' at end to be safe

    // Add initial '?' as we assume no parameters currently attached to path

    query += '?';

    // Add in hide low frequency term flag

    //query += 'hide_lowfrequency=' + (getHideLowFrequency() ? 'true' : 'false') + '&';
    query += 'db=' + (getHideLowFrequency() ? 'neo4j' : 'inmemory') + '&';

    // Add in types but only if different from all types

    var selected_types = getTypes();

    if (selected_types.length != getAllTypes().length)
    {
        for(var i = 0; i < selected_types.length; i++)
        {
            query += 'type=' + selected_types[i] + '&';
        }       
    }

    // Add in edge sort value

    query += 'edge_metric=' + edge_metric + "&";

    // Add in aggregation sort value

    query += 'aggregation_func=' + aggregation_func + "&";

    // Add in date range if necessary
    
    //date_range_year_start   = getYearStart();
    date_range_year_end     = getYearEnd();
        
    if (   // (date_range_year_start  != date_range_year_min) ||
            (date_range_year_end    != date_range_year_max))
    {
        //query += "year_start=" + date_range_year_start + "&year_end=" + date_range_year_end + "&";
        query +=  "year_end=" + date_range_year_end + "&";
    }

    // Add in weight reange if necessary
    //if (    (getWeightStart() != null && getWeightStart() != getWeightMin()) ||
    //        (getWeightEnd() != null && getWeightEnd() != getWeightMax()))
    //{
    //    query += "weight_start=" + getWeightStart() + "&weight_end=" + getWeightEnd() + "&";
    //}

    if (    getWeightStart() != null && getWeightStart() != getWeightMin() )
    {
        query += "weight_start=" + getWeightStart() + "&";
    }

    if (  getWeightEnd() != null && getWeightEnd() != getWeightMax())
    {
		//console.log('Adding get weight end! '+ getWeightEnd())
        query += "&weight_end=" + getWeightEnd() + "&";
    }
	


    return query;
}

function getGraphNode(oid, existing_nodes)
{
    // ---------------------------------------  
    // Gets particular node and any possible edges between this node and existing nodes
    // ---------------------------------------  

    var query = "add_node/";
    
    query += encodeURIComponent(oid);

    query = appendGlobalParameters(query);

	query += query.indexOf('?') > -1 ? (query.substr(-1) == '&' ? '' : '&') + "history=1" : "?history=1"
    // Build query text containing array of existing nodes

    existing_nodes_query_list = [];
    
    for(var i = 0; i < existing_nodes.length; i++)
    {
        if ( existing_nodes[i] != '_B-PARENT' ) {
			existing_nodes_query_list.push("n=" + encodeURIComponent(existing_nodes[i]));
		}
    } 
    if (existing_nodes_query_list.length != 0) query += "&" + existing_nodes_query_list.join("&");
    
    // Indicate network activity to user
    
    showProcessingActivity();
    
    return $.get(query);
}

function extendGraph(oid, existing_nodes, page, nodetype) 
{       
    // ---------------------------------------  
    // Gets immediate neighbours of node, discounting existing 
    // nodes but getting any possible new edges that might 
    // arise from the new neighbours. To do this requires 
    // supplying the call with an array of existing nodes
    // ---------------------------------------  
    
    // Build query text containing array of existing nodes
    
    existing_nodes_query_list = [];
    
    for(var i = 0; i < existing_nodes.length; i++)
    {
        if ( existing_nodes[i] != '_B-PARENT' ) {
			existing_nodes_query_list.push("n=" + encodeURIComponent(existing_nodes[i]));
		}
	}	
 
	//console.log('Existing nodes length: ' + existing_nodes.length)
	console.log('open_discovery '+ open_discovery)
    var query = open_discovery == 1 && existing_nodes.length == 0  ? "open_discovery/"  :  "neighbours/"   ;
    

    query += encodeURIComponent(oid);

    query = appendGlobalParameters(query);

    query += "page=" + page ;

    if (discovery_mode) query += "&discovery_mode=1";

    query += query.indexOf('?') > -1 ? (query.substr(-1) == '&' ? '' : '&') + "history=1" : "?history=1"
    
    if (existing_nodes_query_list.length != 0) query += "&" + existing_nodes_query_list.join("&");

    if (nodetype) query += query.indexOf('?') > -1 ? (query.substr(-1) == '&' ? '' : '&') + "type="+nodetype : "?type="+nodetype
    // Indicate network activity to user

    
    showProcessingActivity();
	//console.log('extend_graph query: '+ query )	

 
    return $.get(query);
}

function getClosedGraph(src_oid, dest_oid, page) 
{   
    // ---------------------------------------  
    // Get the closed graph nodes between 'src' and 'dest'
    // ---------------------------------------  
    
    var query = "closed_discovery/" + encodeURIComponent(src_oid) + "/" + encodeURIComponent(dest_oid);

    query = appendGlobalParameters(query);

	query += query.indexOf('?') > -1 ? (query.substr(-1) == '&' ? '' : '&') + "history=1" : "?history=1"
    // Indicate network activity to user

    if (page !== undefined) {query += "&page=" + page  }
    
    showProcessingActivity();
    
    return $.get(query);
}

function getMentions(src_oid, dest_oid, page) 
{   
    // ---------------------------------------  
    // Get all mentions of co-occurrence of src_oid and dest_oid
    // ---------------------------------------  
    
    var query = "relations/" + encodeURIComponent(src_oid) + "/to/" + encodeURIComponent(dest_oid) + "/";

    // Append global parameters first then add in more specific parameters

    query = appendGlobalParameters(query);

    query += "expand=1&page=" + page.toString();

    // Indicate network activity to user
    
    showProcessingActivity();
    
    return $.get(query);
}

function getCanonicalNodeText(oid)
{
    // ---------------------------------------  
    // Get descriptive text for node
    // ---------------------------------------  
    
    var query = "get_text_from_oid/" + encodeURIComponent(oid);

    // Indicate network activity to user
    
    showProcessingActivity();
    
    return $.get(query);    
}

function getWeightRangeMinMax(weight_field)
{
    // ---------------------------------------  
    // Gets minimum and maximum value of particular weight field
    // ---------------------------------------  

    var query = "get_weight_minmax/" + encodeURIComponent(weight_field);

    // Indicate network activity to user

    showProcessActivity();

    return $.get(query);
}


function getNeo4jMetadata()
{
    return $.ajax(
    {
        type:'get',
        url: 'get_db_metadata/',
    }).then(

        function(data) 
        {

			if (data){

				date_range_year_min = data.year_info[0].toString();          
				date_range_year_max = data.year_info[1].toString();          
				filter_date_range_year_start = date_range_year_min; 
				filter_date_range_year_end = date_range_year_max;   


			    edge_metric_values_index = _.map( data.metric_info , function(item){ return item[0] });
				edge_metric_values_data =  _.map( data.metric_info , function(item){ return item[1] });

				aggregation_func_values_index = _.map( data.aggregation_function_info , function(item){ return item[0] });
				aggregation_func_values_data = 	_.map( data.aggregation_function_info , function(item){ return item[1] });


				edge_metric_default         = data.defaults_info['edge_metric'];
				aggregation_func_default    = data.defaults_info['aggregation_function'];


				metadata = data.meta_info
				if (metadata && metadata.hasOwnProperty('mention_count')) {
					neo4j_metadata = metadata
					console.log('neo4j_metadata')
					console.log(neo4j_metadata)
					var toset = edge_metric_default;
					if (edge_metric && edge_metric != edge_metric_default){  toset = edge_metric }
					setEdgeMetric(toset);
				}
			}

        }


	); 
}



// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -------------- Picture-saving-related functions ----------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************


function saveCanvasAsPNG()
{
    // ---------------------------------------  
    // Save canvas to PNG
    // ---------------------------------------  

    // From http://stackoverflow.com/questions/39168928/graph_cytoscape-save-graph-as-image-by-button
        
    var b64key = 'base64,';
    var zoom_factor = graph_cytoscape.zoom();
    if (zoom_factor < 2) zoom_factor = 2;



	
	addKeynodesToGraph()

	
    addTitleToGraph();



    var b64 = graph_cytoscape.png({'bg': 'white', 'full': 'yes', 'scale': zoom_factor}).substring( graph_cytoscape.png().indexOf(b64key) + b64key.length );



    removeTitleFromGraph();

    var imgBlob = base64ToBlob( b64, 'image/png' );

    removeKeynodesFromGraph()

    // Uses 'saveAs' from:
    // https://github.com/eligrey/FileSaver.js/
    saveAs( imgBlob, 'liongraph.png' );
    
    return true;
}

function saveCanvasAsJPG()
{
    // ---------------------------------------  
    // Save canvas as JPG
    // ---------------------------------------  

    var b64key = 'base64,';
    var zoom_factor = graph_cytoscape.zoom();
    if (zoom_factor < 2) zoom_factor = 2;

	addKeynodesToGraph()
    addTitleToGraph();

    var b64 = graph_cytoscape.jpg({'bg': 'white', 'full': 'yes', 'scale': zoom_factor, 'quality': 1}).substring( graph_cytoscape.jpg().indexOf(b64key) + b64key.length );

    removeTitleFromGraph();

    var imgBlob = base64ToBlob( b64, 'image/jpg' );

    removeKeynodesFromGraph()
    // Uses 'saveAs' from:
    // https://github.com/eligrey/FileSaver.js/
    
    saveAs( imgBlob, 'liongraph.jpg' );
    
    return true;
}


function addKeynodesToGraph(){
    var bounding_box = graph_cytoscape.nodes().boundingBox();
	var counter = bounding_box.x1;

	var base_x = Math.max(((bounding_box.x2 - bounding_box.x1) - alltypes_code.length * 70)/2 + bounding_box.x1, bounding_box.x1)

	console.log('keynodes layout '+ bounding_box.x1 + ' ' + bounding_box.x2 + ' ' + base_x)

	_.forEach(alltypes_code, function(value ){  
		counter = counter + 35;
		node_to_add =
			{ group: "nodes", 'type':value, 'name':value,  data: { id: "keynodepic"+value, keynode: 1 , type: value, name: value}, 
			  position: { x: base_x +  counter, y: bounding_box.y2 + 200 } }
		graph_cytoscape.add( node_to_add);
		counter = counter + 35;
	})


}

function removeKeynodesFromGraph() {
	graph_cytoscape.remove("node[keynode=1]");
}


function addTitleToGraph()
{
    // ---------------------------------------  
    // Adds title node to graph
    // ---------------------------------------  

    var title   = "LION Literature-Based Discovery\nwww.lionproject.net\n\n" + "'A' node: " + getSource();
    var url     = addNewlinesToURL($('.cam-dtal-lion-share-url').val());

    if (getDestination() != "")
    {
        title += ", 'C' node: " + getDestination();
    }

    var bounding_box = graph_cytoscape.nodes().boundingBox();

    graph_cytoscape.add({"classes": "graph_title",  "position": {"x": ((bounding_box.x1 + bounding_box.x2) / 2), "y": (bounding_box.y1 - 100)}, "data": {"id": "graph_title", "name": title, "group": "nodes"}})
    graph_cytoscape.add({"classes": "graph_url",        "position": {"x": ((bounding_box.x1 + bounding_box.x2) / 2), "y": (bounding_box.y2 + 150)}, "data": {"id": "graph_url", "name": url, "group": "nodes"}})    
}

function removeTitleFromGraph()
{
    // ---------------------------------------  
    // Removes title node from graph
    // ---------------------------------------  

    graph_cytoscape.remove("node[id='graph_title']");
    graph_cytoscape.remove("node[id='graph_url']"); 
}

function addNewlinesToURL(url)
{
    // ---------------------------------------  
    // Add newlines to URL at regular places to ensure it wraps over several lines
    // ---------------------------------------  

    var url_elements    = url.split("&");
    var new_url         = '';

    for(var i = 0; i < url_elements.length; i++)
    {
        new_url += url_elements[i];

        if (i != (url_elements.length - 1))  new_url += "&";

        if (((i - 3) % 4 == 0) && (i > 0)) new_url += " ";      
    }

    return new_url;
}

function base64ToBlob(base64Data, contentType) 
{
    // ---------------------------------------  
    // Create blob from base64 string
    // ---------------------------------------  

    // From http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------- Timetravel-related functions ------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

function toggleYearPlay(e)
{
    // ---------------------------------------  
    // Toggles timetravel facility
    // ---------------------------------------  

    if ($('.cam-dtal-lion-filter-range-year-play').hasClass("play"))
    {
        $('.cam-dtal-lion-filter-range-year-play').removeClass("play");
        $('.cam-dtal-lion-filter-range-year-play').addClass("pause");

        showStatus("Moving through years...");

        setFilterYearEnd(getFilterYearStart());
        applyFilters();

        yearplay_timer = setInterval(function()
        {
            showStatus("Moving through years..." + getFilterYearEnd());

            if (getFilterYearEnd() != getYearEnd())
            {
                var nextYear = parseInt(getFilterYearEnd()) + 1;
                setFilterYearEnd(nextYear);
                applyFilters();
            }
            else
            {
                stopYearPlay();
            }

        }, 600);
    }
    else
    {
        stopYearPlay();
    }
}

function stopYearPlay()
{
    // ---------------------------------------  
    // Stop timetravel completely
    // ---------------------------------------  

    if (yearplay_timer === undefined) return;

    clearInterval(yearplay_timer);
    yearplay_timer = 0;

    $('.cam-dtal-lion-filter-range-year-play').removeClass("pause");
    $('.cam-dtal-lion-filter-range-year-play').addClass("play");

    clearStatus();
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -------------------- Dialog UI functions ------------------ 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************
    
function showAlert(title, message)
{
    // Show alert box

    $(".cam-dtal-lion-dialog-alert-title").html(title);
    $(".cam-dtal-lion-dialog-alert-message").html(message);
    $("#cam-dtal-lion-dialog-alert").modal('show');
}

function showExpandNodeByType(e)
{
    $('#cam-dtal-lion-dialog-node-expandbytype').attr('data-value', $(e.target).attr('data-content') )
    $("#cam-dtal-lion-dialog-node-expandbytype").modal('show');
}

function hideExpandNodeByType()
{
    $("#cam-dtal-lion-dialog-node-expandbytype").modal('hide');
}


function showInfo(title, message)
{
    // Show alert box

    $(".cam-dtal-lion-dialog-info-title").html(title);
    $(".cam-dtal-lion-dialog-info-message").html(message);
    $("#cam-dtal-lion-dialog-info").modal('show');
}
   

function showAJAXFail()
{
	showInfo('Request failed','There was a problem retrieving your request from the server. Reload the page to try again!');
}


function submitFeedbackForm() 
{
    //get the form fields, create AJAX request, reset fields if success, so success message, and timeout after a few minutes
    var formdata = $("#feedback-form").serializeArray();
    var serialised_form = {};
    $(formdata ).each(function(index, obj){
            serialised_form[obj.name] = obj.value;
    });

    console.log(serialised_form)
    console.log(Object.values(serialised_form))
    if (_.filter(Object.values(serialised_form),function(o){return o.length > 0}).length != 3){
            $('#cam-dtal-lion-dialog-feedback-success').hide();
            $('#cam-dtal-lion-dialog-feedback-failure').show();
            setTimeout(function(){ $('#cam-dtal-lion-dialog-feedback-failure').hide();  }, 2000);
            return;
    }



    $.ajax(
    {
        url: '/feedback/',
        dataType: "json",                        
        type: "POST",
        data: serialised_form,                       
        success: function () 
        {
            $('#feedbackformname').val("");
            $('#feedbackformemail').val("");
            $('#feedbackformfeedback').val("");

            $('#cam-dtal-lion-dialog-feedback-failure').hide();
            $('#cam-dtal-lion-dialog-feedback-success').show();
            setTimeout(function(){ $('#cam-dtal-lion-dialog-feedback-success').hide(); hideDialogs(); }, 3000);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) 
        {
            console.log(JSON.stringify(XMLHttpRequest));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }           
    });                                                                 
}



function showFeedback()
{
    $('.cam-dtal-lion-dialog-feedback-ok').unbind('click');
    $('.cam-dtal-lion-dialog-feedback-ok').bind('click', function(e) {submitFeedbackForm();}); 
    $('.cam-dtal-lion-dialog-feedback-cancel').unbind('click');
    $('.cam-dtal-lion-dialog-feedback-cancel').bind('click', function(e) {hideDialogs();});                                    
    $('#cam-dtal-lion-dialog-feedback').modal('show');
    
    return false;
}


function showConfirm(title, message, fn_confirm, fn_cancel)
{
    // Show confirmation dialog
    
    if (fn_cancel == null) fn_cancel = function(){return hideDialogs();};
    
    $('.cam-dtal-lion-dialog-confirm-title').html(title);
    $('.cam-dtal-lion-dialog-confirm-message').html(message);
    $('.cam-dtal-lion-dialog-confirm-ok').unbind('click');
    $('.cam-dtal-lion-dialog-confirm-ok').bind('click', function(e) {hideDialogs(); return fn_confirm(e);}); 
    $('.cam-dtal-lion-dialog-confirm-cancel').unbind('click');
    $('.cam-dtal-lion-dialog-confirm-cancel').bind('click', function(e) {return fn_cancel(e);});                                    
    $('#cam-dtal-lion-dialog-confirm').modal('show');
    
    return false;
}

function showConfirmIfData(title, message, fn_confirm, fn_cancel)
{
    if (data_loaded)
    {
        return showConfirm(title, message, fn_confirm, fn_cancel);      
    }
    else
    {
        // We have to use timeout to allow original function call
        // to finish independently, so that field values can be updated

        setTimeout(function()
        {
            fn_confirm();
        }, 50)

        return false;
    }
}

function showPane(sPaneName)
{   
    // ---------------------------------------  
    // Show particular pane and update related elements
    // ---------------------------------------      

    $(".cam-dtal-lion-dialog-error-message").hide();        
    $(".cam-dtal-lion-dialog-error-message").empty();

    switch (sPaneName)
    {
        case "bug-report":

            // Reset form
                
            $('.cam-dtal-lion-form-bug-element input').val("");
            $('.cam-dtal-lion-form-bug-element textarea').val("");
            $('.cam-dtal-lion-form-bug-element').removeClass('error');
            $("#cam-dtal-lion-dialog-bug-report").modal('show');

            break;

        case "weight-range":

            $('.cam-dtal-lion-weight-start').val(getWeightStart() != null ? getWeightStart() : getWeightMin());
            $('.cam-dtal-lion-weight-end').val(getWeightEnd() != null ? getWeightEnd() : getWeightMax());

        case "bug-tools":
        
            $("#cam-dtal-lion-dialog-" + sPaneName).modal('show');
        
            return false;
            
            break;              
    }
    
    $('#cam-dtal-lion-home').hide();
    $('#cam-dtal-lion-nonhome').show();
    
    // Hide everything first
    
    $('.cam-dtal-lion-pane').hide();
    
    // Selectively reveal pane and its corresponding tab
    
    $('#cam-dtal-lion-' + sPaneName).show();
    $('#cam-dtal-lion-step-' + sPaneName).removeClass("disabled");
    $('#cam-dtal-lion-step-' + sPaneName).addClass('active');
        
    return false;
}   

function hideDialogs()
{
    // Hide all dialogs
    
    $('.modal.cam-dtal-lion-modal').modal('hide');
    
    return false;
}


// ***********************************************************
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ---------------- General utility functions ---------------- 
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// ***********************************************************

// -----------------------------------------------------------
// ----------------- Array-related functions -----------------
// -----------------------------------------------------------

function sameElements(array1, array2)
{
    // ---------------------------------------  
    // Checks whether two arrays have same elements
    // ---------------------------------------  

    var arrays_intersection = intersect(array1, array2);

    if ((array1.length == array2.length) && (arrays_intersection.length == array1.length)) return true

    return false;
}

function intersect(a, b) 
{
    // ---------------------------------------  
    // Gets intersection of two arrays
    // ---------------------------------------  
    
    // From https://stackoverflow.com/questions/16227197/compute-intersection-of-two-arrays-in-javascript

    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}

function utilityFill(parameter_array, parameter_value)
{
    // Utility function to fill array with specific value
    
    for(var i = 0; i < parameter_array.length; i++) parameter_array[i] = parameter_value;
    
    return parameter_array;
}

// -----------------------------------------------------------
// ------------------- Number-related functions --------------
// -----------------------------------------------------------

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


function convertDecimal(decimal_value)
{
    // ---------------------------------------  
    // Convert float to decimal value of certain number of decimal places
    // ---------------------------------------  

    return Math.round(decimal_value * 1000) / 1000;
}

// -----------------------------------------------------------
// ------------------- Text-related functions ----------------
// -----------------------------------------------------------

String.prototype.trunc = String.prototype.trunc || function(n, single_word)
{
    // ---------------------------------------  
    // Truncate string
    // ---------------------------------------  

    var first_word = this;
    
    if (this.indexOf(" ") != -1)
    {
        first_word = this.substr(0, this.indexOf(" "));     
    }
    
    if (single_word != 0)
    {
        if (first_word.length > single_word) return first_word.substr(0, single_word -1) + '...'
    }
    
    return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};

function getFirstSentence(document_text)
{
    // ---------------------------------------  
    // Gets first sentence of block of text
    // ---------------------------------------  
    
    var title_text = document_text;
    var period_position = title_text.indexOf(".");
    
    if (period_position != -1) title_text = title_text.substring(0, period_position);
    
    return title_text;
}

function formatArticle(article_text, nodes_list)
{
    // ---------------------------------------  
    // Formats article in readable format for HTML
    // ---------------------------------------  
    
    article_text = article_text.replace(/[\n\r]/g, '<br/><br/>');
    
    return article_text;
}

// -----------------------------------------------------------
// --------------- Performance timer functions ---------------
// -----------------------------------------------------------

function performanceStart(performance_name)
{
    // ---------------------------------------  
    // Initiate performance timer
    // ---------------------------------------  

    performance_timer_start     = performance.now();
    performance_timer_name      = performance_name;
}

function performanceStop()
{
    // ---------------------------------------  
    // Finish performance timer and output value
    // ---------------------------------------  

    console.log("Performance:", performance_timer_name, (performance.now() - performance_timer_start) + " milliseconds.");
}

// -----------------------------------------------------------
// --------------- OID-related generic functions -------------
// -----------------------------------------------------------

function cleanOIDForCSS(OID)
{
    // ---------------------------------------  
    // Format OID for use within CSS
    // ---------------------------------------  
    
    return OID.replace(/[^0-9a-z]/gi, '--');
}

function getCuriePrefixLower(oid)
{
    // ---------------------------------------  
    // Gets CURIE prefix, eg. CHEBI in CHEBI:164
    // Makes it lowercase for standardisation
    // ---------------------------------------  

    var oid_elements = oid.split(':');

    return oid_elements[0].toLowerCase();
}

function isHallmark(oid)
{
    // ---------------------------------------  
    // Determines whether oid is a 'Hallmark'
    // ---------------------------------------  

    if (oid == undefined) return false;

    var curie_prefix = getCuriePrefixLower(oid);

    if (curie_prefix == "hoc")  return true;
    else                        return false;
}

function transformCURIE(curie_prefix)
{
    // ---------------------------------------  
    // Transform CURIE prefix into standardised form
    // ---------------------------------------  

    curie_transform_position = curie_prefix_old.indexOf(curie_prefix);

    if (curie_transform_position == -1)     return curie_prefix;
    else                                    return curie_prefix_new[curie_transform_position];
}

function generateURLFromOID(node_oid)
{       
    // ---------------------------------------  
    // Generate URL for entity (where possible)
    // ---------------------------------------  

    var external_url        = "";   
    var oid_elements        = node_oid.split(":");  

    // Standardise CURIE prefix

    oid_elements[0] = transformCURIE(oid_elements[0]);

    var external_obo_url = external_obo_context_data['@context'][oid_elements[0]];

    if (external_obo_url !== undefined)
    {
        external_url = external_obo_url;

        if (external_obo_url[external_obo_url.length - 1] != "_") external_url += '/';

        external_url += oid_elements[1];
    }
    
    return external_url;
}   

// -----------------------------------------------------------
// ----------------- Category-related functions --------------
// -----------------------------------------------------------

function getColourFromCategory(colour)
{
    // ---------------------------------------  
    // Convert category name to hex colour
    // ---------------------------------------  

	//TEJAS: switched in Mutation for DNAMutation, ProteinMutation and SNP
    switch (colour)
    {
        case "Chemical":        return "#8fcfff";
        case "Disease":         return "#ee5a5a";
		case "Mutation":        return "#ffa500";
        //case "DNAMutation":     return "#ffa500";
        case "Gene":            return "#7fa2ff";
        case "Hallmark":        return "#9b7aff";
        //case "ProteinMutation": return "#008080";
        //case "SNP":             return "#00ffff";
        case "Species":         return "#f5f5dc";
    }       
}

// -----------------------------------------------------------
// ------------- Pubmed-related generic functions ------------
// -----------------------------------------------------------

function getPubmedURL(document_id)
{
    // ---------------------------------------  
    // Get Pubmed URL from document id
    // ---------------------------------------  

    var regexp          = /PMID:([0-9]+)/i;
    var matches_array   = document_id.match(regexp);

    if (matches_array === null) return null;

    return "https://www.ncbi.nlm.nih.gov/pubmed/" + matches_array[1];
}

// -----------------------------------------------------------
// ---------------------- Error logging ---------------------- 
// -----------------------------------------------------------

function logErrorOnServer(details, extras) 
{   
    // ---------------------------------------  
    // Send bug report to server
    // ---------------------------------------
        
    details = details.replace(/\n/g, " ");

    $.ajax(
    {
        url: '/client-error/',
        dataType: "json",                        
        type: "POST",
        data: {'userid': unique_id, 'context': navigator.userAgent, 'details': details, 'extras': JSON.stringify(extras)},                       
        success: function (msg) 
        {
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) 
        {
            console.log(JSON.stringify(XMLHttpRequest));
            console.log(JSON.stringify(textStatus));
            console.log(JSON.stringify(errorThrown));
        }           
    });                                                                 
}

function loadBugTools()
{
    // ---------------------------------------  
    // Load bug tools
    // ---------------------------------------  
    
    var call_stack_text = JSON.stringify(callstack_recording, null, 2);
    
    $('#cam-dtal-lion-call-stack').val(call_stack_text);
    
    showPane("bug-tools");
    
    return false;
}

function reportBug()
{
    // ---------------------------------------  
    // Submit bug report created using bug report form
    // ---------------------------------------

    // Check that mandatory fields are set
        
    var bFormErrors = false;
    
    $('.cam-dtal-lion-bug-name').removeClass('error');
    $('.cam-dtal-lion-form-bug-element').removeClass('error');
            
    if ($('#cam-dtal-lion-bug-name').val().trim() == "")
    {
        $('.cam-dtal-lion-bug-name').addClass('error');         
        bFormErrors = true;         
    }

    if ($('#cam-dtal-lion-bug-email').val().trim() == "")
    {
        $('.cam-dtal-lion-bug-email').addClass('error');            
        bFormErrors = true;         
    }

    if ($('#cam-dtal-lion-bug-text').val().trim() == "")
    {
        $('.cam-dtal-lion-bug-text').addClass('error');         
        bFormErrors = true;                     
    }

    if (bFormErrors)
    {
        $('.cam-dtal-lion-form-bug').addClass('error');
        return;
    }
    
    $('#cam-dtal-lion-dialog-bug-report').modal('hide');

    showMajorProcessingActivity();
    
    setTimeout(function()
    {
        var sBugReport  = $('#cam-dtal-lion-bug-name').val() + ';' + $('#cam-dtal-lion-bug-email').val() + ';' + $('#cam-dtal-lion-bug-text').val();
        
        $('.cam-dtal-lion-bug-text').val();
        
        var aObjVariables = {   
                                'url':                      window.location.href,
                                'nodes_index':              nodes_index,
                                'nodes_data':               nodes_data,
                                'edges_index':              edges_index,
                                'edges_data':               edges_data
                            };
                                                                    
        logErrorOnServer(sBugReport, JSON.stringify({'Variables': JSON.stringify(aObjVariables)}));

        hideProcessingActivity();
    }, 1000);
    
}
