// Rule ID for our redirect rule
const RULE_ID = 1;

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
    // Load initial settings
    const settings = await chrome.storage.sync.get({
        enabled: true,
        // sourceUrl: '@nostrops',
        sourceUrl: 'nostrops.spaces',
        // targetUrl: 'example.com'
        targetUrl: '70.251.209.207'
    });

    // Set up initial rules if enabled
    if (settings.enabled) {
        await updateRedirectRule(settings.sourceUrl, settings.targetUrl);
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'toggleRedirect') {
        handleToggleRedirect(message.enabled);
    } else if (message.type === 'updateSettings') {
        handleSettingsUpdate(message.settings);
    }
});

// Handle enabling/disabling redirect
async function handleToggleRedirect(enabled) {
    if (enabled) {
        const settings = await chrome.storage.sync.get({
            // sourceUrl: '@nostrops',
            sourceUrl: 'nostrops.spaces',
            // targetUrl: 'example.com'
            targetUrl: '70.251.209.207'
        });
        await updateRedirectRule(settings.sourceUrl, settings.targetUrl);
    } else {
        await removeRedirectRule();
    }
}

// Handle settings update
async function handleSettingsUpdate(settings) {
    const currentSettings = await chrome.storage.sync.get({ enabled: false });
    if (currentSettings.enabled) {
        await updateRedirectRule(settings.sourceUrl, settings.targetUrl);
    }
}

// Update the redirect rule
async function updateRedirectRule(sourceUrl, targetUrl) {
    // Remove existing rule first
    await removeRedirectRule();

    // Create new rule
    const rule = {
        id: RULE_ID,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                url: `http://${targetUrl}`
            }
        },
        condition: {
            urlFilter: `*://${sourceUrl}/*`,
            resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest"]
        }
    };

    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [rule]
        });
        console.log('Redirect rule updated successfully');
    } catch (error) {
        console.error('Error updating redirect rule:', error);
    }
}

// Remove the redirect rule
async function removeRedirectRule() {
    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [RULE_ID]
        });
        console.log('Header modification rule removed successfully');
    } catch (error) {
        console.error('Error removing header modification rule:', error);
    }
}