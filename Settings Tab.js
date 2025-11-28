function doGet() {
  return HtmlService.createTemplateFromFile('Settings-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Settings Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getCurrentUserRole() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      return 'Guest';
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return 'Guest';
    }
    
    const data = sheet.getRange(2, 2, lastRow - 1, 3).getValues();
    
    for (let i = 0; i < data.length; i++) {
      const email = data[i][1];
      const role = data[i][2];
      
      if (email && email.toString().toLowerCase() === userEmail.toLowerCase()) {
        return role ? role.toString() : 'Guest';
      }
    }
    
    return 'Guest';
  } catch (error) {
    return 'Guest';
  }
}

function getCurrentUserInfo() {
  return {
    email: Session.getActiveUser().getEmail(),
    role: getCurrentUserRole()
  };
}

function getAllUsers() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return { success: true, users: [] };
    }
    
    const range = sheet.getRange(2, 2, lastRow - 1, 3);
    const values = range.getValues();
    
    const users = [];
    for (let i = 0; i < values.length; i++) {
      const username = values[i][0];
      const email = values[i][1];
      const role = values[i][2];
      
      if (username || email || role) {
        users.push({
          id: i + 2,
          username: username ? username.toString() : '',
          email: email ? email.toString() : '',
          role: role ? role.toString() : ''
        });
      }
    }
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function addUser(username, email, role) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
    if (!sheet) throw new Error('Settings sheet not found');
    const data = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
    let nextRow = data.findIndex(r => !r[0]) + 2;
    if (nextRow < 2) nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 2, 1, 3).setValues([[username, email, role]]);
    return { success: true, message: 'User added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}


function updateUser(rowId, username, email, role) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    sheet.getRange(rowId, 2).setValue(username);
    sheet.getRange(rowId, 3).setValue(email);
    sheet.getRange(rowId, 4).setValue(role);
    
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteUser(rowId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    
    sheet.deleteRow(rowId);
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}