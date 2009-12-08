/**
 * jsHub tag module dependencies and configuration
 * @module use
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI */
"use strict";

/**
 * This pseudo-module is only used by the combo service to allow for the 
 * generation of an executable tag that can be loaded via a <script> tag.
 * The default '*' (use all modules) token is replaced at runtime by the 
 * requested module list.
 */
YUI().use('*', function (Y, result) {
  if (!result.success) {
    Y.log('Module load failure: ' + result.msg, 'warn', 'jsHub');
  } else {
    Y.log('Modules loaded', 'info', 'jsHub');
  }
});
  