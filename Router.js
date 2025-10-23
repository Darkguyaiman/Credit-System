function doGet(e) {
  const validPages = {
    "dashboard": "Dashboard-Tab",
    "device-tab": "Device-Tab",
    "clients-tab": "Clients-Tab",
    "settings-tab": "Settings-Tab",
    "prepaid": "Prepaid-page",

    // Postpaid
    "postpaid-monthly": "Postpaid-Monthly",
    "postpaid-topup": "Postpaid-TopUp",

    // Revenue Sharing
    "revenue-sharing-monthly": "Revenue-Sharing-Monthly",
    "revenue-sharing-topup": "Revenue-Sharing-TopUp"
  };

  const requestedPage = (e?.parameter?.page || "dashboard").toLowerCase();
  const page = validPages[requestedPage] || "404";
  const url = ScriptApp.getService().getUrl();

  let template;
  try {
    template = HtmlService.createTemplateFromFile(page);
  } catch {
    template = HtmlService.createTemplateFromFile("404");
  }

  template.baseUrl = url;

  return template.evaluate()
    .setTitle("Credit System")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
