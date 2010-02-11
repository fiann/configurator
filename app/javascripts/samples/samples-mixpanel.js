/** 
 * A plugin to capture jsHub events and send them to a mixpanel accunt via a 
 * single pixel gif image.
 *  *
 * @module data-transport
 * @class mixpanel-get-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub */
/*jslint nomen: false, white: false, bitwise: false */

"use strict";

  // Mixpanel original internal api for encoding data
  // ref: http://mixpanel.com/api/docs/specification/
  var mpmetrics = {};
  
  mpmetrics.json_encode = function(mixed_val) {    
      var indent;
      var value = mixed_val;
      var i;
  
      var quote = function (string) {
          var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
          var meta = {    // table of character substitutions
              '\b': '\\b',
              '\t': '\\t',
              '\n': '\\n',
              '\f': '\\f',
              '\r': '\\r',
              '"' : '\\"',
              '\\': '\\\\'
          };
  
          escapable.lastIndex = 0;
          return escapable.test(string) ?
          '"' + string.replace(escapable, function (a) {
              var c = meta[a];
              return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }) + '"' :
          '"' + string + '"';
      };
  
      var str = function(key, holder) {
          var gap = '';
          var indent = '    ';
          var i = 0;          // The loop counter.
          var k = '';          // The member key.
          var v = '';          // The member value.
          var length = 0;
          var mind = gap;
          var partial = [];
          var value = holder[key];
  
          // If the value has a toJSON method, call it to obtain a replacement value.
          if (value && typeof value === 'object' &&
              typeof value.toJSON === 'function') {
              value = value.toJSON(key);
          }
          
          // What happens next depends on the value's type.
          switch (typeof value) {
              case 'string':
                  return quote(value);
  
              case 'number':
                  // JSON numbers must be finite. Encode non-finite numbers as null.
                  return isFinite(value) ? String(value) : 'null';
  
              case 'boolean':
              case 'null':
                  // If the value is a boolean or null, convert it to a string. Note:
                  // typeof null does not produce 'null'. The case is included here in
                  // the remote chance that this gets fixed someday.
  
                  return String(value);
  
              case 'object':
                  // If the type is 'object', we might be dealing with an object or an array or
                  // null.
                  // Due to a specification blunder in ECMAScript, typeof null is 'object',
                  // so watch out for that case.
                  if (!value) {
                      return 'null';
                  }
  
                  // Make an array to hold the partial results of stringifying this object value.
                  gap += indent;
                  partial = [];
  
                  // Is the value an array?
                  if (Object.prototype.toString.apply(value) === '[object Array]') {
                      // The value is an array. Stringify every element. Use null as a placeholder
                      // for non-JSON values.
  
                      length = value.length;
                      for (i = 0; i < length; i += 1) {
                          partial[i] = str(i, value) || 'null';
                      }
  
                      // Join all of the elements together, separated with commas, and wrap them in
                      // brackets.
                      v = partial.length === 0 ? '[]' :
                      gap ? '[\n' + gap +
                      partial.join(',\n' + gap) + '\n' +
                      mind + ']' :
                      '[' + partial.join(',') + ']';
                      gap = mind;
                      return v;
                  }
  
                  // Iterate through all of the keys in the object.
                  for (k in value) {
                      if (Object.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
  
                  // Join all of the member texts together, separated with commas,
                  // and wrap them in braces.
                  v = partial.length === 0 ? '{}' :
                  gap ? '{' + partial.join(',') + '' +
                  mind + '}' : '{' + partial.join(',') + '}';
                  gap = mind;
                  return v;
          }
      };
  
      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return str('', {
          '': value
      });
  };
  
  mpmetrics.base64_encode = function(data) {        
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];
  
      if (!data) {
          return data;
      }
  
      data = this.utf8_encode(data+'');
      
      do { // pack three octets into four hexets
          o1 = data.charCodeAt(i++);
          o2 = data.charCodeAt(i++);
          o3 = data.charCodeAt(i++);
  
          bits = o1<<16 | o2<<8 | o3;
  
          h1 = bits>>18 & 0x3f;
          h2 = bits>>12 & 0x3f;
          h3 = bits>>6 & 0x3f;
          h4 = bits & 0x3f;
  
          // use hexets to index into b64, and append result to encoded string
          tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);
      
      enc = tmp_arr.join('');
      
      switch( data.length % 3 ){
          case 1:
              enc = enc.slice(0, -2) + '==';
          break;
          case 2:
              enc = enc.slice(0, -1) + '=';
          break;
      }
  
      return enc;
  };
  
  mpmetrics.utf8_encode = function (string) {
      string = (string+'').replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
      var utftext = "";
      var start, end;
      var stringl = 0;
  
      start = end = 0;
      stringl = string.length;
      for (var n = 0; n < stringl; n++) {
          var c1 = string.charCodeAt(n);
          var enc = null;
  
          if (c1 < 128) {
              end++;
          } else if((c1 > 127) && (c1 < 2048)) {
              enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
          } else {
              enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
          }
          if (enc !== null) {
              if (end > start) {
                  utftext += string.substring(start, end);
              }
              utftext += enc;
              start = end = n+1;
          }
      }
  
      if (end > start) {
          utftext += string.substring(start, string.length);
      }
  
      return utftext;
  };

/*******************************************
 * jsHub plugin wrapper for Mixpanel code
 *******************************************/

(function () {

  /**
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
  	id: 'mixpanel-get-plugin',
    name: 'Mixpanel GET transport plugin',
    version: 0.1,
    vendor: 'jsHub'
  },    
  
  /**
   * The events that will be captured and sent to the server
   */
  boundEvents = ['interaction'],

  /**
   * Account/Project Token ID
   * Note that the field <code>account_id</code> in the string is replaced
   * when the tag is generated.
   */
  account = "295eb54e58ad790b4f2a3f3288499591",
  
  /**
   * URL to dispatch to the server
   * Note that the field <code>server_url</code> in the string is replaced
   * when the tag is generated.
   */
  url = "http://api.mixpanel.com/track/";

  /**
   * Event driven anonymous function bound to events
   * @method send
   * @param event {Object} the event to serialize and send to the server
   * @property metadata
   */
  metadata.eventHandler = function(event) {
  
//     jsHub.logger.group("Mixpanel get transport: sending '%s' event", event.type);
//     jsHub.logger.debug("Event: %o", event);
    
    /**
     * Each field in this object is serialized as a name=value pair in the query
     * string of the URL that is created for the image request.
     * You can put any data in this object. If the value of a field is an array,
     * then it will be used to generate multiple name=value pairs in the resulting
     * query string.
     */    
    var dispatch = {
      _: event.timestamp,
      data: {
        "properties": event.data
      },
      ip: 1,
      img: 1
    };

    /**
     * Append account ID if supplied
     */
    if (account !== ""){
      // insert the account token for encoding
      dispatch.data.properties.token = account;    
    }

    // determine the name of the interaction event if supplied else is a generic event from a listener
    if (event.type === "interaction"){
      // cast to string so we have a property copy not reference since we delete it
      var event_id = "" + dispatch.data.properties.event;
      dispatch.data.event = event_id;
      delete dispatch.data.properties.event;
    } else {
      dispatch.data.event = event.type;
    }

    // encode merged data payload
//     jsHub.logger.debug("Data to encode: %o", dispatch);    
    var encoded_data = mpmetrics.base64_encode(mpmetrics.json_encode(dispatch.data)); // Security by obscurity
    dispatch.data = encoded_data;

    // dispatch via API function
//     jsHub.logger.debug("Dispatch data: %o", dispatch);
    jsHub.dispatchViaImage(url, dispatch);
//     jsHub.logger.groupEnd();
  };
  
  /**
   * Receive a configuration update
   */
  metadata.configure = function (key, value) {
    if (key === "account") {
      account = value;
    }
  };

  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);

  /*
   * Bind the plugin to the Hub so as to run when events we are interested in occur
   */
  for (var i = 0; i < boundEvents.length; i++ ) {
    jsHub.bind(boundEvents[i], metadata);
  }
  
  // lifecycle notification
  jsHub.trigger("plugin-initialization-complete", metadata);
})();
