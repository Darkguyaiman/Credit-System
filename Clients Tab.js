function doGet() {
  return HtmlService.createTemplateFromFile('Clients-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Clients Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getClientsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  if (!sheet) throw new Error('Clients sheet not found');
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  return data
    .filter(row => row[0] || row[1])
    .map(row => ({ id: row[0] || '', name: row[1] || '' }));
}

function addClient(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  if (!sheet) throw new Error('Clients sheet not found');
  
  const id = Utilities.getUuid();
  sheet.appendRow([id, name]);
  return { success: true, id: id };
}

function updateClient(clientId, name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  if (!sheet) throw new Error('Clients sheet not found');
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === clientId) {
      sheet.getRange(i + 2, 2).setValue(name);
      return { success: true };
    }
  }
  throw new Error('Client not found');
}

function deleteClient(clientId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  if (!sheet) throw new Error('Clients sheet not found');
  
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === clientId) {
      sheet.deleteRow(i + 2);
      return { success: true };
    }
  }
  throw new Error('Client not found');
}
