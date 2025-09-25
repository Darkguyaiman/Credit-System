function doGet() {
  return HtmlService.createTemplateFromFile('Settings-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Settings Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getAllSettings() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, settings: [] };
    }
    
    const range = sheet.getRange(2, 1, lastRow - 1, 1);
    const values = range.getValues().flat();
    
    const settings = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value) { 
        settings.push({
          id: i + 2, 
          name: `Setting ${i + 1}`, 
          value: value.toString()
        });
      }
    }
    
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function addSetting(value) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    sheet.getRange(newRow, 1).setValue(value);
    
    return { success: true, message: 'Setting added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateSetting(rowId, value) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    sheet.getRange(rowId, 1).setValue(value);
    
    return { success: true, message: 'Setting updated successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteSetting(rowId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    sheet.deleteRow(rowId);
    
    return { success: true, message: 'Setting deleted successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
