/**
 * 
 * Rollup module for all microformat plugins
 * @module microformats-capture
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub, jQuery */
"use strict";

YUI.add('microformats-capture', function (Y) {
  Y.log('microformats-capture module loaded', 'info', 'jsHub');
}, '2.0.0' , {
  requires: ['microformats', 'hauthentication-capture', 'hpage-capture', 'hproduct-capture', 'hpurchase-capture'], 
  after: ['microformats']
});