import { DnrError } from "../shared/errors";

export async function syncDnrRules(
  isActive: boolean,
  blockedSites: string[]
): Promise<void> {
  let existing: chrome.declarativeNetRequest.Rule[];
  try {
    existing = await chrome.declarativeNetRequest.getDynamicRules();
  } catch (cause) {
    throw new DnrError("getDynamicRules 실패", cause);
  }

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

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  } catch (cause) {
    throw new DnrError("updateDynamicRules 실패", cause);
  }
}
