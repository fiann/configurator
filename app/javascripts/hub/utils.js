/**
 * Enhancements to jsHub.util for common functions 
 * used in plugins
 * @module utils
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub */
"use strict";

(function () {
  
  var utils = jsHub.util;
  
  /** 
   * Fix relative pathed URLs
   * ref: http://www.sitepoint.com/blogs/2007/08/10/dealing-with-unqualified-href-values/
   * TODO: pass in context to account for BASE or IFRAME variations
   * @method qualifyHREF
   * @param href {string} The href to qualify, e.g. page.html, ../page.html, /page.html
   * @return {string}     Full qualified URI
   */
  utils.qualifyHREF = function (href) {
    //get the current safe document location object 
    var loc = jsHub.safe('document').location; 

    //build a base URI from the protocol plus host (which includes port if applicable) 
    var uri = loc.protocol + '//' + loc.host; 

    //if the input path is relative-from-here 
    //just delete the ./ token to make it relative 
    if (/^(\.\/)([^\/]?)/.test(href)) 
    { 
      href = href.replace(/^(\.\/)([^\/]?)/, '$2'); 
    } 

    //if the input href is already qualified, copy it unchanged 
    if (/^([a-z]+)\:\/\//.test(href)) 
    { 
      uri = href; 
    } 

    //or if the input href begins with a leading slash, then it's base relative 
    //so just add the input href to the base URI 
    else if (href.substr(0, 1) === '/') 
    { 
      uri += href; 
    } 

    //or if it's an up-reference we need to compute the path 
    else if (/^((\.\.\/)+)([^\/].*$)/.test(href)) 
    { 
      //get the last part of the path, minus up-references 
      var lastpath = href.match(/^((\.\.\/)+)([^\/].*$)/); 
      lastpath = lastpath[lastpath.length - 1]; 

      //count the number of up-references 
      var references = href.split('../').length - 1; 

      //get the path parts and delete the last one (this page or directory) 
      var parts = loc.pathname.split('/'); 
      parts = parts.splice(0, parts.length - 1); 

      //for each of the up-references, delete the last part of the path 
      for (var i = 0; i < references; i++) 
      { 
        parts = parts.splice(0, parts.length - 1); 
      } 

      //now rebuild the path 
      var path = ''; 
      for (var j = 0; j < parts.length; j++) 
      { 
        if (parts[j] !== '') 
        { 
          path += '/' + parts[j]; 
        } 
      } 
      path += '/'; 

      //and add the last part of the path 
      path += lastpath; 

      //then add the path and input href to the base URI 
      uri += path; 
    } 

    //otherwise it's a relative path, 
    else 
    { 
      //calculate the path to this directory 
      path = ''; 
      parts = loc.pathname.split('/'); 
      parts = parts.splice(0, parts.length - 1); 
      for (var k = 0; k < parts.length; k++) 
      { 
        if (parts[k] !== '') 
        { 
          path += '/' + parts[k]; 
        } 
      } 
      path += '/'; 

      //then add the path and input href to the base URI 
      uri += path + href; 
    } 

    //return the final uri 
    return uri; 
  };
  
  /**
   * Parse a URI query string into an object of name value pairs.
   * See: http://safalra.com/web-design/javascript/parsing-query-strings/parseQueryString.js
   * See: http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type
   *
   * @param queryString the queryString to parse. This parameter is optional, 
   * and if it is not supplied then the query string from the current document's 
   * URL is used. The query string may start with a question mark, spaces may be 
   * encoded either as plus signs or the escape sequence '%20', and both ampersands 
   * and semicolons are permitted as separators.
   *
   * @return an object whose property names and values correspond to the decoded 
   * query string data. Because a single key may occur multiple times in a query 
   * string, the properties of the returned object are arrays of values.
   */
   
  utils.parseQueryString = function (qs) {

    var components, result = {}, i, pair, key, value;

    // if a query string wasn't specified, use the query string from the URI
    qs = qs || (location.search ? location.search : '');

    // remove the leading question mark if it is present
    if (qs.charAt(0) === '?') {
      qs = qs.substring(1);
    }
    
    // we don't want a spurious empty string key
    if (qs === "") {
      return {};
    }

    // replace plus signs in the query string with spaces
    qs = qs.replace(/\+/g, ' ');

    // split the query string around ampersands and semicolons
    components = qs.split(/[&;]/g);

    // loop over the query string components
    for (i = 0; i < components.length; i++) {
      pair = components[i].split('=');
      key = decodeURIComponent(pair[0]);
      value = decodeURIComponent(pair[1] || '');

      // update the parsed query data with this component's key-value pair
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(value);
    }

    return result;
  };

})();
