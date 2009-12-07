/**
 * Enhancements to jQuery for common functions 
 * used in plugins
 * @module data-capture
 * @class PluginAPI
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub, jQuery, Date */
"use strict";
 
(function () {
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
   * Add the API as global functions on the core jQuery object
   */
  var $ = jsHub.safe('$');
  $.extend($, PluginAPI);
})();


/**
 * Enhancements to jQuery for common functions
 * used in microformat plugins
 * @module data-capture
 * @class MicroformatAPI
 */
/*--------------------------------------------------------------------------*/

(function () {
  var MicroformatAPI = {
  	
    /**
     * Implements value excepting rules for working out the value of a property
     * @method getMicroformatPropertyValue
     * @parmeter last {boolean} optional flag to return only the last source ordered value rather than concatenate multiple values
     * @parameter separator {string} optional sepeartor to use to concatenate multiple values
     * default separator is ', ' if not specified
     * @return The value of the property or null
     */
    getMicroformatPropertyValue: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = null, sources;
	  
      /*
       * <abbr> design pattern (contriversial)
       * ref: http://microformats.org/wiki/abbr-design-pattern
       */
      if (jQuery(this).find('abbr').length === 1) {
        value = jQuery(this).find('abbr').attr('title');
      }
	  
      /*
       * get value from explicit 'value' declarations
       */
      else {
        sources = jQuery(this).find('.value');
        sources = sources.not(sources.find('.value'));
        if (sources.length === 1) {
          value = sources.html();
        }

        /*
         * get value from multiple value elements, e.g. categories or nested formats
         * these are concatenated according to whitespace rules
         */
        else if (sources.length > 1) {
          value = '';
          jQuery.each(sources, function (idx, elm) {
            separator = separator || ' ';
            value += jQuery(elm).text();
            // if this is the last value we don't want an extra separator
            if (idx !== sources.length - 1) {
              value += separator;
            }
          });
        }

        /*
         * get last value from multiple value elements, e.g. categories or nested formats
         * these are overriden according to source order rules
         */
        else if (jQuery(this).text() !== '' && this.length > 1 && last === true) {
          jQuery.each(this, function (idx, elm) {
            value = jQuery(elm).text();
          });
        }
        
        /*
         * finally use the contained text as the value (removes HTML tags)
         */
        else if (jQuery(this).html() !== '') {
          value = jQuery(this).html();
        }
      }
      
      /*
       * trim whitespace at beginning and end of value
       */
      if (value !== null) {
        value = jQuery.trim(value);
        value = value.replace(/\s+/g, ' ');
      }
      
      return value;
    },
    
    /**
     * Implements value excepting rules for working out the value of a property
     * @method excerptMultipleValues
     * @return An array containing all values found for the property or null
     */
    excerptMultipleValues: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = [], node = jQuery(this), sources;
	  
      /*
       * get value from explicit 'value' declarations
       */
      sources = node.find('.value');
      sources = sources.not(sources.find('.value'));
      if (sources.length >= 1) {
        jQuery.each(sources, function (idx, elm) {
          var nodeValue = sources.text().split(/\s+/);
          jQuery.each(nodeValue, function (entry) {
            value.push(entry);
          });
        });
      }

      /*
       * or use the contained text as the value (removes HTML tags).
       * $(node).text() concatenates multiple node text without any separator, so we have
       * to split each value, not the whole string.
       */
      else if (node.text() !== '') {
        node.each(function () {
          jQuery.each(jQuery(this).text().split(/\s+/), function (idx, word) {
            value.push(word);
          });
        });
      }
      
      return (value.length > 0) ? value : null;
    },
    
    /**
     * Implements value class pattern excepting rules for working out the value of a property
     * @method excerptValueClassData
     * @return a JSON object containing the fields <code>type</code> and <code>value</code> if
     * present, or null if no data is found
     */
    excerptValueClassData: function () {
    
      /*
       * Default value if not specified is 'true'
       */
      var type, value, defaultValue = 'true', typeNodes = jQuery(this).find('.type'), valueNodes;
	  
	  
      /*
       * If the type is not specified, then the whole content of the attribute node is the
       * type, and the default value is implied. If the whole content is empty, the attribute 
       * invalid.
       */
      if (typeNodes.length === 0) {
        type = jQuery(this).html();
        if (type === "") {
          return null;
        }
        return {
          type: type,
          value: defaultValue
        };
      }
	  
	  /*
	   * If a single .type node is found, then concatenate .value nodes, or use the default
	   * value if no .value nodes are found.
	   */
	  else if (typeNodes.length === 1) {
        type = typeNodes.html();
        valueNodes = jQuery(this).find('.value');
        valueNodes = valueNodes.not(valueNodes.find('.value'));
        if (valueNodes.length === 0) {
          value = defaultValue;
        } else {
          value = "";
          valueNodes.each(function () {
            value += jQuery(this).html();
          });
        }
        return {
          type: type,
          value: value
        };
      }

      /*
       * If there is more than one .type node, the context is not valid
       */
      return null;
    }
    
  };
  
  /*
   * Add the API as object methods on the any jQuery object
   */
  var $ = jsHub.safe('$');
  $.extend($.fn, MicroformatAPI);
})(jQuery);