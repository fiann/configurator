/** 
 * A plugin to parse the hAuthentication syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hAuthentication-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hAuthentication Microformat Parser Plugin',
    id: 'hAuthentication-plugin',
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
   * @event  hauthentication-parse-start
   * @event  hauthentication-data-found
   * @event  hauthentication-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hauthentication-parse-start", event);
    
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
     * Extract the hAuthentication from HTML DOM (not source code), excluding nested hAuthentications
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hauthentication' css class on the body element
     */
    sources = $('.hauthentication', context);
	sources = sources.not(sources.find('.hauthentication'));
	console.debug("Found %s .hauthentication islands in context %s", sources.length, context);
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      authentication: []
    };
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["user-id", "auth-method"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hAuthentication
       */
      var hauthentication = {};
	  var root = $(elm);
      
      /*
       * get the property data using class names
       */
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hauthentication'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hauthentication[name] = value;
        }
      });
            
      jsHub.trigger("hauthentication-data-found", {
        count: idx + 1,
        element: elm,
        data: hauthentication
      });

      // issue an authentication event to be logged
      jsHub.trigger("authentication", hauthentication);
      
	  // append this event to the summary
	  data.authentication.push(hauthentication);
    });
    
    jsHub.trigger("hauthentication-parse-complete", data);
    
    // don't merge into source event, authentication data is not part of the
	// page view event, just triggered by it
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", "hAuthentication-plugin", parse);
  jsHub.bind("content-updated", "hAuthentication-plugin", parse);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
