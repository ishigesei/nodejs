/*
 * spa.js
 * ルート名前空間モジュール
*/

/*jslint  browser:true, continue:true,
  devel:true, indent:2, maxerr:50,
  newcap:true, nomen: true, plusplus :true,
  regexp: true, sloppy: true, vars:false,
  white:true
*/
/*global $, spa　*/

var spa = (function () {
  'use strinct';
  var initModule = function ($container) {
    spa.data.initModule();
    spa.model.initModule();
    spa.shell.initModule( $container);
  };

  return { initModule:initModule};
}());
