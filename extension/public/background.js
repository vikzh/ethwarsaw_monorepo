chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.openPopup) {
        // Open the extension's popup
        console.log("open pop up");
        chrome.action.setPopup({ popup: "index.html" });
        chrome.action.openPopup();
    }
});