/** 
 * A plugin to create an analytics object from technographic data 
 *
 * @module data-capture
 * @class technographic-plugin
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
"use strict";
 
 
(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Technographic Plugin',
    id: 'technographic-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Capture technographic data, when triggered by the 'page-view' event
   * @method capture
   * @param event {Object} Config object for the plugin, containing data found by other plugins, and
   * the context (DOM node) to start parsing from.
   * @property metadata
   * @event technographic.StartParsing
   * @event hub.technographicEvent
   * @event technographic.CompleteParsing
   */
  var capture = function capture(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("technographic-parse-start", event);

    // extract hPage from html dom
    var $ = jsHub.safe('$'), document = jsHub.safe('document'), data = event.data, found = {};
    
    /*
     * collect technographic environment data, e.g. screen size, browser plugins, 
     * js version etc
     */ 
	
	// Page URL is the default for hPage.url
	// Force a cast to string as document.location.href is not a string when
	// returned by env.js / rhino
    found.url = document.location.href;
	if (! data.url) {
		data.url = found.url;
		data['url-source'] = "window.location";
	}
	
	// Page title is the default for hPage.title
    found.title = document.title;
	if (! data.title) {
		data.title = found.title;
		data['title-source'] = "document.title";
	}
	
	// Document referrer is the default for hPage.referrer
    found.referrer = document.referrer;
	if (! data.referrer) {
		data.referrer = found.referrer;
		data['referrer-source'] = "document.referrer";
	}
	
    // and send to output plugins
    jsHub.trigger("technographic-parse-complete", data);
	
	return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, capture);

  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
