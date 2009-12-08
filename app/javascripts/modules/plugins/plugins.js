/**
 * Enhancements to jQuery for common functions 
 * used in plugins
 * @module utilities
 * @class PluginAPI
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global YUI, jsHub */
"use strict";

YUI.add('plugins', function (Y) {
    
  var PluginAPI = {

    /** 
     * Fix relative pathed URLs
     * ref: http://www.sitepoint.com/blogs/2007/08/10/dealing-with-unqualified-href-values/
     * TODO: pass in context to account for BASE or IFRAME variations
     * @method qualifyHREF
     * @param href {string} The href to qualify, e.g. page.html, ../page.html, /page.html
     * @return {string}     Full qualified URI
     */
    qualifyHREF: function (href) {
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
    }
  };
  /*
   * Add the API as global functions on the core jsHub object
   */
  Y.mix(jsHub, PluginAPI);

}, '2.0.0' , {
  requires: ['hub'], 
  after: ['hub']
});
