"use strict";(function(b){var a=function(){this.dispatch=function(d,f){var j=function(k,i,l){return k+(k.indexOf("?")>-1?"&":"?")+encodeURIComponent(i)+"="+encodeURIComponent(l);};if(typeof d!=="string"||d.length<1){return null;}if(typeof f==="object"){for(var h in f){if(typeof f[h]==="string"||typeof f[h]==="number"){d=j(d,h,f[h]);}else{if(!!f[h]&&f[h].constructor===Array){var c=f[h];for(var e=0;e<c.length;e++){if(typeof c[e]==="string"||typeof c[e]==="number"){d=j(d,h,c[e]);}}}}}}var g=document.createElement("img");g.src=d;return g;};};jsHub.dispatchViaImage=(new a()).dispatch;})();