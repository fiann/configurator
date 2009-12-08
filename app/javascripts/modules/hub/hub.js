/**
 * Core hub functionality for jsHub tag
 * @module hub
 * @class jsHub
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jQuery */
"use strict";

YUI.add('hub', function (Y) {

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

    /** Stores functions listening to various events */
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
          if (token === Y.Lang.trim(string[i])) {
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
        var who = Y.Lang.trim(payload.event_visibility);
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
        Y.Object.each(data, function (value, key) {
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
          evt = new Event(name, filteredData, timestamp);
          extraData = listener.callback(evt);
          // merge any additional data found by the listener into the data
          if (extraData) {
            Y.mix(data, extraData);
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
     * @param data {object} a data object containing name=value fields for the event data
     * @param timestamp {number} a timestamp, which can be used to associate this event
     * with other events created due to the same user action in the browser. Optional, will
     * be created automatically if not supplied.
     */
    this.trigger = function (eventName, data, timestamp) {
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
        firewall.dispatch(eventName, registered[k], data, timestamp);
      }

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
      
      var plugin, notify, path, field, obj, keys = key.split('.'), confType = typeof conf;
      
      notify = function () {
        Y.use(plugin, function () {
          var i, field = keys.slice(1, keys.length).join('.');
          for (i = 0; i < plugins.length; i++) {
            if (plugin === plugins[i].id && typeof plugins[i].configure === 'function') {
              plugins[i].configure(field, conf);
              return;
            }
          }
        });
      };

      // the first component of the key is the plugin name
      plugin = keys[0];

      // the part up to the final dot is the namespace object
      path = (keys.length < 3 ? "" : keys.slice(0, keys.length - 1).join('.'));
      path = ("YUI.Env.jsHub.config." + (keys.length < 2 ? "" : plugin) + "." + path).replace(/\.+/g, '.').replace(/\.$/, '');
      obj = YUI.namespace(path);
      
      // the part after the final dot is the object key
      field = keys[keys.length - 1];

      if (confType === 'string' || confType === 'number' || confType === 'boolean') {
        obj[field] = conf;
        notify();
      } else if (conf === null) {
  	  	delete obj[field];
        notify();
      } else if (confType === 'object') {
        for (var name in conf) {
          // we don't want inherited values
          if (conf.hasOwnProperty(name)) {
            this.configure(key + "." + name, conf[name]);
          }
        }
      } else {
        return obj[field];
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
  
	
}, '2.0.0', {
  requires: ['yui'],
  after: ['yui']
});
