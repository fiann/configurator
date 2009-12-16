/**
 * Rollup module for all microformat plugins
 * @module microformats
 */

/*global YUI, jsHub */
"use strict";

YUI.add('microformats', function (Y) {
}, '2.0.0', {
  requires: ['hauthentication-capture', 'hpage-capture', 
    'hproduct-capture', 'hpurchase-capture']
})
