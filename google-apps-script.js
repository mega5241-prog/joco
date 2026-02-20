// =============================================================
// 이 코드를 Google Apps Script에 붙여넣으세요
// (구글 스프레드시트 → 확장 프로그램 → Apps Script)
// =============================================================

function doPost(e) {
  // 동시 요청을 순서대로 처리하기 위한 잠금
  var lock = LockService.getScriptLock();

  try {
    // 최대 30초 대기 후 잠금 획득 (동시에 많이 와도 순서대로 처리)
    lock.waitLock(30000);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // 첫 행에 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['번호', '이름', '전화번호', '신청일시']);
    }

    // 데이터 추가
    var rowNumber = sheet.getLastRow(); // 헤더 제외한 번호
    sheet.appendRow([
      rowNumber,
      data.name,
      data.phone,
      data.timestamp
    ]);

    // 변경사항 즉시 반영
    SpreadsheetApp.flush();

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    // 잠금 해제 (다음 요청이 처리될 수 있도록)
    lock.releaseLock();
  }
}
