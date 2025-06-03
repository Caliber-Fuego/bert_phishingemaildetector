// Function to add the Parse Email button
const addParseEmailButton = async () => {
    if (document.querySelector(".parseEmailBtn")) return; // Avoid duplicates

    const emailToolbar = document.querySelector(".bHJ");
    if (!emailToolbar) return;

    console.log("Adding parse email button...");
    const parseEmailBtn = document.createElement("img");
    parseEmailBtn.src = chrome.runtime.getURL("parseEmailIcon.png");
    parseEmailBtn.className = "parseEmailBtn";
    parseEmailBtn.style.cursor = "pointer";
    parseEmailBtn.style.marginRight = "10px";
    parseEmailBtn.style.width = "24px";
    parseEmailBtn.style.height = "24px";

    emailToolbar.insertBefore(parseEmailBtn, emailToolbar.firstChild);

    parseEmailBtn.addEventListener("click", extractEmailContent);
};

// Button to extract email content
const extractEmailContent = () => {
    const emailBody = document.querySelector(".ii.gt div");
    if (emailBody instanceof HTMLElement) {
        const emailText = emailBody.innerText;

        // Store email text in Chrome storage
        chrome.storage.local.set({ emailText });

        // Open popup
        chrome.runtime.sendMessage({ action: "openPopup" });
    } else {
        console.warn("Email content not found.");
        alert("No email content found.");
    }

    
};

// MutationObserver to detect Gmail's dynamic content
const observer = new MutationObserver(() => {
    if (document.querySelector(".parseEmailBtn")) return; // Stop if already added
    addParseEmailButton();
});

// Listen for messages from the popup to get attachments
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_ATTACHMENTS") {
        const links = Array.from(document.querySelectorAll('.aQy'));
        const attachments = links.map(link => {
            const anchor = link as HTMLAnchorElement;
            return {
                name: anchor.textContent,
                url: anchor.href
            };
        });
        sendResponse({ attachments });
    }

    return true;
});

// Listen for messages from the popup to get attachments
chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
    if (msg.type === "FETCH_AND_HASH_ATTACHMENT") {
        try {
            const res = await fetch(msg.url);
            const buffer = await res.arrayBuffer();
            // Hash using SubtleCrypto
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
            sendResponse({ success: true, hash: hashHex });
        } catch (error) {
            console.error("Error fetching or hashing attachment:", error);
            sendResponse({ success: false, error: "Failed to fetch or hash attachment" });
        }
        return true; // Indicates async response
    }
});

// Start observing for email toolbar
const waitForElement = (selector: string, callback: () => void) => {
    const element = document.querySelector(selector);
    if (element) {
        callback();
    } else {
        const obs = new MutationObserver((_mutations, observerInstance) => {
            if (document.querySelector(selector)) {
                callback();
                observerInstance.disconnect(); // Stop once found
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }
};

// Observe Gmail changes
waitForElement(".bHJ", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    addParseEmailButton();
});

