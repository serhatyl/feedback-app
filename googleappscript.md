const lockTime = 100;

function doPost(e) {
const spreadSheetId = e.parameter.spreadSheetId;
const sheetName = e.parameter.sheetName;

if (!spreadSheetId || !sheetName) {
return ContentService.createTextOutput(
JSON.stringify({
result: false,
error: "Missing parameters: spreadSheetId and sheetName are required",
})
).setMimeType(ContentService.MimeType.JSON);
}

const lock = LockService.getScriptLock();
lock.tryLock(lockTime);

try {
const doc = SpreadsheetApp.openById(spreadSheetId);
const sheet = doc.getSheetByName(sheetName);

    if (sheet.getLastRow() == 0) {
      const requiredHeaders = ['customerFullName', 'feedbackMessage', 'date'];
      sheet.appendRow(requiredHeaders);
    }

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function (header) {
      switch (header) {
        case "no":
          return nextRow - 1;
        case "date":
          return new Date().toISOString();
        default:
          return e.parameter[header];
      }
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(
      JSON.stringify({ result: true, row: nextRow })
    ).setMimeType(ContentService.MimeType.JSON);

} catch (e) {
return ContentService.createTextOutput(
JSON.stringify({ result: false, error: e })
).setMimeType(ContentService.MimeType.JSON);
} finally {
lock.releaseLock();
}
}
