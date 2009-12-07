/**
 * Core hub functionality for jsHub tag
 * @module hub
 * @class jsHub
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery */
"use strict";

(function ($) {
  
  // global namespace
  var global = this, 

    // instance of jsHub object
    jsHub,

    /**
     * Wrap Firebug console for logging.
     * Set META.DEBUG = false to switch off logging.
     * @class Logger
     * @for jsHub
     */
    // TODO: Enable sending of logging data to remote servers
    Logger = function () {
      var console = global.console;
      var logging_active = console && true;
      if (global.META && global.META.DEBUG === false) {
        logging_active = false;
      }
      this.debug = function debug() {
        if (logging_active && console.debug) {
          console.debug.apply(console, arguments);
        }
      };
      this.log = function log() {
        if (logging_active && console.log) {
          console.log.apply(console, arguments);
        }
      };
      this.warn = function warn() {
        if (logging_active && console.warn) {
          console.warn.apply(console, arguments);
        }
      };
      this.error = function error() {
        if (logging_active && console.error) {
          console.error.apply(console, arguments);
        }
      };
      this.group = function group() {
        if (logging_active && console.group) {
          console.group.apply(console, arguments);
        } else {
          this.log.apply(this, arguments);
        }
      };
      this.groupEnd = function groupEnd() {
        if (logging_active && console.groupEnd) {
          console.groupEnd.apply(console, arguments);
        }
      };
    },

    /**
     * Core event dispatcher functionality of the hub
     * @class Hub
     * @property listeners
     */
    Hub = function () {

      // stores functions listening to various events
      var listeners = {},
	  
	  /** Plugins that have registered with the hub. */
	  plugins = [],

      /**
       * a listener has an authentication token and a callback
       * @class Listener
       * @for Hub
       * @param token {string}
       * @param callback {function}
       */
      Listener = function (token, callback) {
        this.token = token;
        this.callback = callback;
      },
  
      /**
       * A simple event object
       * @class Event
       * @for Hub
       * @param name {string}
       * @param data {object}
       * @param timestamp {number} an optional timestamp value. 
       */
      Event = function (name, data, timestamp) {
        this.type = name;
    		this.timestamp = timestamp || jsHub.safe.getTimestamp();
        this.data = data;
      },
  
      // the firewall filters event data before passing to listeners
      /**
       * A simple event object
       * @class EventDispatcher
       * @for Hub
       */
      EventDispatcher = function () {
    
        /**
         * Locate a token within a comma separate string.
         * @method containsToken
         * @param string {string}
         * @param token {string}
         */
        var containsToken = function (string, token) {
          string = string.split(",");
          for (var i = 0; i < string.length; i++) {
            if (token === $.trim(string[i])) {
              return true;
            }
          }
          return false;
        },
    
        /**
         * TODO: Description
         * @method validate
         * @param token {string}
         * @param payload {object}
         */
        validate = function (token, payload) {
          var who = $.trim(payload.event_visibility);
          if (who === "" || who === "*") {
            return true;
          }
          return containsToken(who, token);
        },
    
        /**
         * TODO: Description
         * @method filter
         * @param token {string}
         * @param data {object}
         */
        filter = function (token, data) {
          // TODO remove fields from data that do not validate
          var filtered = {};
          $.each(data, function (key, value) {
            if (/_visibility$/.test(key) === false) {
              var fieldVisibility = data[key + "_visibility"];
              if (typeof fieldVisibility !== 'string'
                  || fieldVisibility === "" 
                  || fieldVisibility === "*"
                  || containsToken(fieldVisibility, token)) {
                filtered[key] = value;
              }
            }
          });
          return filtered;
        };

        /**
         * TODO: Description
         * @method dispatch
         * @param name {string} the name of the event
         * @param listener {Listener} the listener object to call back to
         * @param data {object}
         */        
        this.dispatch = function (name, listener, data) {
    		  var evt, filteredData, extraData;
      
  	      if (validate(listener.token, data)) {
  	        // remove private fields from the data for each listener
      			filteredData = filter(listener.token, data);
      			// send to the listener
  	        jsHub.logger.debug("Sending event %s to listener %s with data", name, listener.token, filteredData);
  	        evt = new Event(name, filteredData);
  	        extraData = listener.callback(evt);
      			// merge any additional data found by the listener into the data
      			if (extraData) {
    		      $.extend(true, data, extraData);
    		      jsHub.logger.debug("Listener %s added data, event is now ", listener.token, data);
      			}
  	      }
        };
      },
    
      firewall = new EventDispatcher(); 

      /**
       * Bind a listener to a named event.
       * @method bind
       * @for jsHub
       * @param eventName {string} the name of the event to bind.
       * Note that "*" is a special event name, which is taken to mean that 
       * the listener wants to be informed of every event that occurs 
       * (provided it has visibility of that event).
       * @param token {string} an identifier for the listener, which will
       * be matched against the value of the <code>data-visibility</code>
       * attribute of the DOM node containing the event.
       * @param callback {function} the function to call when an event is 
       * triggered. The function will be called with a single parameter containing
       * the event object.
       */
      this.bind = function (eventName, token, callback) {
        // TODO validate input data
        var list = listeners[eventName], found, i;
        if ('undefined' === typeof list) {
          list = [];
        }
        // if already present, then replace the callback function
        for (found = false, i = 0; i < list.length; i++) {
          if (list[i].token === token) {
            list[i].callback = callback;
            found = true;
            break;
          } 
        }
        // otherwise add it
        if (! found) {
          list.push(new Listener(token, callback));
        }
        listeners[eventName] = list;
      };

      /**
       * Fire a named event, and inform all listeners
       * @method trigger
       * @for jsHub
       * @param eventName {string}
       * @param data {object}
       */
      this.trigger = function (eventName, data) {
        jsHub.logger.group("Event %s triggered with data", eventName, (data || "'none'"));
        // empty object if not defined
        data = data || {};
        // find all registered listeners for the specific event, and for "*"
        var registered = (listeners[eventName] || []);
        var found, listener, listeners_all = (listeners["*"] || []), i, j;
        for (i = 0; i < listeners_all.length; i++) {
          listener = listeners_all[i];
          found = false;
          for (j = 0; j < registered.length; j++) {
            if (registered[j].token === listener.token) {
              found = true;
            }
          }
          if (!found) {
            registered.push(listener);
          }
        }
        for (var k = 0; k < registered.length; k++) {
          firewall.dispatch(eventName, registered[k], data);
        }
        jsHub.logger.groupEnd();
		// additional special behavior for particular event types
        if (eventName === "plugin-initialization-start") {
          plugins.push(data);
        }
      };
	  
	  /**
	   * Get information about plugins that have registered with
	   * the hub using trigger("plugin-initialization-start").
	   */
      this.getPluginInfo = function () {
        // take a deep copy to prevent the data being tampered with 
        var clone = [], i;
        for (i = 0; i < plugins.length; i++) {
          var plugin = plugins[i], plugin_clone = {};
          for (var field in plugin) {
            if (typeof plugin[field] === 'string' || typeof plugin[field] === 'number') {
              plugin_clone[field] = plugin[field];
            }
          }
          clone.push(plugin_clone);
        }
        return clone;
      };
    },

    /**
     * Document.forms data transport
     * Creates an HTML form in the DOM and encodes the data into the POST body for sending to a server.
     * The form is submitted to a named iframe for asynchronous cross domain delivery.
     * @class FormTransport
     */
    FormTransport = function () {
  
      /**
       * Send a request to the server as a POST or GET method form request. 
       * <p>The data is sent via a hidden iframe which is dynamically created in the page, so that the
       * form submission does not interfere with the history and behaviour of the back button in 
       * the browser.
       * <p>This function does not perform any serialization. It is the responsibility of the data
       * output plugins to prepare the data in the format required by their server.
       * @method dispatch
       * @for FormTransport
       * @param method {string} one of "GET" or "POST", not case sensitive. If the method is not
       * supplied or does not match on of these values, then the submission will be rejected and
       * the function will return without taking any action.
       * @param url {string} a URL for the endpoint to send the data to. The URL is processed by
       * the browser, and so it may be fully qualified or relative to the page, as per a normal 
       * link. If the url is not specified the method will return without taking any action.
       * @param data {object} an object containing name=value pairs that will be sent as form data.
       * The name of each field in the object will be used as the form field name. The value must
       * be either a string, a number, or an array of strings / numbers, in which case multiple
       * form fields with the same name will be created. Any parameters which do not match this
       * expected format will be ignored.
       * @return the ID of the iframe that has been created
       */
      this.dispatch = function (method, url, data) {
        jsHub.logger.group("FormTransport: dispatch(" + url + ") entered");
        var form, appendField, iframe, iframeID, field, array, i;
        
        /*
         * This data transport only supports POST or GET
         * TODO: validate url for security reasons, reject javascript: protocol etc
         */
        if (!(/^POST|GET$/i.test(method)) || !url) {
          jsHub.logger.error("Method (" + method + ") or url (" + url + ") was not defined correctly");
          jsHub.logger.groupEnd();
          return;
        }
        data = data || {};
		
        /**
         * Add a hidden field to the form
         * @param {Object} form
         * @param {Object} name
         * @param {Object} value
         */
        appendField = function (form, name, value) {
          if ("string" === typeof value || "number" === typeof value) {
            var input = $('<input type="hidden">');
            input.attr("name", name);
            input.attr("value", value);
            form.append(input);
          }
        };
		
        // Create the form from a string via jQuery
        form = $('<form action="' + url + '" method="' + method + '"></form>');
        for (field in data) {
          if (data[field] instanceof Array) {
            // TODO improve array test for security: http://blog.360.yahoo.com/blog-TBPekxc1dLNy5DOloPfzVvFIVOWMB0li?p=916
            array = data[field];
            for (i = 0; i < array.length; i++) {
              if ("string" === typeof array[i] || "number" === typeof array[i]) {
                appendField(form, field, array[i]);
              }
            }
          } else {
            appendField(form, field, data[field]);
          }
        }
        $('body').append(form);
        jsHub.logger.log("Created form:", form[0]);

        // Create the iframe from as string via jQuery
        iframeID = "jshub-iframe-" + jsHub.safe.getTimestamp();
        iframe = $('<iframe src="javascript:void(0)" name="' + iframeID + '" id="' + iframeID + '" '
          + 'style="display: none !important; width: 0px; height: 0px;" class="jshub-iframe"></iframe>');
      
        $('body').append(iframe);
        jsHub.logger.log("Created iframe:", iframe[0]);
    
        // Set the iframe as the submission target of the form, tied together by a timestamp
        form.attr("target", iframeID);

        // And send it ...
        form.submit();
        jsHub.logger.log("Form submitted");
        jsHub.trigger("form-transport-sent", {
          node: iframeID
        });
        jsHub.logger.groupEnd();
        return iframeID;
      };
    },
	
	/**
	 * Dispatches data to a webserver via an HTTP GET request.
	 * The response is placed into a non-visible image in the page, and so any
	 * data returned by the server is effectively ignored although it is expected
	 * to typically be a single pixel GIF image
	 * @class ImageTranport
	 */
	ImageTransport = function () {
		
	  /** 
	   * Append a field to a query string url
	   */
      var append = function (url, name, value) {
        return url + (url.indexOf('?') > -1 ? '&' : '?') 
          + encodeURIComponent(name) + "=" + encodeURIComponent(value);
      };

      /**
       * Send a request to the server as a GET request for an image. 
       * <p>Plugins can call this function to create an image object to send data to the
       * server. Data can be supplied in two locations: in a URL string which can be in
       * any format required by the server, and a data object.
       * <p>All text and numeric fields in the data object are URL encoded and used to build
       * a query string which is appended to the URL. 
       * @method dispatch
       * @for ImageTransport
       * @param url {string} a URL for the endpoint to send the data to. The URL is 
       * processed by the browser, and so it may be fully qualified or relative to the
       * page, as per a normal link. 
       * The URL may contain all the information required by the server, in any format
       * as specified by the plugin calling this function. Plugins must ensure that they
       * have correctly URL encoded any data fields in the URL.
       * If the url is not specified the method will return without taking any action.
       * @param data {object} an object containing name=value pairs that will be sent as 
       * query string data. The name of each field in the object will be used as the form 
       * field name. The value must be either a string, a number, or an array of strings 
       * and numbers, in which case multiple query string fields with the same name will 
       * be created. Any parameters which do not match this expected format will be ignored.
       * @return the ID of the iframe that has been created
       */
      this.dispatch = function (url, data) {
        jsHub.logger.group("ImageTransport: dispatch(" + url + ") entered");
        
		// base url must be defined
        if (typeof url !== 'string' || url.length < 1) {
          jsHub.logger.error("Base url (" + url + ") was not defined correctly");
          jsHub.logger.groupEnd();
          return null;
        }
		
		// add data to url if it is defined
        if (typeof data === 'object') {
          for (var field in data) {
            if (typeof data[field] === 'string' || typeof data[field] === 'number') {
              url = append(url, field, data[field]);
            } else if (!! data[field] && data[field].constructor === Array) {
              var values = data[field];				
              for (var i = 0; i < values.length; i++) {
                if (typeof values[i] === 'string' || typeof values[i] === 'number') {
                  url = append(url, field, values[i]);
                }
              }
            }
          }
        }
		
        var image = $('<img>');
        image.attr('src', url);

        jsHub.logger.log("Dispatched: " + url);
        jsHub.logger.groupEnd();
        return image[0];
		
      };
    };

  // jsHub object in global namespace
  jsHub = global.jsHub = new Hub();

  // Initialise a logger instance  
  jsHub.logger = new Logger();
  
  // Create an object to return safe instances of important variables
  jsHub.safe = function (obj) {
    var safeObject;
    switch (obj) {
    case 'document' : 
      safeObject = {
        // no document DOM properties are available
        location : { 
          href : document.location.href,
          host : document.location.host,
          protocol : document.location.protocol,
          pathname : document.location.pathname
        },
        title : document.title,
        referrer : (document.referrer === null) ? "" : document.referrer,
        cookies : document.cookies,
        domain : 'Unsafe property'
      };
      break;      
    case '$' :
      // TODO this is not safe
      safeObject = jQuery;
      break;      
    default :
      safeObject = null;
    }
    return safeObject;
  };
    
  /**
   * Get a timestamp for an event.
   * TODO add sequence / random component
   */
  jsHub.safe.getTimestamp = function () {
    return new Date().getTime();
  };
  
  /** 
   * Convert an object to a JSON representation
   */
  jsHub.safe.toJSONString = function (object) {
  	return JSON.stringify(object, null, 2);
  };

  // Initialise lifecycle triggers
  jsHub.logger.log("Hub initialized, triggering page lifecycle events");
  $(document).ready(function () {
  	// Can be used to pre-configure data at page level if necessary
  	jsHub.trigger("data-capture-start");

    // Data is ready to be parsed by Data Capture plugins
    jsHub.trigger("page-view");

  	// Data capture phase is complete
    jsHub.trigger("data-capture-complete");
  });

  jsHub.dispatchViaForm = (new FormTransport()).dispatch;
  jsHub.dispatchViaImage = (new ImageTransport()).dispatch;
})(jQuery);