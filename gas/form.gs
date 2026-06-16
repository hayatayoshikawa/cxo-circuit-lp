/**
 * CXO AGENT 登録フォーム — Google Apps Script ウェブアプリ
 *
 * ▼ デプロイ手順
 * 1. Google スプレッドシートを新規作成し、シート名を「登録者一覧」にする
 * 2. 拡張機能 → Apps Script でこのコードを貼り付ける
 * 3. SPREADSHEET_ID を対象スプレッドシートのIDに書き換える
 *    （スプレッドシートのURLの /d/ と /edit の間の文字列）
 * 4. NOTIFY_EMAIL を通知先メールアドレスに書き換える
 * 5. デプロイ → 新しいデプロイ → ウェブアプリ
 *    - 実行するユーザー：自分
 *    - アクセスできるユーザー：全員
 * 6. デプロイURLをコピーして LP の GAS_ENDPOINT に貼り付ける
 */

var SPREADSHEET_ID = 'ここにスプレッドシートIDを入力';
var NOTIFY_EMAIL   = 'hayata.yoshikawa@playbackers.co.jp';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name    = data.name    || '';
    var email   = data.email   || '';
    var type    = data.type    || '';
    var comment = data.comment || '';

    // スプレッドシートに記録
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('登録者一覧') || ss.getActiveSheet();

    if(sheet.getLastRow() === 0){
      sheet.appendRow(['登録日時','氏名','メールアドレス','希望区分','コメント']);
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
      name,
      email,
      type,
      comment
    ]);

    // 通知メール送信
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '【CXO AGENT】新規登録：' + name,
      body: [
        '新規登録がありました。',
        '',
        '■ 氏名：'       + name,
        '■ メール：'     + email,
        '■ 希望区分：'   + type,
        '■ コメント：'   + (comment || '（なし）'),
        '',
        '登録日時：' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss')
      ].join('\n')
    });

    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ローカルテスト用（Apps Script エディタ上で直接実行可能） */
function testPost() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name:    'テスト 太郎',
        email:   'test@example.com',
        type:    '正社員での転職を希望',
        comment: 'テスト送信です'
      })
    }
  });
}
