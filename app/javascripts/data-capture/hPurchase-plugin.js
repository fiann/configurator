/** 
 * A plugin to parse the hPurchase syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hPurchase-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPurchase Microformat Parser Plugin',
	id: 'hPurchase-plugin',
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
   * @event  hpurchase-parse-start
   * @event  hpurchase-data-found
   * @event  hpurchase-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpurchase-parse-start", event);
    
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
    sources = $('.hpurchase', context);
    sources = sources.not(sources.find('.hpurchase'));
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["product-id", "cart-id", "cart-price", "discount", "shipping-price", "taxes", "net-price", "payment-method", "status"];
    
    
    sources.each(function(idx, elm) {
    
      /*
       * Object for this hPurchase
       */
      var hpurchase = {};
      var root = $(elm);
      
      /*
       * get the property data and its visibility
       */
      // use the array of class names 
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var value, visibility, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hpurchase'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hpurchase[name] = value;
        }
      });
      
      jsHub.trigger("hpurchase-data-found", {
        count: idx + 1,
        element: elm,
        hpurchase: hpurchase
      });
      
      // issue an checkout event to be logged  
      jsHub.trigger("checkout", hpurchase);
      
    });
    
    jsHub.trigger("hpurchase-parse-complete", data);
    
    /*
     * Don't merge the data, the purchase is a separate event from the page view
     * the triggered the parsing.
     */
    return;
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
