function doGet() {
  return HtmlService.createTemplateFromFile('Credit-Management-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Credit Management Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getCreditDataPostpaidMonthly() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Postpaid');
    if (!sheet) return JSON.stringify([]);

    const lastRow = sheet.getLastRow();
    const lastCol = 18;
    if (lastRow < 2) return JSON.stringify([]);

    const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const filtered = values.filter(r => {
      const timestamp = r[0];
      const topUp = parseFloat(r[9]) || 0;
      return timestamp && topUp === 0;
    });

    return JSON.stringify(filtered);
  } catch (err) {
    console.error('Error in getCreditDataPostpaidMonthly:', err);
    return JSON.stringify([]);
  }
}

function getCreditDataPostpaidTopUp() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Postpaid');
    if (!sheet) return JSON.stringify([]);

    const lastRow = sheet.getLastRow();
    const lastCol = 19;
    if (lastRow < 2) return JSON.stringify([]);

    const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const filtered = values.filter(r => {
      const timestamp = r[0];
      const topUp = parseFloat(r[9]) || 0;
      return timestamp && topUp !== 0;
    });

    console.log(filtered)

    return JSON.stringify(filtered);
  } catch (err) {
    console.error('Error in getCreditDataPostpaidTopUp:', err);
    return JSON.stringify([]);
  }
}

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


function addRecordPostpaid(data) {
  console.log(data)
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Postpaid');
    if (!sheet) throw new Error('Sheet "(CM) Postpaid" not found.');

    const colA = sheet.getRange("A2:A").getValues();
    let nextRow = colA.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;


    let paymentStatus = data.paymentStatus || 'Pending';
    if (data.paymentDate) {
      paymentStatus = 'Paid';
    }


    const userEmail = Session.getActiveUser().getEmail();

    sheet.getRange(nextRow, 1).setValue(new Date());

    sheet.getRange(nextRow, 2).setValue(data.clientId); 


    sheet.getRange(nextRow, 4).setValue(data.deviceId);


    sheet.getRange(nextRow, 6).setValue(data.balance);

    sheet.getRange(nextRow, 7).setValue(data.creditUsed);

    sheet.getRange(nextRow, 8).setValue(data.breakdown);


    sheet.getRange(nextRow, 10).setValue(data.topUp);

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(nextRow, 11).setValue(paymentDate);

    sheet.getRange(nextRow, 12).setValue(paymentStatus);

    sheet.getRange(nextRow, 13).setValue(data.creditToCharge);

    sheet.getRange(nextRow, 17).setValue(userEmail);
    
    const status = data.status || '';
    sheet.getRange(nextRow, 19).setValue(status);

    return { success: true, message: 'Record added successfully' };
  } catch (error) {
    throw new Error('Failed to add record: ' + error.message);
  }
}


function updateRecordPostpaid(rowIndex, data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('(CM) Postpaid');
    if (!sheet) throw new Error('Sheet "(CM) Postpaid" not found.');

    const sheetRow = rowIndex + 2;

    let paymentStatus = data.paymentStatus || 'Pending';
    if (data.paymentDate) {
      paymentStatus = 'Paid';
    }

    const userEmail = Session.getActiveUser().getEmail();

    sheet.getRange(sheetRow, 2).setValue(data.clientId);
    sheet.getRange(sheetRow, 4).setValue(data.deviceId);
    sheet.getRange(sheetRow, 6).setValue(data.balance);
    sheet.getRange(sheetRow, 7).setValue(data.creditUsed);
    sheet.getRange(sheetRow, 8).setValue(data.breakdown);
    sheet.getRange(sheetRow, 10).setValue(data.topUp);

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : '';
    sheet.getRange(sheetRow, 11).setValue(paymentDate);
    sheet.getRange(sheetRow, 12).setValue(paymentStatus);
    sheet.getRange(sheetRow, 13).setValue(data.creditToCharge);

    sheet.getRange(sheetRow, 17).setValue(userEmail);
    
    const status = data.status || '';
    sheet.getRange(sheetRow, 19).setValue(status);

    return { success: true, message: 'Record updated successfully' };
  } catch (error) {
    console.error('Error in updateRecord:', error);
    throw new Error('Failed to update record: ' + error.message);
  }
}
