function doGet() {
  return HtmlService.createTemplateFromFile('Credit-Management-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Credit Management Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getPrepaidCreditData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('(CM) Prepaid');
    if (!sheet) return JSON.stringify([]);
    const lastRow = sheet.getLastRow();
    const lastCol = 11;
    if (lastRow < 2) return JSON.stringify([]);
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();
    const filteredData = values.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    return JSON.stringify(filteredData);
  } catch (error) {
    return JSON.stringify([]);
  }
}

function getPrepaidDevices() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('D Prepaid');
    if (!sheet) {
      throw new Error('Sheet "D Prepaid" not found. Please make sure the sheet exists.');
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return []; 
    }

    const dataRange = sheet.getRange(2, 1, lastRow - 1, 5);
    const values = dataRange.getValues();
    const devices = values
      .filter(row => row[0] && row[1]) 
      .map(row => ({
        id: row[0],
        serial: row[1],
        clientId: row[2] || '',
        clientName: row[3] || '',
        creditPurchaseOptions: row[4] || ''
      }));
    return devices;
  } catch (error) {
    console.error('Error in getPrepaidDevices:', error);
    throw new Error('Failed to load devices data: ' + error.message);
  }
}

function addPrepaidRecord(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Prepaid');
    if (!sheet) throw new Error('Sheet "(CM) Prepaid" not found.');

    const colA = sheet.getRange("A2:A").getValues();
    let nextRow = colA.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;

    const topUpJSON = data.topUp ? JSON.stringify(data.topUp) : '';

    sheet.getRange(nextRow, 1).setValue(new Date());
    sheet.getRange(nextRow, 2).setValue(data.clientId);
    sheet.getRange(nextRow, 3).setValue(data.clientName);
    sheet.getRange(nextRow, 4).setValue(data.deviceId);
    sheet.getRange(nextRow, 6).setValue(data.balance);
    sheet.getRange(nextRow, 7).setValue(topUpJSON);

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    const paymentStatus = paymentDate ? 'Paid' : (data.paymentStatus || '');
    sheet.getRange(nextRow, 8, 1, 2).setValues([[paymentDate, paymentStatus]]);

    return { success: true, message: 'Record added successfully' };
  } catch (error) {
    throw new Error('Failed to add record: ' + error.message);
  }
}

function updatePrepaidRecord(rowIndex, data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Prepaid');
    if (!sheet) throw new Error('Sheet "(CM) Prepaid" not found.');

    const sheetRow = rowIndex + 2;
    const topUpJSON = data.topUp ? JSON.stringify(data.topUp) : '';

    sheet.getRange(sheetRow, 2).setValue(data.clientId);
    sheet.getRange(sheetRow, 3).setValue(data.clientName);
    sheet.getRange(sheetRow, 4).setValue(data.deviceId);
    sheet.getRange(sheetRow, 6).setValue(data.balance);
    sheet.getRange(sheetRow, 7).setValue(topUpJSON);

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    const paymentStatus = paymentDate ? 'Paid' : (data.paymentStatus || '');
    sheet.getRange(sheetRow, 8).setValue(paymentDate);
    sheet.getRange(sheetRow, 9).setValue(paymentStatus);

    return { success: true, message: 'Record updated successfully' };
  } catch (error) {
    throw new Error('Failed to update record: ' + error.message);
  }
}

