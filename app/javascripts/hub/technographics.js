/** 
 * A plugin to create an analytics object from technographic data 
 *
 * @module data-capture
 * @class technographics
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
/*jslint strict: true */
"use strict";
 
 
(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Technographics Plugin',
    id: 'technographic',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  var searchEngineList = {
    "about.com" : "terms", // About
    "alice.com" : "qs", // Alice
    "alltheweb.com" : "q", // Alltheweb
    "altavista.com" : "q", // Altavista
    "aol\\.[^\\/]+" : ["encquery",  "q", "query"], // AOL
    "ask.com" : "q", // Ask
    "bing.com" : "q", // Bing
    "cnn.com" : "query", // CNN
    "google\\.[^\\/]+" :	"q", // Google
    "lycos.com" : "query", // Lycos
    "mamma.com" : "query", // Mamma
    "msn.com" : "q", // MSN
    "netscape.com" : "query", // Netscape
    "online.onetcenter.org" :	"qt", // O*NET
    "search.com" : "q", // Search
    "terra.com" : "query", // Terra
    "yahoo.com" : "p" // Yahoo
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
  metadata.eventHandler = function capture(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("technographic-parse-start", event);

    // extract hPage from html dom
    var document = window.document, data = event.data, found = {};
    
    /*
     * collect technographic environment data, e.g. screen size, browser plugins, 
     * js version etc
     */ 
    
    // Page URL is the default for hPage.url
    // Force a cast to string as document.location.href is not a string when
    // returned by env.js / rhino
    found.url = document.location.href;
    if (!data.url) {
      data.url = found.url;
    }
    
    // Page title is the default for hPage.title
    found.title = document.title;
    if (!data.title) {
      data['page-title'] = found.title;
    }
    
    // Document referrer is the default for hPage.referrer
    found.referrer = document.referrer;
    if (!data['page-referrer']) {
      data['page-referrer'] = found.referrer;
    }
    
    // Look for search engine in referrer URL
    if (data['page-referrer']) {
      var referrer = data['page-referrer'];
      var testReferrer = function (param, host) {
        var hnRegexp = new RegExp("^http(s)?:\\/\\/(www\\.)?((.+\\.)?" + host + ")\\/"),
          qsRegexp = new RegExp("\\?(.+[&;])?" + param + "=([^&;]+)([&;].*)?$");
        if (hnRegexp.test(referrer) && qsRegexp.test(referrer)) {
          jsHub.trigger("nat-search-ref", {
            "search-keyword" : decodeURIComponent(referrer.match(qsRegexp)[2].replace("+", " ")),
            "external-referrer" : referrer,
            "search-engine" : referrer.match(hnRegexp)[3]
          });
        }
      };
      jsHub.util.each(searchEngineList, function (param, host) {
        if (typeof param === "string") {
          testReferrer(param, host);
        } else {
          jsHub.util.each(param, function (p) {
            testReferrer(p, host);
          });
        }
      });
    }
    
    // and send to output plugins
    jsHub.trigger("technographic-parse-complete", found);

    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata);

  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
