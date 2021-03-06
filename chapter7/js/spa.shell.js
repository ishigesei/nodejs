/*
 * spa.shell.js
 * SPAのシェルモジュール
*/

/*jslint browser: true, continue: true,
  devel: true, indent: 4, maxerr: 50,
  newcap: true, nomen: true, plusplus: true,
  regexp: true, sloppy:true, vars: false,
  white: true
*/
/*global $, spa */
spa.shell = (function(){
  'use strict';
  //----モジュールスコープ変数開始----
  // 名前空間(spa.shell)全体で利用できるすべての変数を宣言
  // configMapに静的な構成値を配置
  var
      configMap = {
          // 検証のためにuriAnchorが使うマップを定義する
          anchor_schema_map: {
              chat: {
                  opened: true,
                  closed: true
              }
          },
          resize_interval: 200,
          main_html: String()
              + '<div class="spa-shell-head">'
                  + '<div class="spa-shell-head-logo">'
                  + '<h1>SPA</h1>'
                  + '<p>javascript end to end</p>'
                  + '</div>'
                  + '<div class="spa-shell-head-acct"></div>'
                  // + '<div class="spa-shell-head-search"></div>'
              + '</div>'
              + '<div class="spa-shell-main">'
                  + '<div class="spa-shell-main-nav"></div>'
                  + '<div class="spa-shell-main-content"></div>'
              + '</div>'
              + '<div class="spa-shell-foot"></div>'
              + '<div class="spa-shell-modal"></div>',

          // 「開発者がスライダーの動きと高さを設定できるようにする」ために、
          // モジュール構成マップで、拡大の時間と高さを設定する
          // chat_extend_time: 1000,
          // chat_retract_time: 300,
          // chat_extend_height: 450,
          // chat_retract_height: 15,

          // ユーザ動作を促すツールチップテキストを表示するため、
          // cofingMapに格納と拡大時のタイトルテキストを追加
          // chat_extended_title: 'Click to retract',
          // chat_retracted_title: 'Click to extend'
      },

      // モジュール全体で共有する動的情報をstateMapに配置
      stateMap = {
          $container: undefined,
          // マップの現在のアンカー値を
          // モジュール状態stateMap.anchor_mapに格納する
          anchor_map: {},
          resize_idto: undefined
      },
      // jqueryMapに、jQueryコレクションをキャッシュ
      jqueryMap = {},

      // このセクションですべてのモジュールスコープ変数を宣言する
      // その多くはのちに割り当てる
      copyAnchorMap,
      setJqueryMap,
      changeAnchorPart,
      onHashchange,
      onResize,
      onTapAcct,
      onLogin,
      onLogout,
      setChatAnchor,
      initModule;
      //----モジュールスコープ変数終了----

      //---- ユーティリティメソッド開始 ----
      // ページとやり取りしない関数のための「ユーティリティメソッド」セクションを用意

      // 格納したアンカーマップのコピーを返す。オーバーヘッドを最低限にする。
      // jQueryユーティリティextend()を使ってオブジェクトをコピーする
      // JavaScriptオブジェクトは全て参照で渡され、正しくコピーすることが重要
      copyAnchorMap = function(){
          return $.extend(true, {}, stateMap.anchor_map);
      };

      //---- ユーティリティメソッド終了 ----

      //---- DOMメソッド開始 ----
      //-------- DOMメソッド/setJqueryMap/開始
      // setJqueryMapを使って、jQueryコレクションをキャッシュ
      // この関数は、記載するほとんどすべてのシェルと機能モジュールに存在する
      // jqueryMapキャッシュを使うと、jQueryのドキュメントトラバーサル数を大幅に減らし、
      // 性能を改善できる
      setJqueryMap = function(){
          var $container = stateMap.$container;
          jqueryMap = {
              $container: $container,
              $acct     : $container.find('.spa-shell-head-acct'),
              $nav      : $container.find('.spa-shell-main-nav')
          };
      };
      //-------- DOMメソッド/setJqueryMap/終了
      // ------- DOMメソッド/changeAnchroPart/開始
      // 目的：URIアンカー要素部分を変更する
      // 引数：
      //  * arg_map - 変更したいURI部分を表すマップ
      // 戻り値：boolean
      //  * true - URIのアンカー部分が更新された
      //  * false - URIのアンカー部分が更新できなかった
      // 動作：
      // 現在のアンカーをstateMap.anchor_mapに格納する
      // エンコーディングの説明はuriAnchorを参照
      // このメソッドは
      //  * copyAnchorMap()を使って子のマップのコピーを作成する
      //  * arg_mapを使ってキーバリューを修正する
      //  * エンコーディングの独立値と従属値の区別を管理する
      //  * uriAnchorを使ってURIの変更を試みる
      //  * 成功時はtrue, 失敗時にはfalseを返す
      //
      changeAnchorPart = function(arg_map){
          var
              anchor_map_revise = copyAnchorMap(),
              bool_return = true,
              key_name,
              key_name_dep;

          //-------- アンカーマップへ変更を統合開始
          KEYVAL:
          for(key_name in arg_map){
              if (arg_map.hasOwnProperty(key_name)){
                  // 反復中に従属キーを飛ばす
                  if (key_name.indexOf('_') === 0){
                      continue KEYVAL;
                  }

                  // 独立キー値を更新する
                  anchor_map_revise[key_name] = arg_map[key_name];

                  // 合致する独立するキーを更新する
                  key_name_dep = '_' + key_name;
                  if (arg_map[key_name_dep]){
                      anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                  }
                  else {
                      delete anchor_map_revise[key_name_dep];
                      delete anchor_map_revise['_s' + key_name_dep];
                  }
              }
          }
          //-------- アンカーマップへ変更を統合終了

          //--------URIの更新開始
          // 成功しなければ元に戻す
          try {
              $.uriAnchor.setAnchor(anchor_map_revise);
          }
          catch(error){
              // URIを既存の状態に置き換える
              $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
              bool_return = false;
          }
          //-------- URIの更新終了

          return bool_return;
      };
      // ------- DOMメソッド/changeAnchroPart/終了

      //---- イベントハンドラ開始 ----
      //-------- イベントハンドラ/onHashchange/開始
      // 目的：hashchangeイベントを処理する
      // 引数：
      //  * event - jQueryオブジェクト
      // 設定：　なし
      // 戻り値： false
      // 動作：
      //  * URIアンカー要素を解析する
      //  * 提示されたアプリケーション状態と現在の状態を比較する
      //  * 提示された状態が既存の状態と異なり、アンカースキーマで許可されている場合のみ
      //    アプリケーションを調整する
      //
      onHashchange = function(event){
          var
              _s_chat_previous,
              _s_chat_proposed,
              s_chat_proposed,
              anchor_map_proposed,
              is_ok = true,
              anchor_map_previous = copyAnchorMap();
              // anchor_map_previous = copyAnchorMap(),
              // anchor_map_proposed,
              // _s_chat_previuos,
              // _s_chat_proposed,
              // s_chat_proposed;

          // アンカーの解析を試みる
          try {
              anchor_map_proposed = $.uriAnchor.makeAnchorMap();
          }
          catch(error) {
              $.uriAnchor.setAnchor(anchor_map_previous, null, true);
              return false;
          }
          stateMap.anchor_map = anchor_map_proposed;

          // 便利な変数
          _s_chat_previous = anchor_map_previous._s_chat;
          _s_chat_proposed = anchor_map_proposed._s_chat;

          //-------- 変更されている場合のチャットコンポーネントの調整開始
          if (!anchor_map_previous
              || _s_chat_previous !== _s_chat_proposed)
          {
              s_chat_proposed = anchor_map_proposed.chat;
              switch(s_chat_proposed){
                  case 'opened':
                      is_ok = spa.chat.setSliderPosition('opened');
                      break;
                  case 'closed':
                      is_ok = spa.chat.setSliderPosition('closed');
                      break;
                  default:
                      spa.chat.setSliderPosition('closed');
                      delete anchor_map_proposed.chat;
                      $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
              }
          }
          //-------- 変更されている場合のチャットコンポーネントの調整終了

          //-------- スライダーの変更が拒否された場合にアンカーを元に戻す処理を開始
          if (!is_ok){
              if (anchor_map_previous){
                  $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                  stateMap.anchor_map = anchor_map_previous;
              }
              else {
                  delete anchor_map_proposed.chat;
                  $.uriAnchor.setAnchor(anchor_map_proposed, null ,true);
              }
          }
          //-------- スライダーの変更が拒否された場合にアンカーを元に戻す処理を終了
      };
      //-------- イベントハンドラ/onHashchange/終了

      //-------- イベントハンドラ/onResize/開始
      onResize = function(){
          if (stateMap.resize_idto) { return true; }

          spa.chat.handleResize();
          stateMap.resize_idto = setTimeout(
              function(){
                  stateMap.resize_idto = undefined;
              },
              configMap.resize_interval
          );
          return true;
      };
      //-------- イベントハンドラ/onResize/終了
      // イベントハンドラ/onTapAcct/開始
      onTapAcct = function ( event ) {
        var acct_text, user_name, user = spa.model.people.get_user();
        if (user.get_is_anon()) {
          user_name = prompt('Please sigin-in');
          spa.model.people.login( user_name);
          jqueryMap.$acct.text( '...processing...');
        }
        else {
          spa.model.people.logout();
        }
        return false;
      };
      // イベントハンドラ/onTapAcct/終了
      // イベントハンドラ/onLogin/開始
      onLogin = function( event, login_user ){
        jqueryMap.$acct.text( login_user.name);
      };
      // イベントハンドラ/onLogin/終了
      // イベントハンドラ/onLogout/開始
      onLogout = function ( event, logout_user ) {
        jqueryMap.$acct.text( 'Please sigin-in');
      };
      // イベントハンドラ/onLogout/終了

      //---- イベントハンドラ終了 ----

      //---- コールバック開始
      //-------- コールバックメソッド/setChatAnchor/開始
      // 用例：setChatAnchor('closed');
      // 目的：アンカーのチャットコンポーネントを変更する
      // 引数：
      //  * position_type - `closed`または`opened`
      // 動作：
      //  可能ならURLアンカーパラメータ`chat`を要求値に変更する
      // 戻り値：
      //  * true - 要求されたアンカー部分が更新された
      //  * false - 要求されたアンカー部分が更新されなかった
      // 例外発行：なし
      //
      setChatAnchor = function(position_type){
          return changeAnchorPart({ chat: position_type });
      };
      //-------- コールバックメソッド/setChatAnchor/終了
      //---- コールバック終了


      //---- パブリックメソッド開始 ----
      // パブリックに利用可能なメソッドを「パブリックメソッド」セクションに配置する

      //-------- パブリックメソッド/initModule/開始
      // 用例：spa.shell.initModule($('#app_div_id'));
      // 目的：ユーザに機能を提供するようにチャットに指示する
      // 引数：
      //  * $append_target (例：$('#app_div_id'))
      //  一つのDOMコンテナを表すjQueryコレクション
      // 動作：
      //  $containerにUIのシェルを含め、機能モジュールを構成して初期化する
      //  シェルはURIアンカーやCookieの管理などのブラウザ全体に及ぶ問題を担当する
      // 戻り値：なし
      // 例外発行：なし
      //
      // モジュールの初期化に使う
      initModule = function($container){
          // HTMLをロードし、jQueryコレクションをマッピングする
          stateMap.$container = $container;
          $container.html(configMap.main_html);
          setJqueryMap();

          // チャットスライダーを初期化し、イベントハンドラをクリックイベントにバインドする
          // stateMap.is_chat_retracted = true;
          // jqueryMap.$chat
          //     .attr('title', configMap.chat_retracted_title)
          //     .click(onClickChat);

          // 切り替えをテストする
          // ページロードの3秒後にスライダーを拡大し、8秒後に格納する
          // setTimeout(function() { toggleChat(true); }, 3000);
          // setTimeout(function() { toggleChat(false); }, 8000);

          // スキーマに対してテストするように、uriAnchorプラグインを設定する
          $.uriAnchor.configModule({
              schema_map: configMap.anchor_schema_map
          });

          // 機能モジュールを構成しして初期化する
          spa.chat.configModule({
              set_chat_anchor: setChatAnchor,
              chat_model: spa.model.chat,
              people_model: spa.model.people
          });
          spa.chat.initModule(jqueryMap.$container);

          spa.avtr.configModule({
            chat_model :spa.model.chat,
            people_model : spa.model.people
          });
          spa.avtr.initModule(jqueryMap.$nav);

          // URIアンカーベントを処理する
          // これはすべての機能モジュールを設定して初期化した後に行う
          // そうしないと、トリガーイベントを処理できる状態になっていないため
          // トリガーイベントはアンカーがロード状態とみなせることを保証するために使う
          // ->ブックマークが初期ロード状態であるとモジュールがみなすよう、
          //   hashchangeイベントハンドラをバインドしてすぐに発行する
          $(window)
              .bind('resize', onResize)
              .bind('hashchange', onHashchange)
              .trigger('hashchange');
          $.gevent.subscribe ( $container, 'spa-login', onLogin);
          $.gevent.subscribe ( $container, 'spa-logout', onLogout);

          jqueryMap.$acct
            .text( 'Please sigin-in')
            .bind( 'utap', onTapAcct);
      };
      // パブリックメソッド/initModule/終了
      // mapにパブリックメンバを戻すことで、明示的にパブリックメソッドをエクスポートする
      // 現在はinitModuleだけを利用できる
      return { initModule: initModule };
      //---- パブリックメソッド終了 ----
}());
