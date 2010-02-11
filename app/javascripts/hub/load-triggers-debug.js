/**
 * Fire the page lifecycle events when the page has loaded.
 * 
 * Contains DOMContentLoaded code by Dean Edwards / Matthias Miller / John Resig
 * http://dean.edwards.name/weblog/2006/06/again/
 * http://javascript.nwbox.com/IEContentLoaded/
 * 
 * @module load-triggers
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
"use strict";

(function () {

  var timer = null, doc = document;

  function triggerPageLoadEvents() {
    // Initialise lifecycle triggers
    jsHub.logger.info("Triggering page lifecycle events");
    
    // Don't fire the events more than once
    if (triggerPageLoadEvents.done) {
      return;
    }
    triggerPageLoadEvents.done = true;
    if (timer) {
      clearInterval(timer);
    }
    
    // Can be used to pre-configure data at page level if necessary
    jsHub.trigger("data-capture-start");
    
    // Data is ready to be parsed by Data Capture plugins
    jsHub.trigger("page-view");
    
    // Data capture phase is complete
    jsHub.trigger("data-capture-complete");
  }
  
  if (doc.addEventListener) {
    /* for Mozilla / Opera9 */
    doc.addEventListener("DOMContentLoaded", triggerPageLoadEvents, false);
    
  } else if (doc.attachEvent) {
    /* for Internet Explorer */
    doc.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = doc.getElementById("__ie_onload");
    script.onreadystatechange = function () {
      if (this.readyState === "complete") {
        triggerPageLoadEvents();
      }
    };
  
  } else if (/WebKit/i.test(navigator.userAgent)) {
    /* for older Safari */
    timer = setInterval(function () {
      if (/loaded|complete/.test(doc.readyState)) {
        triggerPageLoadEvents();
      }
    }, 50);
  }
  
})();

