/**
 * Core hub functionality for jsHub tag
 * @module hub
 * @class jsHub
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery */
"use strict";

(function () {

  // global namespace
  var global = window, 
  
  // instance of jsHub object
  jsHub,
  
  /**
   * Core event dispatcher functionality of the hub
   * @class Hub
   * @property listeners
   */
  Hub = function () {

    /** Plugins that have registered with the hub. */
    var plugins = [],
    
    /** Events which have already occurred. */
    eventCache = [],

    /** Configuration values cache */
    config = {},

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
    
    /**
     * A store for the listeners registered to each event
     */
    EventListenerCache = function () {
      /** The underlying cache store */
      var cache = {},
      
      /** The listeners registered for the event name */
      cached = function (eventName) {
        return cache[eventName] || {
          "data-capture": [],
          "data-transport": []
        };
      };
      
      this.bind = function (eventName, token, phase, callback) {
//         jsHub.logger.debug("EventListenerCache: registering " + token + " to event " + eventName + " in phase " + phase);
        var registered = cached(eventName);
        // Use only one of the valid phase names
        if (! registered[phase]) {
//           jsHub.logger.info("EventListenerCache: invalid phase name " + phase + ", using data-capture");
          phase = "data-capture";
        }
        // if already present, then replace the callback function
        for (var found = false, i = 0; i < registered[phase].length; i++) {
          if (registered[phase][i].token === token) {
            registered[phase][i].callback = callback;
            found = true;
            break;
          }
        }
        // otherwise add it
        if (!found) {
          registered[phase].push(new Listener(token, callback));
        }
        cache[eventName] = registered;
      };
      
      this.listenersFor = function (eventName) {
        // find all registered listeners for the specific event, and for "*"
        var registered = cached(eventName), registeredStar = cached('*');
        var deduped = [], all = [].concat(registered['data-capture'])
        	.concat(registeredStar['data-capture'])
        	.concat(registered['data-transport'])
        	.concat(registeredStar['data-transport']);
        o:
        for (var i = 0, n1 = all.length; i < n1; i++) {
          for (var j = 0, n2 = deduped.length; j < n2; j++) {
            if (deduped[j].token === all[i].token) {
              continue o;
            }
          }
          deduped.push(all[i]);
        }
        return deduped;
      };
    },

    /** An instance of the event listener cache */
    listeners = new EventListenerCache(),

    /**
     * The event dispatcher filters event data before passing to listeners
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
          if (token === jsHub.util.trim(string[i])) {
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
        var who = jsHub.util.trim(payload.event_visibility);
        if (who === undefined || who === "" || who === "*") {
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
        jsHub.util.each(data, function (value, key) {
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
      this.dispatch = function (name, listener, data, timestamp) {
        var evt, filteredData, extraData;
        
        if (validate(listener.token, data)) {
          // remove private fields from the data for each listener
          filteredData = filter(listener.token, data);
          // send to the listener
//           jsHub.logger.debug("Sending event %s to listener %s with data", name, listener.token, filteredData);
          evt = new Event(name, filteredData, timestamp);
          extraData = listener.callback(evt);
          // merge any additional data found by the listener into the data
          if (extraData) {
            jsHub.util.merge(data, extraData);
//             jsHub.logger.debug("Listener %s added data, event is now ", listener.token, data);
          }
        }
      };
    },
  
    /** An instance of the event dispatcher */
    firewall = new EventDispatcher();

    /**
     * Bind a listener to a named event.
     * @method bind
     * @for jsHub
     * @param eventName {string} the name of the event to bind.
     * Note that "*" is a special event name, which is taken to mean that 
     * the listener wants to be informed of every event that occurs 
     * (provided it has visibility of that event).
     * @param listener {object} an metadata object describing the listener, which will
     * contain at least these fields: <code>id</code> the identifier for the plugin, which
     * may be matched against the value of the <code>data-visibility</code>
     * attribute of the DOM node containing the event, and <code>callback</code> a function
     * to be called when the event is fired.
     */
    this.bind = function (eventName, listener) {
      if (typeof eventName !== "string" || eventName === "") {
//         jsHub.logger.warn("jsHub.bind(): Invalid event name " + eventName);
        return;
      }
      if (typeof listener !== "object") {
//         jsHub.logger.warn("jsHub.bind(): Missing listener object " + listener);
        return;
      }
      if (! listener.id || ! listener.eventHandler) {
//         jsHub.logger.warn("jsHub.bind(): Listener object missing required field id or eventHandler");
        return;
      }
      listeners.bind(eventName, listener.id, listener.type, listener.eventHandler);
    };

    /**
     * Fire a named event, and inform all listeners
     * @method trigger
     * @for jsHub
     * @param eventName {string}
     * @param data {object} a data object containing name=value fields for the event data
     * @param timestamp {number} a timestamp, which can be used to associate this event
     * with other events created due to the same user action in the browser. Optional, will
     * be created automatically if not supplied.
     */
    this.trigger = function (eventName, data, timestamp) {
//       jsHub.logger.group("Event %s triggered with data", eventName, (data || "'none'"));
      // empty object if not defined
      data = data || {};
      // keep the event in the local cache
      var evt = new Event(eventName, data, timestamp);
      eventCache.push(evt);
      // find all registered listeners for the specific event, and for "*"
      var registered = listeners.listenersFor(eventName);
      for (var k = 0; k < registered.length; k++) {
        firewall.dispatch(eventName, registered[k], data, timestamp);
      }
//       jsHub.logger.groupEnd();

      // additional special behavior for particular event types
      if (eventName === "plugin-initialization-start") {
        plugins.push(data);
        if (config[data.id]) {
          this.configure(data.id, config[data.id]);
        }
      }
    };
    
    /**
     * Retrieve an array of the events which have already been fired.
     * Primarily used by the Activity Inspector, so that it can be injected after the
     * page has loaded and still retrieve the events that have already occurred.
     */
    this.cachedEvents = function () {
      // take a deep copy to prevent the data being tampered with 
      var clone = [], i;
      for (i = 0; i < eventCache.length; i++) {
        var evt = eventCache[i], evt_clone = {};
        evt_clone.type = evt.type;
        evt_clone.timestamp = evt.timestamp;
        evt_clone.data = {};
        for (var field in evt.data) {
          if (typeof evt.data[field] === 'string' || typeof evt.data[field] === 'number') {
            evt_clone.data[field] = evt.data[field];
          }
        }
        clone.push(evt_clone);
      }
      return clone;
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
	
  	/**
  	 * Configure a value for the hub or a plugin.
  	 * @param {String} key the name of the plugin. The first component is the name of the plugin
  	 *        which the configuration is intended for, such as "logger". The key may also contain 
  	 *        a dotted path to a specific configuration property, such as "logger.level".
  	 */
    this.configure = function (key, conf) {
      if (typeof key !== 'string') {
        throw new Error('Invalid configuration key');
      }
      
      var plugin, notify, field, keys = key.split('.'), confType = typeof conf;
      
      notify = function () {
        var i, field = keys.slice(1, keys.length).join('.');
        for (i = 0; i < plugins.length; i++) {
          if (plugin === plugins[i].id && typeof plugins[i].configure === 'function') {
            plugins[i].configure(field, conf);
            return;
          }
        }
      };
      
      // the first component of the key is the plugin name
      plugin = keys[0];

      // the part after the final dot is the object key
      field = keys[keys.length - 1];

      // the part up to the final dot is the namespace to cache the configuration value
      for (var cacheNode = config, i = 0; i < keys.length - 1; i++) {
        cacheNode[keys[i]] = cacheNode[keys[i]] || {};
        cacheNode = cacheNode[keys[i]]; 
      }
      
      if (confType === 'string' || confType === 'number' || confType === 'boolean') {
        cacheNode[field] = conf;
        notify();
      } else if (conf === null) {
  	  	delete cacheNode[field];
        notify();
      } else if (confType === 'object') {
        for (var name in conf) {
          // we don't want inherited values
          if (conf.hasOwnProperty(name)) {
            this.configure(key + "." + name, conf[name]);
          }
        }
      } else {
        return cacheNode[field];
      }
    };
  };

  // jsHub object in global namespace
  jsHub = global.jsHub = new Hub();

  // Create an object to return safe instances of important variables
  jsHub.safe = function (obj) {
    var safeObject;
    if ('document' === obj) {
      safeObject = {
        // no document DOM properties are available
        location: {
          hash : document.location.hash,
          // includes the port if present, e.g. localhost:8080
          host : document.location.host,
          // only the domain name, e.g. localhost
          hostname : document.location.hostname,
          href: document.location.href,
          pathname : document.location.pathname,
          port : document.location.port,
          protocol: document.location.protocol,
          // includes the query string if present, e.g. ?foo=bar
          search : document.location.search
        },
        title: document.title,
        referrer: (document.referrer === null) ? "" : document.referrer,
        cookies: document.cookies,
        domain: 'Unsafe property'
      };
    } else {
      // empty object that can be enhanced
      safeObject = {};
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
   * Utility functions
   */
  var Utils = function () {
    
    var utils = this;
  
    /**
     * Trim whitespace at beginning and end of value and
     * remove multiple spaces
     */
    utils.trim = function (value) {
      if (typeof value === 'string') {
        value = value.replace(/(&nbsp;|\s)+/g, ' ').replace(/(^\s+)|(\s+$)/g, '');
      }
      return value;
    };
    
    /**
     * Check that an object is an array. 
     */
    utils.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
    
    /**
     * Iterate over an array or object, applying the function to each item 
     * in the array.
     * @param the source object
     * @param fn the function which will be applied
     * @return the source object
     */
    utils.each = function (object, fn) {
      if (utils.isArray(object)) {
        for (var i = 0, limit = object.length; i < limit; i++) {
          fn.call(jsHub, object[i], i);
        }
      } else if (typeof object === 'object') {
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            fn.call(jsHub, object[key], key);
          }
        }
      }
      return object;
    };
    
    /**
     * Augment an object with additional properties, overwriting existing properties
     * on the object with new properties.
     */
    utils.merge = function (object, additions) {
      object = object || {};
      additions = additions || {};
      for (var key in additions) {
        if (additions.hasOwnProperty(key)) {
          object[key] = additions[key];
        }
      }
      return object;
    };
  };
  
  jsHub.util = new Utils();

})();
