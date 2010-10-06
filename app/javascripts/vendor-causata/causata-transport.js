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
      version: '0.4.3',
      vendor: 'Causata Inc', 
      type: 'data-transport'
    },

    /**
     * The events that will be captured and sent to the Causata servers
     */
    boundEvents = "authentication,checkout,download,nat-search-ref,page-view,product-view,site-exit,site-search".split(','),
    
    /**
     * Some strings that are used multiple times
     */
    string = "string", 
    
    /**
     * Attributes that are sent as request parameters not event attributes
     */
    topLevelAttributes = /^url|tzOffset|sW|sH|wW|wH|colors|plugins$/,

    /**
     * The config object for this plugin
     */
    config = {
      server : null,
      account : null
    },
    
    /**
     * Cache for events that can be sent at the same time
     */
    cache = [], caching = false,
    
    /**
     * Serialize an attribute on to the event array.
     */
    appendAttribute = function (array, field, value) {
      if (/-source$/.test(field)) {
        return;
      }
      var type = typeof value, i;
      if (string === type || "number" === type) {
        array.push({
          name: field,
          value: value
        });
      } else if (jsHub.util.isArray(value)) {
        for (i = 0; i < value.length; i++) {
          appendAttribute(array, field, value[i]);
        }
      }
    },

    /** 
     * Send events to the server via the dis
     */
    sendEvents = function () {
//       jsHub.logger.group("Causata output: sending %s events", cache.length);
      
      // cannot send message if server is not configured
      if (typeof config.server !== string) {
        jsHub.trigger('plugin-error', {
          message : "Server hostname not specified",
          source : metadata.id
        });
//         jsHub.logger.groupEnd();
        return;
      }
      
      var i, srcEvent, outputEvent, field, value, attributes;
      var outputData = {
        sender: metadata.name + " v" + metadata.version,
        event: []
      };

      for (i = 0; i < cache.length; i++) {
        srcEvent = cache[i];
        
        /*
         * Serialize data as expected format, see
         * https://intra.causata.com/code/causata/wiki/JavascriptTag/WireFormat
         */
        outputEvent = {
          timestamp: srcEvent.timestamp,
          eventType: srcEvent.type
        };
        // account is optional
        if (typeof config.account === string) {
          outputEvent.organization = config.account;
        }
        
        attributes = [];
        for (field in srcEvent.data) {
          if (srcEvent.data.hasOwnProperty(field)) {
            value = srcEvent.data[field];
            if (topLevelAttributes.test(field)) {
              outputData[field] = value;
            } else if (field === "referrer") {
              if (value === "") {
                value = "(direct)";
              }
              outputData.referrer = value;
            } else {
              appendAttribute(attributes, field, value);
            }
          }
        }
        if (attributes.length > 0) {
          outputEvent.attributes = attributes;
        }
        
        outputData.event.push(jsHub.json.stringify(outputEvent));
      }
      cache = [];

      // dispatch via API function
      var protocol = (("https:" === jsHub.safe('document').location.protocol) ? "https://" : "http://");
      jsHub.dispatchViaForm("POST", protocol + config.server, outputData);
//       jsHub.logger.groupEnd();
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

      // cache events that occur during initial data capture phase
      if (event.type === "data-capture-start") {
        caching = true;
      }
      if (event.type === "data-capture-complete") {
        caching = false;
        sendEvents();
      }

      // check if this is an event we want to record
      var listen = false;
      if ("" + event.data["custom-event"] === "true") {
        listen = "custom";
      } else if (event.type.match(/^error-/)) {
        listen = "standard";
      } else {
        for (var i = 0; i < boundEvents.length; i++) {
          if (boundEvents[i] === event.type) {
            listen = "standard";
            break;
          }
        }
      }
      if (listen) {
//         jsHub.logger.debug("Causata output: capturing %s event '%s'", listen, event.type);
        cache.push(event);
        if (! caching) {
          sendEvents();
        }
      }
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
