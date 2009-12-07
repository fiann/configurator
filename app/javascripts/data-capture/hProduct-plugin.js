/** 
 * A plugin to parse the hProduct syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hProduct-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hProduct Microformat Parser Plugin',
	id: 'hProduct-plugin',
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
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hproduct-parse-start
   * @event  hproduct-data-found
   * @event  hproduct-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hproduct-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data;
    
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
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hProduct nodes from HTML DOM (not source code), excluding nested hProducts
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed to look for elements with a 'hproduct' css class
     */
    sources = $('.hproduct', context);
	sources = sources.not(sources.find('.hproduct'));
    //console.debug("Found %s .hproduct islands in context %s", sources.length, context);
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      products : []
	};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    // TODO support currency design pattern
    var properties = ["n", "price", "quantity"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hProduct
       */
      var hproduct = {};
	  var root = $(elm);
      
      /*
       * get the property data from class names
       */
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hproduct'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hproduct[name] = value;
        }
      });
      
      jsHub.trigger("hproduct-data-found", {
        count: idx + 1,
        element: elm,
        data: hproduct
      });
      
      // issue an product view event to be logged
      jsHub.trigger("product-view", hproduct);
      
      /*
       * Append this hProduct object into the data to return
       */
      data.products.push(hproduct);
    });
    
    jsHub.trigger("hproduct-parse-complete", data);
    
    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, parse);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
