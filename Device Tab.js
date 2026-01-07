function doGet() {
  return HtmlService.createTemplateFromFile('Device-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Device Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getInitialData() {
  try {
    return {
      clients: getClientData()
    };
  } catch (error) {
    console.error('Error in getInitialData:', error);
    throw new Error('Failed to load initial data: ' + error.message);
  }
}

function getDeviceDataByType(businessType) {
  try {
    let sheetName = '';
    let lastEditedColIndex;
    let minCreditColIndex;
    
    if (businessType === 'Revenue Sharing') {
      sheetName = 'D Revenue Sharing';
      lastEditedColIndex = 6;
      minCreditColIndex = 7;
    } else if (businessType === 'Prepaid') {
      sheetName = 'D Prepaid';
      lastEditedColIndex = 7;
      minCreditColIndex = 8;
    } else if (businessType === 'Postpaid') {
      sheetName = 'D Postpaid';
      lastEditedColIndex = 7;
      minCreditColIndex = 8;
    } else {
      throw new Error('Invalid business type');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet named "' + sheetName + '" not found');

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    let lastCol;
    let balanceColIndex;

    if (businessType === 'Prepaid' || businessType === 'Postpaid') {
      lastCol = 9;
      balanceColIndex = 5;
    } else if (businessType === 'Revenue Sharing') {
      lastCol = 8;
      balanceColIndex = 4;
    }

    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();

    const devices = values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map(row => {
        const device = {
          deviceId: row[0] ? row[0].toString() : '',
          serialNumber: row[1] ? row[1].toString() : '',
          clientId: row[2] ? row[2].toString() : '',
          clientName: row[3] ? row[3].toString() : '',
          totalBalance: row[balanceColIndex] ? parseFloat(row[balanceColIndex]) || 0 : 0,
          lastEditedBy: row[lastEditedColIndex] ? row[lastEditedColIndex].toString() : '',
          minCredit: row[minCreditColIndex] ? parseInt(row[minCreditColIndex], 10) || 0 : 0
        };

        if (businessType === 'Postpaid') {
          device.chargesPerCredit = row[4] ? parseFloat(row[4]) || 0 : 0;
        } else if (businessType === 'Prepaid') {
          try {
            device.creditPurchaseOptions = row[4] ? JSON.parse(row[4].toString()) : [];
          } catch (e) {
            device.creditPurchaseOptions = [];
          }
        }

        return device;
      });

    return devices;

  } catch (error) {
    console.error('Error in getDeviceDataByType:', error);
    throw new Error('Failed to load device data: ' + error.message);
  }
}


function getClientData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
    
    if (!sheet) {
      throw new Error('Sheet named "Clients" not found');
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      return [];
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 2);
    const values = dataRange.getValues();
    
    const clients = values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map(row => ({
        id: row[0] ? row[0].toString() : '',
        name: row[1] ? row[1].toString() : ''
      }));
    
    return clients;
    
  } catch (error) {
    console.error('Error in getClientData:', error);
    throw new Error('Failed to load client data: ' + error.message);
  }
}

function addDevice(deviceData) {
  try {
    let sheetName = '';
    let emailColumn;
    let minCreditColumn;
    
    if (deviceData.businessType === 'Revenue Sharing') {
      sheetName = 'D Revenue Sharing';
      emailColumn = 6;
      minCreditColumn = 8;
    } else if (deviceData.businessType === 'Prepaid') {
      sheetName = 'D Prepaid';
      emailColumn = 7;
      minCreditColumn = 9;
    } else if (deviceData.businessType === 'Postpaid') {
      sheetName = 'D Postpaid';
      emailColumn = 7;
      minCreditColumn = 9;
    } else {
      throw new Error('Invalid business type');
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet named "' + sheetName + '" not found');
    }

    const deviceId = Utilities.getUuid();
    const userEmail = Session.getActiveUser().getEmail();
    const lastRow = sheet.getLastRow();
    const values = sheet.getRange(2, 1, Math.max(lastRow - 1, 1), 1).getValues();

    let targetRow = null;
    for (let i = 0; i < values.length; i++) {
      if (!values[i][0]) {
        targetRow = i + 2;
        break;
      }
    }

    if (!targetRow) {
      targetRow = lastRow + 1;
    }


    sheet.getRange(targetRow, 1, 1, 3).setValues([[
      deviceId,
      deviceData.serialNumber,
      deviceData.clientId
    ]]);


    if (deviceData.businessType === 'Postpaid') {
      sheet.getRange(targetRow, 5).setValue(deviceData.chargesPerCredit || 0);
    } else if (deviceData.businessType === 'Prepaid') {
      const jsonString = JSON.stringify(deviceData.creditPurchaseOptions || []);
      sheet.getRange(targetRow, 5).setValue(jsonString);
    }


    sheet.getRange(targetRow, emailColumn).setValue(userEmail);
    sheet.getRange(targetRow, minCreditColumn).setValue(deviceData.minCredit || 0);

    return { success: true, deviceId: deviceId };

  } catch (error) {
    console.error('Error in addDevice:', error);
    throw new Error('Failed to add device: ' + error.message);
  }
}

function updateDevice(deviceData) {
  try {
    let sheetName = '';
    let emailColumn;
    let minCreditColumn;
    
    if (deviceData.businessType === 'Revenue Sharing') {
      sheetName = 'D Revenue Sharing';
      emailColumn = 6;
      minCreditColumn = 8;
    } else if (deviceData.businessType === 'Prepaid') {
      sheetName = 'D Prepaid';
      emailColumn = 7;
      minCreditColumn = 9;
    } else if (deviceData.businessType === 'Postpaid') {
      sheetName = 'D Postpaid';
      emailColumn = 7;
      minCreditColumn = 9;
    } else {
      throw new Error('Invalid business type');
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet named "' + sheetName + '" not found');
    }

    const userEmail = Session.getActiveUser().getEmail();
    const lastRow = sheet.getLastRow();
    const lastCol = deviceData.businessType === 'Prepaid' || deviceData.businessType === 'Postpaid' ? 8 : 7;
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();
    
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === deviceData.deviceId) {
        const rowNumber = i + 2;


        sheet.getRange(rowNumber, 2).setValue(deviceData.serialNumber);
        sheet.getRange(rowNumber, 3).setValue(deviceData.clientId);
        

        if (deviceData.businessType === 'Postpaid') {
          sheet.getRange(rowNumber, 5).setValue(deviceData.chargesPerCredit || 0);
        } else if (deviceData.businessType === 'Prepaid') {
          const jsonString = JSON.stringify(deviceData.creditPurchaseOptions || []);
          sheet.getRange(rowNumber, 5).setValue(jsonString);
        }

        sheet.getRange(rowNumber, minCreditColumn).setValue(deviceData.minCredit || 0);

        sheet.getRange(rowNumber, emailColumn).setValue(userEmail);

        return { success: true };
      }
    }

    throw new Error('Device not found');

  } catch (error) {
    console.error('Error in updateDevice:', error);
    throw new Error('Failed to update device: ' + error.message);
  }
}
