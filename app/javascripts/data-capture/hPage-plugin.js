/** 
 * A plugin to parse the hPage syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hPage-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPage Microformat Parser Plugin',
    id: 'hPage-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method hPage-plugin-capture
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "data.context" property
   * @property metadata
   * @property propertyNames
   * @event  hpage-parse-start
   * @event  hpage-data-found
   * @event  hpage-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpage-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, hPage, properties;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = jsHub.safe('$');
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hPage data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hPage from HTML DOM (not source code), excluding nested hPages
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hpage' css class on the body element
     */
    sources = $('.hpage', context);
    sources = sources.not(sources.find('.hpage'));
    
    /*
     * The parser will populate an object to represent all the hPage data found in 
     * the context, according to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    hPage = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    properties = ["version", "name", "title", "referrer", "type", "lifetime", "fragment"];
    
    
    sources.each(function(idx, elm) {
    
      /*
       * Object for this hpage
       */
      var nodeData = {};
      
      // TODO resolve includes first
      
      // jQuery gives an empty string if the element / attribute is not present so cascade through values
	  // to defaults
      var root = $(elm);
      
      /*
       * get the property data with failover to inherited or technographic data supplied by another plugin
       */
      // use the array of class names
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested hPages
        node = root.find(classname);
        node = node.not(node.find('.hpage'));
        value = node.getMicroformatPropertyValue(true);
        if (value !== null) {
          nodeData[name] = value;
          nodeData[name + "-source"] = metadata.id;
        }
      });

      /*
       * Merge the data for the singular fields from this hPage node, into the hPage for 
       * the whole context
       */
      // TODO: use data-indexes to override source order 
      $.extend(true, hPage, nodeData);
      
      // custom string handling for some properties, e.g. multi value properties
      var categories = [], categoryNodes = $('.category', elm);
      categoryNodes = categoryNodes.not(categoryNodes.find('.hpage .category'));
      categories = categoryNodes.excerptMultipleValues();
      if (categories !== null) {
        nodeData.category = categories;
        nodeData['category-source'] = metadata.id;
        // the categories for the overall hPage are the union of what was found previously
        // and in this node. NB $.unique uses identity not value so it doesn't strip duplicate strings
		hPage.category = (hPage.category || []);
		$.each(categories, function (idx, entry) {
          if ($(hPage.category).index(entry) === -1) {
		  	hPage.category.push(entry);
		  }
		});
      }
	  
	  // attributes use value class pattern http://microformats.org/wiki/value-class-pattern
	  // we can have multiple attributes, each one has a type and a value
	  // output in the data is an array: [ {name:value}, {name:value} ]
	  var attributes = $('.attribute', elm);
	  nodeData.attributes = [];
	  attributes.each(function () {
        var attribute = $(this).excerptValueClassData();
        if (attribute !== null) {
          nodeData.attributes.push(attribute);
          // the attributes for the overall hPage are the union of what was found previously
          // and in this node. 
          hPage.attributes = (hPage.attributes || []);
          for (var found = false, i = 0; i < hPage.attributes.length; i++) {
            if (hPage.attributes[i].type == attribute.type && hPage.attributes[i].value == attribute.value) {
              found = true;
              break;
            }
          }
          if (!found) {
            hPage.attributes.push(attribute);
          }
        }
      });
      
      jsHub.trigger("hpage-node-found", {
        count: idx + 1,
        element: elm,
        data: nodeData
      });
      
    });
    
	/*
	 * The hPage for the context is only valid if the required fields are all present.
	 * If not, don't put any of the data into the page view event.
	 */
	if (hPage.name) {
      jsHub.trigger("hpage-found", {
        context: context,
        hpage: hPage
      });
    } else {
	  hPage = null;
	}
	
    // Fire a debug event
    jsHub.trigger("hpage-parse-complete");
    return hPage;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, parse);
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add data to
   * page view events when AJAX loads a new partial page view
   */
  jsHub.bind("content-updated", metadata.id, parse);
  
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
