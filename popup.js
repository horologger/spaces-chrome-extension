console.log("This is a popup!")

document.addEventListener('DOMContentLoaded', async () => {
    const enableRedirect = document.getElementById('enableRedirect');
    const sourceUrl = document.getElementById('sourceUrl');
    const targetUrl = document.getElementById('targetUrl');
    const saveSettings = document.getElementById('saveSettings');
    const statusText = document.getElementById('statusText');
    const status = document.getElementById('status');

    // Load saved settings
    const settings = await chrome.storage.sync.get({
        enabled: true,
        // sourceUrl: '@nostrops',
        sourceUrl: 'nostrops.spaces',
        // targetUrl: 'example.com'
        targetUrl: '70.251.209.207'
    });

    // Update UI with saved settings
    enableRedirect.checked = settings.enabled;
    sourceUrl.value = settings.sourceUrl;
    targetUrl.value = settings.targetUrl;
    updateStatus(settings.enabled);

    // Handle enable/disable toggle
    enableRedirect.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        await chrome.storage.sync.set({ enabled });
        updateStatus(enabled);
        
        // Notify background script
        chrome.runtime.sendMessage({
            type: 'toggleRedirect',
            enabled
        });
    });

    // Handle settings save
    saveSettings.addEventListener('click', async () => {
        const newSettings = {
            sourceUrl: sourceUrl.value.trim(),
            targetUrl: targetUrl.value.trim()
        };

        // Validate URLs
        if (!isValidUrl(newSettings.sourceUrl) || !isValidUrl(newSettings.targetUrl)) {
            alert('Please enter valid URLs');
            return;
        }

        await chrome.storage.sync.set(newSettings);
        
        // Notify background script
        chrome.runtime.sendMessage({
            type: 'updateSettings',
            settings: newSettings
        });

        // Show success message
        const button = saveSettings;
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    });

    function updateStatus(enabled) {
        statusText.textContent = enabled ? 'Active' : 'Inactive';
        status.className = `status ${enabled ? 'active' : 'inactive'}`;
    }

    function isValidUrl(url) {
        // Basic URL validation
        return url.length > 0 && /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url);
    }
});