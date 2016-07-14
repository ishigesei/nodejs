/*
 * spa.util_b.js
 * JaavScriptブラウザモジュール
*/

/*jslint browser:true, continue:true,
  devel:true, indent:2, maxerr:50,
  newcap:true, nomen:true, plusplus:true,
  regexp:true,sloppy:true, vars:false,
  white:true
*/
/*global $,spa, getComputedStyle */
spa.util_b = (function () {
  'use strict';
  /* ---------------モジュールスコープ変数開始 --------------- */
  var
    configMap = {
      regex_encode_html: /[&"'><]/g,
      regex_encode_noamp: /["'><]/g,
      html_encode_map : {
        '&': '&#38',
        '"': '&#34',
        "'": '&#39',
        '>': '&#62',
        '<': '&#60'
      }
    },
    decodeHtml, encodeHtml, getEmSize;

    configMap.encode_noamp_map = $.extend(
      {}, configMap.html_encode_map
    );
    delete configMap.encode_noamp_map['&'];
  /* ---------------モジュールスコープ変数終了 --------------- */

  /* ---------------ユーティリティメソッド開始 --------------- */
  // decodeHtml開始
  // HTMLエンティティをブラウザに適した方法でデコードする
  decodeHtml = function (str) {
    return $('<div/>').html(str || '').text();
  }
  // demodeHtml終了
  // encodeHtml開始
  // これはhtmlエンティティのための単一パスエンコーダであり、
  // 任意の文字に対応する
  encodeHtml = function ( input_arg_str, exculde_amp ) {
    var
      input_str = String(input_arg_str),
      regex, lookup_map
    ;
    if (exculde_amp) {
      lookup_map = configMap.html_noamp_map;
      regex = configMap.regex_encode_noamp;
    }
    else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html;
    }
    return input_str.replace(regex,
      function(match, name){
        return lookup_map[match] || '';
      }
    );
  };
  // encodeHtml終了
  // getEmSize開始
  // emのサイズをピクセルで返す
  getEmSize = function (elem) {
    return Number(
      getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  }
  // getEmSize終了
  /* ---------------ユーティリティメソッド終了 --------------- */

  /* ---------------パブリックメソッド開始 --------------- */
  // メソッドのエクスポート
  return {
    decodeHtml: decodeHtml,
    encodeHtml: encodeHtml,
    getEmSize: getEmSize
  };
  /* ---------------パブリックメソッド終了 --------------- */
}());
