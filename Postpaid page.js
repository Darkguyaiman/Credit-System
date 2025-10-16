function doGet() {
  return HtmlService.createTemplateFromFile('Credit-Management-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Credit Management Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// <CHANGE> Updated to read from (CM) Postpaid sheet with new column structure
function getCreditDataPostpaid() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('(CM) Postpaid');
    if (!sheet) return JSON.stringify([]);
    const lastRow = sheet.getLastRow();
    const lastCol = 16; // Up to column P (Current Balance)
    if (lastRow < 2) return JSON.stringify([]);
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();
    const filteredData = values.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    return JSON.stringify(filteredData);
  } catch (error) {
    return JSON.stringify([]);
  }
}

// <CHANGE> Updated to read from D Postpaid sheet
function getDevicesPostpaid() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('D Postpaid');
    if (!sheet) {
      throw new Error('Sheet "D Postpaid" not found. Please make sure the sheet exists.');
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return []; 
    }

    const dataRange = sheet.getRange(2, 1, lastRow - 1, 3);
    const values = dataRange.getValues();
    const devices = values
      .filter(row => row[0] && row[1]) 
      .map(row => ({
        id: row[0],
        serial: row[1],
        clientId: row[2] || '' 
      }));
    return devices;
  } catch (error) {
    console.error('Error in getDevices:', error);
    throw new Error('Failed to load devices data: ' + error.message);
  }
}

// <CHANGE> Updated to write to (CM) Postpaid sheet with new column mappings
function addRecordPostpaid(data) {
  console.log(data)
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Postpaid');
    if (!sheet) throw new Error('Sheet "(CM) Postpaid" not found.');

    const colA = sheet.getRange("A2:A").getValues();
    let nextRow = colA.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;

    // <CHANGE> Auto-set payment status to "Paid" if payment date exists
    let paymentStatus = data.paymentStatus || 'Pending';
    if (data.paymentDate) {
      paymentStatus = 'Paid';
    }

    // A: Timestamp
    sheet.getRange(nextRow, 1).setValue(new Date());
    // B: Client ID
    sheet.getRange(nextRow, 2).setValue(data.clientId); 
    // C: Client Name (formula - don't touch)
    // D: Device ID
    sheet.getRange(nextRow, 4).setValue(data.deviceId);
    // E: Device Serial Number (formula - don't touch)
    // F: Balance from K-Laser System
    sheet.getRange(nextRow, 6).setValue(data.balance);
    // G: Credit Utilised by Client Report
    sheet.getRange(nextRow, 7).setValue(data.creditUsed);
    // H: Credit Utilised Breakdown
    sheet.getRange(nextRow, 8).setValue(data.breakdown);
    // I: Credit Missing (formula - don't touch)
    // J: Top Up Amount
    sheet.getRange(nextRow, 10).setValue(data.topUp);
    // K: Payment Date
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(nextRow, 11).setValue(paymentDate);
    // L: Payment Status
    sheet.getRange(nextRow, 12).setValue(paymentStatus);
    // M: Credit to be charged
    sheet.getRange(nextRow, 13).setValue(data.creditToCharge);
    // N: Charges per Credit (RM) (formula - don't touch)
    // O: Total Charges (RM) (formula - don't touch)
    // P: Current Balance (formula - don't touch)

    return { success: true, message: 'Record added successfully' };
  } catch (error) {
    throw new Error('Failed to add record: ' + error.message);
  }
}

// <CHANGE> Updated to write to (CM) Postpaid sheet with new column mappings
function updateRecordPostpaid(rowIndex, data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('(CM) Postpaid');
    if (!sheet) throw new Error('Sheet "(CM) Postpaid" not found.');

    const sheetRow = rowIndex + 2;

    // <CHANGE> Auto-set payment status to "Paid" if payment date exists
    let paymentStatus = data.paymentStatus || 'Pending';
    if (data.paymentDate) {
      paymentStatus = 'Paid';
    }

    // B: Client ID
    sheet.getRange(sheetRow, 2).setValue(data.clientId);
    // D: Device ID
    sheet.getRange(sheetRow, 4).setValue(data.deviceId);
    // F: Balance from K-Laser System
    sheet.getRange(sheetRow, 6).setValue(data.balance);
    // G: Credit Utilised by Client Report
    sheet.getRange(sheetRow, 7).setValue(data.creditUsed);
    // H: Credit Utilised Breakdown
    sheet.getRange(sheetRow, 8).setValue(data.breakdown);
    // J: Top Up Amount
    sheet.getRange(sheetRow, 10).setValue(data.topUp);
    // K: Payment Date
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(sheetRow, 11).setValue(paymentDate);
    // L: Payment Status
    sheet.getRange(sheetRow, 12).setValue(paymentStatus);
    // M: Credit to be charged
    sheet.getRange(sheetRow, 13).setValue(data.creditToCharge);

    return { success: true, message: 'Record updated successfully' };
  } catch (error) {
    console.error('Error in updateRecord:', error);
    throw new Error('Failed to update record: ' + error.message);
  }
}