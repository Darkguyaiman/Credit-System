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
      devices: getDeviceData(),
      clients: getClientData(),
      businessModels: getBusinessModelData()
    };
  } catch (error) {
    console.error('Error in getInitialData:', error);
    throw new Error('Failed to load initial data: ' + error.message);
  }
}

function getDeviceData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Devices');
    
    if (!sheet) {
      throw new Error('Sheet named "Devices" not found');
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = 6;
    
    if (lastRow < 2) {
      return [];
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getValues();
    
    const devices = values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map(row => ({
        deviceId: row[0] ? row[0].toString() : '',
        serialNumber: row[1] ? row[1].toString() : '',
        clientId: row[2] ? row[2].toString() : '',
        clientName: row[3] ? row[3].toString() : '',
        businessModel: row[4] ? row[4].toString() : '',
        chargesPerCredit: row[5] ? parseFloat(row[5]) || 0 : 0
      }));
    
    return devices;
    
  } catch (error) {
    console.error('Error in getDeviceData:', error);
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

function getBusinessModelData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Sheet named "Settings" not found');
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      return [];
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 1);
    const values = dataRange.getValues();
    
    const businessModels = values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map(row => row[0].toString());
    
    return businessModels;
    
  } catch (error) {
    console.error('Error in getBusinessModelData:', error);
    throw new Error('Failed to load business model data: ' + error.message);
  }
}

function addDevice(deviceData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Devices');
    if (!sheet) {
      throw new Error('Sheet named "Devices" not found');
    }

    const deviceId = Utilities.getUuid();
    const lastRow = sheet.getLastRow();
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

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

    sheet.getRange(targetRow, 5, 1, 2).setValues([[
      deviceData.businessModel,
      deviceData.chargesPerCredit || 0
    ]]);

    return { success: true, deviceId: deviceId };

  } catch (error) {
    console.error('Error in addDevice:', error);
    throw new Error('Failed to add device: ' + error.message);
  }
}

function updateDevice(deviceData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Devices');
    if (!sheet) {
      throw new Error('Sheet named "Devices" not found');
    }

    const lastRow = sheet.getLastRow();
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
    const values = dataRange.getValues();
    
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === deviceData.deviceId) {
        const rowNumber = i + 2;

        sheet.getRange(rowNumber, 2).setValue(deviceData.serialNumber);
        sheet.getRange(rowNumber, 3).setValue(deviceData.clientId);
        sheet.getRange(rowNumber, 5).setValue(deviceData.businessModel);
        sheet.getRange(rowNumber, 6).setValue(deviceData.chargesPerCredit || 0);

        return { success: true };
      }
    }

    throw new Error('Device not found');

  } catch (error) {
    console.error('Error in updateDevice:', error);
    throw new Error('Failed to update device: ' + error.message);
  }
}


function deleteDevice(deviceId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Devices');
    if (!sheet) throw new Error('Sheet named "Devices" not found');

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: true, message: "Deleted already" };

    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const idx = values.indexOf(deviceId);

    if (idx === -1) {
      return { success: true, message: "Deleted already" };
    }

    const rowNumber = idx + 2;
    sheet.deleteRow(rowNumber);

    if (rowNumber === 2) {
      sheet.getRange("D2").setFormula(
        '=ARRAYFORMULA(IF(C2:C="","",IFERROR(VLOOKUP(C2:C,{Clients!A2:A,Clients!B2:B},2,0),"")))'
      );
    }

    return { success: true, message: "Deleted successfully" };

  } catch (error) {
    console.error('Error in deleteDevice:', error);
    throw new Error('Failed to delete device: ' + error.message);
  }
}

