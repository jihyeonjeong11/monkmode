export async function syncDnrRules(
  isActive: boolean,
  blockedSites: string[]
): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules: chrome.declarativeNetRequest.Rule[] = isActive
    ? blockedSites.map((site, i) => ({
        id: i + 1,
        priority: 1,
        action: {
          type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
          redirect: { extensionPath: "/block-page.html" },
        },
        condition: {
          urlFilter: `||${site}`,
          resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
        },
      }))
    : [];

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}
