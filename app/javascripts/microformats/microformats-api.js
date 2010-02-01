/**
 * Enhancements to jQuery for common functions
 * used in microformat plugins
 * @module microformats
 * @class MicroformatAPI
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub, jQuery */
"use strict";


(function ($) {

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
      if ($(this).find('abbr').length === 1) {
        value = $(this).find('abbr').attr('title');
      }
    
      /*
       * get value from explicit 'value' declarations
       */
      else {
        sources = $(this).find('.value');
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
          $.each(sources, function (idx, elm) {
            separator = separator || ' ';
            value += $(elm).text();
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
        else if ($(this).text() !== '' && this.length > 1 && last === true) {
          $.each(this, function (idx, elm) {
            value = $(elm).text();
          });
        }
        
        /*
         * finally use the contained text as the value (removes HTML tags)
         */
        else if ($(this).html() !== '') {
          value = $(this).html();
        }
      }
      
      /*
       * trim whitespace at beginning and end of value
       * jsHub.util.trim normalizes &nbsp; entities to spaces
       */
      value = jsHub.util.trim(value);
      
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
      var value = [], node = $(this), sources;
    
      /*
       * get value from explicit 'value' declarations
       */
      sources = node.find('.value');
      sources = sources.not(sources.find('.value'));
      if (sources.length >= 1) {
        $.each(sources, function (idx, elm) {
          var nodeValue = sources.text().split(/\s+/);
          $.each(nodeValue, function (entry) {
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
          $.each($(this).text().split(/\s+/), function (idx, word) {
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
     * present, or null if no data is found. The <code>value</code> field will be a string if
     * there is a single value, or an array of strings if there are multiple values found.
     */
    excerptValueClassData: function () {
    
      /*
       * Default value if not specified is 'true'
       */
      var type, value, defaultValue = 'true', typeNodes = $(this).find('.type'), valueNodes;
    
    
      /*
       * If the type is not specified, then the whole content of the attribute node is the
       * type, and the default value is implied. If the whole content is empty, the attribute 
       * invalid.
       */
      if (typeNodes.length === 0) {
        type = $(this).html();
        if (type === "") {
          return null;
        }

        /*
         * trim whitespace at beginning and end of the type
         */
        type = jsHub.util.trim(type);

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
        valueNodes = $(this).find('.value');
        valueNodes = valueNodes.not(valueNodes.find('.value'));
        if (valueNodes.length === 0) {
          value = defaultValue;
        } else if (valueNodes.length === 1) {
          value = $(valueNodes[0]).html();
        } else {
          value = [];
          valueNodes.each(function () {
            value.push($(this).html());
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
  $.extend($.fn, MicroformatAPI);
    
})(jQuery);
