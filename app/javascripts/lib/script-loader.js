/**
 * Enhancements to jsHub.util for loading external script files via DOM insertion
 * @module utils
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub */
"use strict";

(function () {
  
  var util = jsHub.util;
  
  util.loadScript = function (url, callback) {
    var head = document.getElementsByTagName("head")[0];
    if (head) {
      var scriptNode = document.createElement("script");
      scriptNode.type = 'text/javascript';
      scriptNode.src = url;
      scriptNode.onload = scriptNode.onreadystatechange = function() {
        if (!scriptNode.fired && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
          scriptNode.fired = true;
          if (typeof callback === 'function') {
            callback();
          }
          scriptNode.onload = scriptNode.onreadystatechange = null;
          head.removeChild(scriptNode);
        }
      };
      head.appendChild(scriptNode);
    }
  };

})();
