const BLOCK_PAGE_URL = chrome.runtime.getURL("block-page.html");

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "loading" || !tab.url) return;

  const url = tab.url;
  if (url.startsWith("chrome://") || url.startsWith(BLOCK_PAGE_URL)) return;

  const data = await chrome.storage.local.get({ isActive: false, blockedSites: [] });
  if (!data.isActive || data.blockedSites.length === 0) return;

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  const isBlocked = data.blockedSites.some(
    (site) => hostname === site || hostname.endsWith(`.${site}`)
  );

  if (isBlocked) {
    chrome.tabs.update(tabId, { url: BLOCK_PAGE_URL });
  }
});
