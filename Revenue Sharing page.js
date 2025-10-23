function doGet() {
  return HtmlService.createTemplateFromFile('Revenue-Sharing-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Revenue Sharing Management")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getRevenueSharingDataMonthly() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Revenue Sharing');
    if (!sheet) return JSON.stringify([]);

    const lastRow = sheet.getLastRow();
    const lastCol = 9;
    if (lastRow < 2) return JSON.stringify([]);

    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();

    const filteredData = values.filter(row => {
      const timestamp = row[0];
      const topUp = parseFloat(row[7]) || 0;
      return timestamp && topUp === 0;
    });

    return JSON.stringify(filteredData);
  } catch (error) {
    console.error('Error in getRevenueSharingDataMonthly:', error);
    return JSON.stringify([]);
  }
}


function getRevenueSharingDataTopUp() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Revenue Sharing');
    if (!sheet) return JSON.stringify([]);

    const lastRow = sheet.getLastRow();
    const lastCol = 9;
    if (lastRow < 2) return JSON.stringify([]);

    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();

    const filteredData = values.filter(row => {
      const topUp = parseFloat(row[7]) || 0;
      return topUp !== 0;
    });

    return JSON.stringify(filteredData);
  } catch (error) {
    console.error('Error in getRevenueSharingDataTopUp:', error);
    return JSON.stringify([]);
  }
}

function getRevenueSharingDevices() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('D Revenue Sharing');
    if (!sheet) {
      throw new Error('Sheet "D Revenue Sharing" not found. Please make sure the sheet exists.');
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
    console.error('Error in getRevenueSharingDevices:', error);
    throw new Error('Failed to load devices data: ' + error.message);
  }
}

function addRevenueSharingRecord(data) {
  console.log('Adding revenue sharing record:', data);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('(CM) Revenue Sharing');
    if (!sheet) throw new Error('Sheet "(CM) Revenue Sharing" not found.');


    const colA = sheet.getRange("A2:A").getValues();
    let nextRow = colA.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;



    sheet.getRange(nextRow, 1).setValue(new Date());
    

    sheet.getRange(nextRow, 2).setValue(data.clientId);
    

    

    sheet.getRange(nextRow, 4).setValue(data.deviceId);
    

    

    sheet.getRange(nextRow, 6).setValue(data.balance);
    

    sheet.getRange(nextRow, 7).setValue(data.creditUsed);
    

    sheet.getRange(nextRow, 8).setValue(data.topUp);
    


    return { success: true, message: 'Revenue sharing record added successfully' };
  } catch (error) {
    console.error('Error in addRevenueSharingRecord:', error);
    throw new Error('Failed to add revenue sharing record: ' + error.message);
  }
}

function updateRevenueSharingRecord(rowIndex, data) {
  console.log('Updating revenue sharing record at row:', rowIndex, 'with data:', data);
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('(CM) Revenue Sharing');
    if (!sheet) throw new Error('Sheet "(CM) Revenue Sharing" not found.');

    const sheetRow = rowIndex + 2;



    sheet.getRange(sheetRow, 2).setValue(data.clientId);
    

    

    sheet.getRange(sheetRow, 4).setValue(data.deviceId);
    

    

    sheet.getRange(sheetRow, 6).setValue(data.balance);
    

    sheet.getRange(sheetRow, 7).setValue(data.creditUsed);
    

    sheet.getRange(sheetRow, 8).setValue(data.topUp);
    


    return { success: true, message: 'Revenue sharing record updated successfully' };
  } catch (error) {
    console.error('Error in updateRevenueSharingRecord:', error);
    throw new Error('Failed to update revenue sharing record: ' + error.message);
  }
}