/** 
 * A plugin to deploy the Google Analytics script tag into the page.
 *
 * @module data-capture
 * @class google-analytics-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
/*jslint nomen: false */
"use strict";

(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Google Analytics Plugin',
    id: 'google-analytics',
    version: '0.1',
    vendor: 'jsHub.org',
    type: 'data-transport'
  },
  
  /** URL of the google analytics js file */
  scriptURL = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') 
    + '.google-analytics.com/ga.js',
  
  /**
   * The config object for this plugin
   */
  config = {
    account : null
  },
  
  /**
   * Google analytics instance
   */
  pageTracker = null;
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view' event
   * @method capture
   * @param event {Object}    Event object with current data for the page view.
   * @property metadata
   */
  metadata.eventHandler = function (event) {
    
    var url, eventName = event.type;
    
    if (eventName === "page-view") {
      // if it's not defined for some reason, GA will default to url anyway,
      // so it doesn't matter if it's blank
      url = event.data['page-name'];
      if (url && url.indexOf('?') === -1) {
        url = url + document.location.search;
      }
    } else if (eventName === "site-exit") {
      url = "/outbound/" + url.replace(/^https?:\/\//, "");
    } else if (eventName === "download") {
      url = event.data.url;
    }
    
    // can't work unless account name is defined
    var account = config.account;
    if (account === null) {
      metadata.error = "account";
      jsHub.trigger("plugin-initialization-error", metadata);
      return;
    }
    
    if (pageTracker === null) {
      jsHub.util.loadScript(scriptURL, function () {
        pageTracker = this._gat._getTracker(account);
        pageTracker._trackPageview(url);
      });
    } else {
      pageTracker._trackPageview(url);
    }
  
    // do not have anything to add to the page view event
    return null;
  };
  
  /**
   * Receive a configuration update
   */
  metadata.configure = function (key, value) {
    config[key] = "" + value;
  };
  
  // Register the code to run when a page-view event is fired
  if (jsHub.util && jsHub.util.loadScript) {
    jsHub.bind("page-view", metadata);
    jsHub.bind("download", metadata);
    jsHub.bind("site-exit", metadata);
  } else {
    metadata.error = "loadScript";
    jsHub.trigger("plugin-initialization-error", metadata);
  }
  
}());
