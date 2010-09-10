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
    name: 'Link tracker plugin',
    id: 'link-tracker',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'data-capture'
  },
  
  // shortcut references
  window = this, document = window.document,
  
  // strings that are reused
  click = "click",
  
  // Configurable fields for this plugin
  // the default values are set below using calls to configure()
  trackDownloadLinks = false,
  downloadLinkRegexp = null,
  trackExternalLinks = false,
  internalDomainNameRegexp = null;
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Receive a configuration update
   */
  metadata.configure = function (key, value) {
    if (key === "downloadLinkTypes") {
      if (value === "") {
        trackDownloadLinks = false;
      } else {
        trackDownloadLinks = true;
        value = "\\." + value.split(/[,|\s]+?/).join("|\\.") + "$";
        downloadLinkRegexp = new RegExp(value.replace(/\.+/, '.'));
      }
    } else if (key === "internalDomains") {
      value = value.split(/[,|\s]+/).join("|\\.").replace('*', '.*');
      internalDomainNameRegexp = new RegExp("^" + value + "$");
    } else if (key === "trackExternalLinks") {
      trackExternalLinks = (value === "true");
    }
  };
  
    
  /**
   * Callback fired when a link is clicked
   */
  var linkHandler = function (event) {
    var link = (event.srcElement || event.target || this), target = link.target, timeoutId, eventName = null,
      goImmediately = (target !== "" && target !== "_self" && target !== window.name);
    if (trackExternalLinks 
      && link.hostname !== window.location.hostname 
      && (! internalDomainNameRegexp || ! internalDomainNameRegexp.test(link.hostname))) {
      eventName = "site-exit";
    } else if (trackDownloadLinks && downloadLinkRegexp.test(link.pathname)) {
      eventName = "download";
    }
    if (eventName !== null && ! goImmediately) {
      // the link unloads this window, so wait a moment for the tags to send their requests
      if (event.preventDefault) {
  			event.preventDefault();
      }
  		// otherwise set the returnValue property of the original event to false (IE)
  		event.returnValue = false;
      timeoutId = setTimeout(function () {
        window.location.href = link.href;
        // alert("go to " + link.href);
      }, 500);
    }
    if (eventName !== null) {
      jsHub.trigger(eventName, {
        node : link,
        url : link.href,
        timeoutId : timeoutId
      });      
      return goImmediately;
    } else {
      return true;
    }
  };
     
  /**
   * Instrument links to capture links to external sites and downloads, when triggered by the 'data-capture-start' event
   * @method capture
   * @property metadata
   */
  metadata.eventHandler = function instrumentLinks(event) {
  
    // extract links from html dom
    var links = document.getElementsByTagName('a'), i;
    for (i = 0; i < links.length; i++) {
      if (links[i].addEventListener) {
				links[i].addEventListener(click, linkHandler, false);
      } else if (links[i].attachEvent) {
				links[i].attachEvent("on" + click, linkHandler);
      }
    }
    
    return null;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("data-capture-start", metadata);

  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
