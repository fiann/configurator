/** 
 * A plugin to parse the hPage syntax microformat and pass it to the
 * jsHub event hub for delivery.
 * 
 * The input data format is defined by http://jshub.org/hPage microformat
 * The output is a data object containing the fields listed in the event object
 * schema.
 * 
 * The field name mapping is:
 * <pre>
 *   "name" : "page-name"
 *   "title" : "page-title"
 *   "referrer" : "page-referrer"
 *   "type" : "page-type"
 *   "category" : "page-category"
 *   "attribute" : attributes object
 * </pre>
 *
 * @module data-capture
 * @class hPage-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jQuery, jsHub */
/*jslint strict: true */
"use strict";

YUI.add("hpage-capture", function (Y) {
  (function ($) {
  
    /*
     * Metadata about this plug-in for use by UI tools and the Hub
     */
    var metadata = {
      name: 'hPage Microformat Parser Plugin',
      id: 'hPage-plugin',
      version: 0.1,
      vendor: 'jsHub.org',
      type: 'microformat'
    };
    
    /*
     * First trigger an event to show that the plugin is being registered
     */
    jsHub.trigger("plugin-initialization-start", metadata);
    
    /**
     * Event driven anonymous function bound to 'page-view'
     * @method parse
     * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
     * @property metadata
     * @property propertyNames
     * @event  hpage-parse-start
     * @event  hpage-data-found
     * @event  hpage-parse-complete
     */
    var parse = function parse(event) {
    
      // Notify start lifecycle event
      jsHub.trigger("hpage-parse-start", event);
      
      /*
       * All local vars set here so nothing is accidentally made global.
       */
      var console, context, sources, hPage, properties;
      
      /*
       * Pass logging messages via jsHub Hub for remote error reporting, etc
       */
      console = jsHub.logger;
      
      /*
       * Where to start parsing for microformat data
       */
      if (event && event.data && event.data.context) {
        context = event.data.context;
      }
      
      /*
       * Extract the hPage from HTML DOM (not source code), excluding nested hPages
       * If a context is provided this is used as a starting point, else the whole
       * page is parsed as if there were a 'hpage' css class on the body element
       */
      sources = $('.hpage', context);
      sources = sources.not(sources.find('.hpage'));
      
      /*
       * The parser will populate an object to represent all the hPage data found in 
       * the context, according to the parsing rules.
       * This may involve merging data from multiple sources.
       */
      hPage = {};
      
      /*
       * Most classes and their values can be resolved using the Value Excerpting design-pattern
       */
      properties = {
        ".name": "page-name",
        ".title": "page-title",
        ".referrer": "page-referrer",
        ".type": "page-type",
        ".fragment": "page-fragment"
      };
      
      sources.each(function (idx, elm) {
      
        /*
         * Object for this hpage
         */
        var nodeData = {};
        
        // TODO resolve includes first
        
        // jQuery gives an empty string if the element / attribute is not present so cascade through values
      // to defaults
        var root = $(elm);
        
        /*
         * get the property data with failover to inherited or technographic data supplied by another plugin
         */
        // use the array of class names
        // TODO this can be refactored to the API
        $.each(properties, function (classname, fieldname) {
          var node, value;
          // exclude properties in nested hPages
          node = root.find(classname);
          node = node.not(node.find('.hpage'));
          value = node.getMicroformatPropertyValue(true);
          if (value !== null) {
            nodeData[fieldname] = value;
            nodeData[fieldname + "-source"] = metadata.id;
          }
        });
  
        /*
         * Merge the data for the singular fields from this hPage node, into the hPage for 
         * the whole context
         */
        // TODO: use data-indexes to override source order 
        $.extend(true, hPage, nodeData);
        
        // custom string handling for some properties, e.g. multi value properties
        var categories = [], categoryNodes = $('.category', elm);
        categoryNodes = categoryNodes.not(categoryNodes.find('.hpage .category'));
        categories = categoryNodes.excerptMultipleValues();
        if (categories !== null) {
          nodeData["page-category"] = categories;
          nodeData["page-category-source"] = metadata.id;
          // the categories for the overall hPage are the union of what was found previously
          // and in this node. NB $.unique uses identity not value so it doesn't strip duplicate strings
          hPage["page-category"] = (hPage["page-category"] || []);
          $.each(categories, function (idx, entry) {
            if ($(hPage["page-category"]).index(entry) === -1) {
              hPage["page-category"].push(entry);
            }
          });
        }
      
        // attributes use value class pattern http://microformats.org/wiki/value-class-pattern
        // we can have multiple attributes, each one has a type and a value
        // output in the data is an array: {name:[value, value], name:value}
        var attributes = $('.attribute', elm);
        attributes.each(function () {
          var attribute = $(this).excerptValueClassData(), type, value, allValues;
          if (attribute !== null) {
            type = attribute.type;
            value = attribute.value;
            hPage.attributes = (hPage.attributes || {});
            allValues = $.makeArray(hPage.attributes[type]); 
            $.merge(allValues, $.makeArray(value));
            var unique = []; 
            for (var i = 0; i < allValues.length; i++) {
              if ($.inArray(allValues[i], unique) === -1) {
                unique.push(allValues[i]);
              }
            }
            if (unique.length === 1) {
              unique = allValues[0];
            }
            hPage.attributes[type] = unique;
          }
        });
        
        jsHub.trigger("hpage-node-found", {
          count: idx + 1,
          element: elm,
          data: nodeData
        });
        
      });
      
      /*
       * The hPage for the context is only valid if the required fields are all present.
       * If not, don't put any of the data into the page view event.
       */
      if (hPage["page-name"]) {
        jsHub.trigger("hpage-found", {
          context: context,
          hpage: hPage
        });
      } else {
        hPage = null;
      }
    
      // Fire a debug event
      jsHub.trigger("hpage-parse-complete");
      return hPage;
    };
    
    /*
     * Bind the plugin to the Hub to look for hPage microformats and add the data
     * to page view events
     */
    jsHub.bind("page-view", metadata.id, parse);
    
    /*
     * Bind the plugin to the Hub to look for hPage microformats and add data to
     * page view events when AJAX loads a new partial page view
     */
    jsHub.bind("content-updated", metadata.id, parse);
    
    /*
     * Last trigger an event to show that the plugin has been registered
     */
    jsHub.trigger("plugin-initialization-complete", metadata);
    
  })(jQuery);
  
}, "2.0.0", {
  requires: ["microformats"], 
  after: ["microformats"]
});