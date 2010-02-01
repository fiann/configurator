/** 
 * A sample plugin to capture jsHub events and send them to a server via a 
 * single pixel gif image.
 * 
 * You can use this as a starting point to customize the data to generate a
 * URL in the format expected by your server.
 *
 * @module data-transport
 * @class sample-get-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
"use strict";

(function (Y) {

  /**
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
  	id: 'sample-get-plugin',
    name: 'Sample HTTP GET transport plugin',
    version: 0.1,
    vendor: 'jsHub.org'
  },  
  
  /**
   * The events that will be captured and sent to the server
   */
  boundEvents = ['page-view', 'authentication', 'checkout'],  
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method send
   * @param event {Object} the event to serialize and send to the server
   * @property metadata
   */
  send = function (event) {
  
    
    /**
     * Account ID for the client
     * Note that the field <code>account_id</code> in the string is replaced
     * when the tag is generated.
     */
    var account = "1234";
    
    /**
     * URL to dispatch to the server
     * Note that the field <code>server_url</code> in the string is replaced
     * when the tag is generated.
     */
    var url = "test.causata.com";

    /**
     * Append account ID if supplied
     */
    if (account !== "") {
      url += url.substring(url.length - 1, url.length) === "/" ? "" : "/";
      url += "account/" + account;
    }
    
	/**
	 * Each field in this object is serialized as a name=value pair in the query
	 * string of the URL that is created for the image request.
	 * You can put any data in this object. If the value of a field is an array,
	 * then it will be used to generate multiple name=value pairs in the resulting
	 * query string.
	 */
    var data = {
      sender: metadata.name + " v" + metadata.version,
      pagename: event.data.name || event.data.url || "not defined"
    };

    var protocol = (("https:" === jsHub.safe('document').location.protocol) ? "https://" : "http://");

    // dispatch via API function
    jsHub.dispatchViaImage(protocol + url, data);
  };
  
  /*
   * Bind the plugin to the Hub so as to run when events we are interested in occur
   */
  jsHub.bind("page-view", metadata.id, send);
  
  // lifecycle notification
  jsHub.trigger("plugin-initialization-complete", metadata);

})();
