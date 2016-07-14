// jQueryコレクションを作成する
var $t = $('<div/>');

// $tでグローバルカスタムイベントにテスト関数を登録する
$.gevent.subscribe($t, 'spa-login', function( event, user){
  console.log( 'Hello!',user.name);});

$.gevent.subscribe($t, 'spa-updatechat', function( event, chat_map ){
  console.log('Chat message:',chat_map);
});
$.gevent.subscribe($t, 'spa-setchatee', function( event, chatee_map){
  console.log( 'Chatee change:',chatee_map);});

$.gevent.subscribe($t, 'spa-listchange',
function( event, changed_list ){
  console.log( '*Listchange:',changed_list);});
/*$.gevent.subscribe($t, 'spa-listchange',function( event, changed_list){
  console.log( '*Listchange:', changed_list);});
*/

// サインインして3秒まつ。UIも更新される。
spa.model.people.login( 'Fanny');

// チャット相手を設定せずにメッセージを送信しょうとする
spa.model.chat.send_msg('Hi Pebbles!');

spa.model.chat.send_msg('What is up, tricks?');
spa.model.chat.set_chatee('id_03');

// peopleコレクションを取得する
var peopleDb = spa.model.people.get_db();

// コレクション内の全員の名前を表示する
peopleDb().each( function( person, idx) {console.log(person.name);});

// チャットに参加する
spa.model.chat.join();

var peopleDb = spa.model.people.get_db();
peopleDb().each( function( person, idx) {console.log(person.name);});


var $t = $('<div/>');
$.gevent.subscribe( $t, 'spa-login', function( event, user){
  console.log('Hello!', user.name); });

$.gevent.subscribe( $t, 'spa-listchange', function( event, changed_list ){
  console.log('*Listchange:', changed_list);
});

spa.model.people.login ('Jessy');

var person = spa.model.people.get_by_cid( 'id_03');
JSON.stringify( person.css_map);

spa.model.chat.update_avatar({
  person_id : 'id_03', css_map :{}
});
person = spa.model.people.get_by_cid( 'id_03');
