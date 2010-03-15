/**
 * A plugin to send output to the Causata system, using the POST transport and
 * in JSON format expected by Causata.
 *
 * @module data-transport
 * @class causata-post-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub */
"use strict";

(function () {

    /**
     * Metadata about this plug-in for use by UI tools and the Hub
     */
    var metadata = {
      id: 'causata-transport',
      name: 'Causata Transport Plugin',
      version: 0.1,
      vendor: 'Causata Inc', 
      type: 'data-transport'
    },

    /**
     * The events that will be captured and sent to the Causata servers
     */
    boundEvents = ['page-view', 'product-view', 'authentication', 'checkout', 'site-search'],

    /**
     * The config object for this plugin
     */
    config = {
      server : null,
      account : null
    };

    // First trigger an event to show that the plugin is being registered
    jsHub.trigger("plugin-initialization-start", metadata);

    /**
     * Event driven anonymous function bound to 'page-view'
     * @method transport
     * @param event {Object} the event to serialize and send to the server
     * @property metadata
     */
    metadata.eventHandler = function transport(event) {

      // check if this is an event we want to record
      var listen = false;
      if ("" + event.data["custom-event"] === "true") {
        listen = "custom";
      } else {
        for (var i = 0; i < boundEvents.length; i++) {
          if (boundEvents[i] === event.type) {
            listen = "standard";
            break;
          }
        }
      }
      if (! listen) {
        return;
      }

//       jsHub.logger.group("Causata output: sending %s event '%s'", listen, event.type);

      // cannot send message if server is not configured
      if (typeof config.server !== 'string') {
        jsHub.trigger('plugin-error', {
          message : "Server hostname not specified",
          source : metadata.id
        });
//         jsHub.logger.groupEnd();
        return;
      }

      /*
       * Serialize data as expected format, see
       * https://intra.causata.com/code/causata/wiki/JavascriptTag/WireFormat
       */
       var outputEvent = {
         timestamp: event.timestamp,
         eventType: event.type,
         attributes: []
       };
       
       // account is optional
       if (typeof config.account === 'string') {
         outputEvent.organizationId = config.account;
       }

       var appendAttribute = function (array, field, value) {
         var type = typeof value, i;
         if ("string" === type || "number" === type) {
           array.push({
             name: field,
             value: value
           });
         } else if (jsHub.util.isArray(value)) {
           for (i = 0; i < value.length; i++) {
             appendAttribute(array, field, value[i]);
           }
         }
       };

       for (var field in event.data) {
         if (event.data.hasOwnProperty(field)) {
           appendAttribute(outputEvent.attributes, field, event.data[field]);
         }
       }

       var outputData = {
         sender: metadata.name + " v" + metadata.version,
         event: jsHub.json.stringify(outputEvent)
       };

      var protocol = (("https:" === jsHub.safe('document').location.protocol) ? "https://" : "http://");

      // dispatch via API function
      jsHub.dispatchViaForm("POST", protocol + config.server, outputData);
//       jsHub.logger.groupEnd();
    };

    /**
     * Receive a configuration update
     */
    metadata.configure = function (key, value) {
      config[key] = "" + value;
    };

    /*
     * Bind the plugin to the Hub so as to run when events we are interested in occur
     */
    jsHub.bind("*", metadata);

    // lifecycle notification
    jsHub.trigger("plugin-initialization-complete", metadata);

})();
