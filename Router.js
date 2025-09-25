function doGet(e) {
  const validPages = {
    "dashboard": "Dashboard-Tab",
    "credit-management": "Credit-Management-Tab",
    "device-tab": "Device-Tab",
    "clients-tab": "Clients-Tab",
    "settings-tab": "Settings-Tab"
  };

  const requestedPage = e?.parameter?.page || "dashboard";
  let page = validPages[requestedPage] || "404";

  const url = ScriptApp.getService().getUrl();

  let template;
  try {
    template = HtmlService.createTemplateFromFile(page);
  } catch (err) {
    template = HtmlService.createTemplateFromFile("404");
  }

  template.baseUrl = url;

  return template.evaluate()
    .setTitle("Credit System")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}