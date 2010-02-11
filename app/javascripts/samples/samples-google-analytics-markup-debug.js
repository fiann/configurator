/** 
 * A plugin to capture markup data from Google Analytics markup on the page.
 *
 * @module data-capture
 * @class google-analytics-markup-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub, jQuery */
/*jslint nomen: false */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Google Analytics Markup Plugin',
    id: 'google-analytics-markup',
    version: '0.1 experimental',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view' event
   * @method capture
   * @param event {Object}    Event object with current data for the page view.
   * @property metadata
   * @event google-analytics-parse-start
   * @event google-analytics-parse-complete
   */
  var capture = function (event) {
  
    // All local vars set here so nothing is accidentally made global.
    var context, pagenames, data, previous;
    
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    // initially empty
    pagenames = [];
    
    // data we find here goes back into the event.data field
    data = event.data || {};
    
    // we need to know if there is already a value defined
    previous = {
      "value": data['page-name'],
      "source": data['page-name-source']
    };
    
    // extract GA <script> block from html dom
    jsHub.trigger("google-analytics-parse-start");
  
    // if there is a GA script node, then look for the page name being sent from it
    $('script', context).each(function () {
      var source = this.innerHTML, matches, pagename;
      if (typeof source === 'string') {
        matches = source.match(/pageTracker\._trackPageview\((.*)\);/);
        if (matches) {
          if (matches[1].match(/^\s*$/)) {
            // _trackPageview() without args records the page url
            pagename = jsHub.safe('document').location.pathname;
            data['page-name-source'] = 'location.pathname';
          } else {
            // otherwise it has been explicitly specified
            pagename = matches[1].replace(/^\s+/, '').replace(/\s+$/, '');
            pagename = pagename.match(/^(['"]|&quot;?)(.+)(\1)$/)[2];
            data['page-name-source'] = metadata.id;
          }
          pagenames.push(pagename);
          // last value specified wins as the output
          data['page-name'] = pagename;
        }
      }
    });

    // we want to raise a warning if we have found more than page name
    // it is also a warning if the field has been previously set to a different value
    // by another parsing plugin
    if ((pagenames.length > 1) || (pagenames.length > 0 && previous.value)) {
      jsHub.trigger("duplicate-value-warning", {
        "source": metadata.name,
        "fields": {
          "name": {
            "previous": previous,
            "found": pagenames.join(", ")
          }
        }
      });
      data.warnings = data.warnings || {};
      data.warnings[metadata.id] = pagenames.join(", ");
      if (previous.source) {
        data.warnings[previous.source] = data.warnings[previous.value];
      }
    }
    
    jsHub.trigger("google-analytics-parse-complete", pagenames);
    
    return data;
  };
  
  ////////// Inline events //////////////
  
  /**
   * Create a proxy that intercepts calls to the pageTracker._trackPageview() function.
   * The proxy creates a jsHub event, and then passes on the message to the underlying
   * GA tracker.
   * Bound to the data-capture-start event.
   * @method initializeInlineTracking
   * @event google-analytics-initialize-tracking
   */
  var initializeInlineTracking = function initializeInlineTracking() {
    jsHub.trigger("google-analytics-initialize-tracking", {
      _gat: window._gat
    });
    if (window._gat) {
      var createProxyTracker = function (realPageTracker) {
        var field, proxy = {};
        for (field in realPageTracker) {
          if (field) { // we really do want everything, but jslint enforces this 
            proxy[field] = realPageTracker[field];
          }
        }
        
        // Intercept the call to the GA tag, record it, then pass it on
        proxy._trackPageview = function (pagename) {
          var data = {
            "context": "#do-not-drill-down-on-this-event",
            "page-name": pagename
          };
          jsHub.trigger("page-view", data);
          realPageTracker._trackPageview(pagename);
        };
        
        return proxy;
      };
      
      // make sure the proxy tracker is in the page
      if (window.pageTracker) {
        window.pageTracker = createProxyTracker(window.pageTracker);
      }
      
      var field, realGAT = window._gat, proxyGAT = {};
      for (field in realGAT) {
        if (field) { // we really do want everything, but jslint enforces this 
          proxyGAT[field] = realGAT[field];
        }
      }
      proxyGAT._getTracker = function (acct) {
        var realTracker = realGAT._getTracker(acct);
        return createProxyTracker(realTracker);
      };
    }
  };
  
  /**
   * Route the event to the correct handler
   */
  metadata.eventHandler = function (event) {
    if (event.type === "page-view") {
      return capture(event);
    } else if (event.type === "data-capture-start") {
      initializeInlineTracking();
    }
  };
  
  // Register the code to run when a page-view event is fired
  jsHub.bind("page-view", metadata);
  jsHub.bind("data-capture-start", metadata);
})(jQuery);