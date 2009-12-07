/** 
 * A sample plugin to capture jsHub events and send them to a server via a 
 * HTTP POST form request.
 * 
 * Form POST requests are an alternative to the more traditional single pixel
 * image request. POST is not subject to the 2k data limit imposed by the 
 * browser on a GET request. It is also not subject to the strict same origin
 * policy imposed on XmlHttpRequest (AJAX) requests.
 * 
 * You can use this as a starting point to customize the data to generate 
 * data in the format expected by your server.
 *
 * @module data-transport
 * @class sample-post-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /**
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Sample HTTP POST transport plugin',
    version: 0.1,
    author: "Fiann O'Hagan",
    email: 'fiann.ohagan@jshub.org',
    vendor: 'jsHub'
  },  
  
  /**
   * The events that will be captured and sent to the receiving servers
   */
  boundEvents = ['page-view', 'authentication', 'checkout'],  
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method transport
   * @param event {Object} the event to serialize and send to the server
   * @property metadata
   */
  send = function(event) {
  
    jsHub.logger.group("Sample POST output: sending '%s' event", event.type);
    
    /**
     * Account ID for the client
     * Note that the field <code>account_id</code> in the string is replaced
     * when the tag is generated.
     */
    var account = "<%= account_id %>";
    
    /**
     * URL to dispatch to the server
     * Note that the field <code>server_url</code> in the string is replaced
     * when the tag is generated.
     */
    var url = "<%= server_url %>";

    /**
     * Append account ID if supplied
     */
    if(account !== ""){
      url += url.substring(url.length-1, url.length) == "/" ? "" : "/";
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
      sender: metadata.name + " v" + metadata.version
    };
    
	// Copy all readable data into the output data
	for (field in event.data) {
      if ("string" === typeof event.data[field] || "number" === typeof event.data[field]) {
	  	data[field] = event.data[field];
      }
    }
	
    // dispatch via API function
    jsHub.dispatchViaForm("POST", url, data);
    jsHub.logger.groupEnd();
  };
  
  /*
   * Bind the plugin to the Hub so as to run when events we are interested in occur
   */
  for (i = 0; i < boundEvents.length; i++) {
    jsHub.bind(boundEvents[i], metadata.id, send);
  }
  
  // lifecycle notification
  jsHub.trigger("plugin-initialization-complete", metadata);
})();
