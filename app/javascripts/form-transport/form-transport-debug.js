/**
 * Data transport via Form submission to an iFrame 
 * Creates an HTML form in the DOM and encodes the data into the POST body for sending to a server.
 * The form is submitted to a named iframe for asynchronous cross domain delivery.
 * used in plugins
 * @module form-transport
 * @class FormTransport
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub, ActiveXObject */
"use strict";

(function () {

  var FormTransport = function () {

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
     * @return Object with references to the document, form and iframe that has been created
     */
    this.dispatch = function (method, url, data) {
      var timestamp = + new Date(), 
        doc = document, 
        msie = (/MSIE/).test(navigator.userAgent),
        form, 
        formID = "jshub-form-" + timestamp, 
        iframe, 
        iframeID = "jshub-iframe-" + timestamp, 
        htmlelements;
      
      /*
       * This data transport only supports POST or GET
       */
      if (!(/^POST|GET$/i.test(method)) || !url || (/^javascript:|file:/i.test(url))) {
        return false;
      }
      data = data || {}; // NOTE - why would we send an empty request? For cookies/referer info?
    
      // Create the form
      form = doc.createElement("form");
      form.id = formID;
      // FIXME form.method doesn't seem to work in our Envjs - need to update to 1.1?
      form.method = method;
      form.action = url;
      form.style.visibility = "hidden";
      form.style.position = "absolute";
      form.style.top = 0;
      form.style.cssClass = "jshub-form";

      // remove any existing fields
      while (form.hasChildNodes()) {
        form.removeChild(form.lastChild);
      }

      /**
       * Recurse over the data and add a hidden field to the form based on the values supplied
       * Arrays result in multiple inputs with the same name
       * @param {Object} value
       * @param {Object} prop
       */
      jsHub.util.each(data, function appendField(value, prop) {
        var i, input;
        if (typeof value === 'string' || typeof value === 'number') {
          //In a ActiveXObject('htmlfile') IE won't let you assign a name using the DOM in an object, must do it the hacky way
          if (msie) {
            input = doc.createElement('<input name="' + prop + '" />');
          } else {          
            input = doc.createElement("input");
            input.name = prop;
          }
          input.type = "hidden";
          input.value = value;
          form.appendChild(input);
        } else if (jsHub.util.isArray(value)) {
          // TODO improve array test for security: http://blog.360.yahoo.com/blog-TBPekxc1dLNy5DOloPfzVvFIVOWMB0li?p=916
          for (i = 0; i < value.length; i++) {
            if (typeof value[i] === 'string' || typeof value[i] === 'number') {
              appendField(value[i], prop);
            }
          }
        } else {
          jsHub.logger.error("This value cannot be converted for transport");
        }        
      });

      // Create the iframe
      //IE won't let you assign a name using the DOM, must do it the hacky way
      if (msie) {
        iframe = doc.createElement('<iframe name="' + iframeID + '" />');
      } else {
        iframe = doc.createElement("iframe");
        iframe.name = iframeID;
      }

      iframe.id = iframeID;
      // TODO - work out which src is better for history handling
      iframe.src = "#";
      //iframe.src = "javascript:false";
      iframe.style.visibility = "hidden";
      iframe.style.position = "absolute";
      iframe.style.top = 0;
      iframe.style.cssClass = "jshub-iframe";
 
      /*
        add the generated elements to the document, or htmlfile object for IE to stop navigation clicks    
        NOTE: htmlfile wont work in IE Server 2003 see slides  http://www.slideshare.net/joewalker/comet-making-the-web-a-2way-medium
        ref: http://www.julienlecomte.net/blog/2007/11/30/
        ref: http://cometdaily.com/2007/11/18/ie-activexhtmlfile-transport-part-ii/      
        ref: http://grack.com/blog/2009/07/28/a-quieter-window-name-transport-for-ie/
        TODO: may need CollectGarbage(); see thread http://groups.google.com/group/orbited-users/browse_thread/thread/e337ac03d0c9f13f
      */
      if (msie) {
        jsHub.logger.log('IE specific branch to avoid navigational clicks');
        try {
          if ("ActiveXObject" in window) {
            doc = new ActiveXObject("htmlfile");
            doc.open();
            doc.write('<html><head><\/head><body><\/body><\/html>');
            doc.body.innerHTML = form.outerHTML + iframe.outerHTML;
            doc.close();
            // get new references to the elements for binding events too, etc
            form = doc.getElementById(form.id);
            iframe = doc.getElementById(iframe.id);

            jsHub.logger.log('IE ActiveXObject("htmlfile") created: %o', doc);
          }
        } catch (e) {
          jsHub.logger.error('IE ActiveXObject("htmlfile") error: %o', e.message);
        }
        
      } else {
        doc.body.appendChild(form);
        doc.body.appendChild(iframe);
      }
      
      // check elements created sucessfully
      if (!form) {
        jsHub.logger.error('Form Transport form creation error');
      }
      // some older browsers do not return null for a failed iframe creation so check the nodeType
      if (!iframe || typeof (iframe.nodeType) === 'undefined') {
        jsHub.logger.error('Form Transport iframe creation error');
      }

      // store references
      htmlelements = {"doc": doc, "form": form, "url" : form.action, "iframe": iframe};

      // NOTE - for future use give us an opportunity to know when the transport is complete 
      iframe.transportState = 0;
      
      // In IE iframe.onload does not necessarily mean the iframe page itself has loaded? But it seems to work
      // ref: http://support.microsoft.com/kb/239638
      // see comments: http://msdn.microsoft.com/en-us/library/ms535258(VS.85).aspx
      iframe.onload = function () {
        jsHub.trigger("form-transport-complete", htmlelements);
        
        // remove form and iframe to clean DOM and prevent "resubmit the form" dialogs
        form.parentNode.removeChild(form);
        iframe.parentNode.removeChild(iframe);
      };
      // TODO clear iframe cache etc
      iframe.onunload = function () {};
  
      // Set the iframe as the submission target of the form, tied together by the timestamp
      form.target = iframe.id;
      // Submit the form, sent via the iframe
      form.submit();            
      jsHub.trigger("form-transport-sent", htmlelements);
            
      return htmlelements;
    };
  };
  
  jsHub.dispatchViaForm = (new FormTransport()).dispatch;

})();
    