/**
 * Data transport via an Image URL 
 * Dispatches data to a webserver via an HTTP GET request.
 * The response is placed into a non-visible image in the page, and so any
 * data returned by the server is effectively ignored although it is expected
 * to typically be a single pixel GIF image
 * used in plugins
 * @module image-transport
 * @class ImageTranport
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global YUI, jsHub */
"use strict";

YUI.add('image-transport', function (Y) {

  var ImageTransport = function () {

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
        /** 
         * Append a field to a query string url
         */
        var appendField = function (url, name, value) {
          return url + (url.indexOf('?') > -1 ? '&' : '?') 
            + encodeURIComponent(name) + "=" + encodeURIComponent(value);
        };

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
              url = appendField(url, field, data[field]);
            } else if (!! data[field] && data[field].constructor === Array) {
              var values = data[field];				
              for (var i = 0; i < values.length; i++) {
                if (typeof values[i] === 'string' || typeof values[i] === 'number') {
                  url = appendField(url, field, values[i]);
                }
              }
            }
          }
        }
    
        var image = document.createElement("img");
        image.src = url;

        jsHub.logger.log("Dispatched: " + url);
        jsHub.logger.groupEnd();
        return image;
    
      };
    };
  
  jsHub.dispatchViaImage = (new ImageTransport()).dispatch;

  Y.log('image-transport module loaded', 'info', 'jsHub');
}, '2.0.0' , {
  requires: ['hub'], 
  after: ['hub']
});
    