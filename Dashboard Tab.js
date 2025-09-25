function doGet() {
  return HtmlService.createTemplateFromFile('Dashboard-Tab')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("Dashboard Tab")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDashboardData() {
  try {
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
    
    if (!sheet) {
      throw new Error('Dashboard sheet not found');
    }
    
    
    const generalMetrics = {
      devices: sheet.getRange('B2').getValue() || 0,
      clients: sheet.getRange('B3').getValue() || 0,
      topups: sheet.getRange('B4').getValue() || 0,
      records: sheet.getRange('B5').getValue() || 0,
      missing: sheet.getRange('B6').getValue() || 0,
      balance: sheet.getRange('B7').getValue() || 0,
      utilised: sheet.getRange('B8').getValue() || 0
    };
    
    
    const paymentStatusLabels = sheet.getRange('C3:C5').getValues().flat().filter(val => val !== '');
    const paymentStatusValues = sheet.getRange('D3:D5').getValues().flat().filter(val => val !== '');
    
    
    const businessModelLabels = sheet.getRange('E3:E10').getValues().flat().filter(val => val !== '');
    const businessModelValues = sheet.getRange('F3:F10').getValues().flat().filter(val => val !== '');
    
    
    const creditUtilisedLabels = sheet.getRange('G3:G10').getValues().flat().filter(val => val !== '');
    const creditUtilisedValues = sheet.getRange('H3:H10').getValues().flat().filter(val => val !== '');
    
    return {
      ...generalMetrics,
      paymentStatus: {
        labels: paymentStatusLabels,
        values: paymentStatusValues
      },
      businessModel: {
        labels: businessModelLabels,
        values: businessModelValues
      },
      creditUtilised: {
        labels: creditUtilisedLabels,
        values: creditUtilisedValues
      }
    };
    
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('Failed to load dashboard data: ' + error.message);
  }
}
