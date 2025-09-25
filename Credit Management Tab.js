function doGet() {
  return HtmlService.createTemplateFromFile('Credit-Management-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Credit Management Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getCreditData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Credit Management');
    if (!sheet) return JSON.stringify([]);
    const lastRow = sheet.getLastRow();
    const lastCol = 16;
    if (lastRow < 2) return JSON.stringify([]);
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();
    const filteredData = values.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    return JSON.stringify(filteredData);
  } catch (error) {
    return JSON.stringify([]);
  }
}


function getDevices() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Devices');
    if (!sheet) {
      throw new Error('Sheet "Devices" not found. Please make sure the sheet exists.');
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return []; 
    }
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 2);
    const values = dataRange.getValues();
    const devices = values
      .filter(row => row[0] && row[1]) 
      .map(row => ({
        id: row[0],
        serial: row[1]
      }));
    return devices;
  } catch (error) {
    console.error('Error in getDevices:', error);
    throw new Error('Failed to load devices data: ' + error.message);
  }
}

function addRecord(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Credit Management');
    if (!sheet) throw new Error('Sheet "Credit Management" not found.');

    const colA = sheet.getRange("A2:A").getValues();
    let nextRow = colA.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;

    sheet.getRange(nextRow, 1).setValue(new Date());
    sheet.getRange(nextRow, 4).setValue(data.deviceId);
    sheet.getRange(nextRow, 7, 1, 2).setValues([[data.balance, data.topUp]]);

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(nextRow, 9, 1, 4).setValues([[paymentDate, data.paymentStatus, data.creditUsed, data.breakdown]]);

    sheet.getRange(nextRow, 14, 1, 2).setValues([[data.creditToCharge, data.chargesPerCredit]]);

    return { success: true, message: 'Record added successfully' };
  } catch (error) {
    throw new Error('Failed to add record: ' + error.message);
  }
}

function updateRecord(rowIndex, data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Credit Management');
    if (!sheet) throw new Error('Sheet "Credit Management" not found.');

    const sheetRow = rowIndex + 2;

    sheet.getRange(sheetRow, 4).setValue(data.deviceId);         
    sheet.getRange(sheetRow, 7).setValue(data.balance);          
    sheet.getRange(sheetRow, 8).setValue(data.topUp);            

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(sheetRow, 9).setValue(paymentDate); 

    sheet.getRange(sheetRow, 10).setValue(data.paymentStatus);   
    sheet.getRange(sheetRow, 11).setValue(data.creditUsed);      
    sheet.getRange(sheetRow, 12).setValue(data.breakdown);       
    sheet.getRange(sheetRow, 14).setValue(data.creditToCharge);  
    sheet.getRange(sheetRow, 15).setValue(data.chargesPerCredit);

    return { success: true, message: 'Record updated successfully' };
  } catch (error) {
    console.error('Error in updateRecord:', error);
    throw new Error('Failed to update record: ' + error.message);
  }
}


