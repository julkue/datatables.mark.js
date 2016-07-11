/*!***************************************************
 * datatables.mark.js
 * https://github.com/julmot/datatables.mark.js
 * Copyright (c) 2016, Julian Motz
 * Released under the MIT license https://git.io/voRZ7
 *****************************************************/
 "use strict";
 ((factory, window, document) => {
     if(typeof define === "function" && define.amd) {
         define(["jquery", "datatables.net", "markjs"], jQuery => {
             return factory(window, document, jQuery);
         });
     } else if(typeof exports === "object") {
         require("datatables.net");
         require("markjs");
         factory(window, document, require("jquery"));
     } else {
         factory(window, document, jQuery);
     }
 })((window, document, $) => {
     //<%= module %>
 }, window, document);
