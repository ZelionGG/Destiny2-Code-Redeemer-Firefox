document.addEventListener('DOMContentLoaded', function () {
  const redeemCodesButton = document.getElementById('redeemCodes');
  const stopRedeemCodesButton = document.getElementById('stopRedeemCodes');
  const statusDiv = document.getElementById('status');
  const totalCodeCountSpan = document.getElementById('totalCodeCount');
  const emblemCountSpan = document.getElementById('emblemCount');
  const shaderCountSpan = document.getElementById('shaderCount');
  const emoteCountSpan = document.getElementById('emoteCount');
  const transmatCountSpan = document.getElementById('transmatCount');
  const collectorCardCountSpan = document.getElementById('collectorCardCount');

  // Initialize stop button as disabled
  stopRedeemCodesButton.disabled = true;

  // List of all emblem codes
  const emblemCodes = [
    "YRC-C3D-YNC", // A Classy Order
    "9FY-KDD-PRT", // Adventurous Spirit
    "JDT-NLC-JKM", // Ab Aeterno
    "HN3-7K9-93G", // Airlock Invitation
    "PTD-GKG-CVN", // Archived
    "ML3-FD4-ND9", // Be True
    "FJ9-LAM-67F", // Binding Focus
    "A67-C7X-3GN", // Bulbul Tarang
    "VHT-6A7-3MM", // Conqueror of Infinity
    "PHV-6LF-9CP", // Countdown to Convergence
    "D97-YCX-7JK", // Crushed Gamma
    "RA9-XPH-6KJ", // Cryonautics
    "JVG-VNT-GGG", // Cоняшник
    "JNX-DMH-XLA", // Field of Light
    "A7L-FYC-44X", // Flames of Forgotten Truth
    "3J9-AMM-7MG", // Folding Space
    "7LV-GTK-T7J", // Future in Shadow
    "JYN-JAA-Y7D", // Galilean Excursion
    "3CV-D6K-RD4", // Gone Home
    "VXN-V3T-MRP", // Harmonic Commencement
    "L7T-CVV-3RD", // Heliotrope Warren
    "JD7-4CM-HJG", // Illusion of Light
    "3VF-LGC-RLX", // Insula Thesauria
    "XVK-RLA-RAM", // In Urbe Inventa
    "J6P-9YH-LLP", // In Vino Mendacium
    "TNN-DKM-6LG", // Jade's Burrow
    "VA7-L7H-PNC", // Liminal Nadir
    "XMY-G9M-6XH", // Limitless Horizon
    "7CP-94V-LFP", // Lone Focus, Jagged Edge
    "JND-HLR-L69", // M\\>START
    "FMM-44A-RKP", // Myopia
    "YAA-37T-FCN", // Neon Mirage
    "X4C-FGX-MX3", // Note of Conquest
    "L3P-XXR-GJ4", // Out the Airlock
    "THR-33A-YKC", // Risen
    "9LX-7YC-6TX", // Schrödinger's Gun
    "7D4-PKR-MD7", // Sequence Flourish
    "F99-KPX-NCF", // Shadow's Light
    "7F9-767-F74", // Sign of the Finite
    "6LJ-GH7-TPA", // Sneer of the Oni
    "T67-JXY-PH6", // Stag's Spirit
    "PKH-JL6-L4R", // Tangled Web
    "N3L-XN6-PXF", // The Reflective Proof
    "XFV-KHP-N97", // The Visionary
    "X9F-GMA-H6D", // The Unimagined Plane
    "6AJ-XFR-9ND", // Tigris Fati
    "HG7-YRG-HHF", // Year of the Snake
    "993-H3H-M6K", // Visio Spei
  ];

  const transmatCodes = [
    "R9J-79M-J6C", // End of the Rainbow
  ];

  const emoteCodes = [
    "TK7-D3P-FDF", // 2023 Pride Celebration: Rainbow Connection
  ];

  const shaderCodes = [
    "XVX-DKJ-CVM", // Seraphim's Gauntlets
    "7MM-VPD-MHP", // Double Banshee
    "RXC-9XJ-4MH", // Oracle 99
  ];

  const collectorCards = [
    "YKA-RJG-MH9", //Destiny Collector's Card #01 - Class: Warlock
    "3DA-P4X-F6A", //Destiny Collector's Card #02 - Class: Titan
    "MVD-4N3-NKH", //Destiny Collector's Card #03 - Class: Hunter
    "TCN-HCD-TGY", //Destiny Collector's Card #04 - Fallen: Riksis, Devil Archon
    "HDX-ALM-V4K", //Destiny Collector's Card #05 - Destination: Cosmodrome
    "473-MXR-3X9", //Destiny Collector's Card #06 - Enemy: Hive
    "JMR-LFN-4A3", //Destiny Collector's Card #07 - Destination: The Ocean Of Storms, Moon
    "HC3-H44-DKC", //Destiny Collector's Card #08 - Exotic: Gjallarhorn
    "69P-KRM-JJA", //Destiny Collector's Card #09 - Destination: The Tower
    "69P-VCH-337", //Destiny Collector's Card #10 - Exotic: The Last Word
    "69R-CKD-X7L", //Destiny Collector's Card #11 - Hive: Ogre
    "69R-DDD-FCP", //Destiny Collector's Card #12 - Destination: Valley of Kings, Mars
    "69R-F99-AXG", //Destiny Collector's Card #13 - Enemy: The Fallen
    "69R-VL7-J6A", //Destiny Collector's Card #14 - Exotic: Red Death
    "69X-DJN-74V", //Destiny Collector's Card #15 - Enemy: Cabal
    "6A7-7NP-3X7", //Destiny Collector's Card #16 - Destination: Shattered Coast, Venus
    "6A9-DTG-YGN", //Destiny Collector's Card #17 - Vex: Minotaur
  ];

  // Combine all codes and remove duplicates
  const allCodes = [...new Set([...emblemCodes, ...transmatCodes, ...emoteCodes, ...shaderCodes, ...collectorCards])];

  // Update the code counts in the UI
  totalCodeCountSpan.textContent = allCodes.length;
  emblemCountSpan.textContent = emblemCodes.length;
  shaderCountSpan.textContent = shaderCodes.length;
  emoteCountSpan.textContent = emoteCodes.length;
  transmatCountSpan.textContent = transmatCodes.length;
  collectorCardCountSpan.textContent = collectorCards.length;

  // Function to check if content script is ready
  function checkContentScriptReady() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (!tabs || tabs.length === 0) {
        console.log("No active tabs found");
        showStatus('No active tab found. Please try again.', 'error');
        return;
      }

      const currentTab = tabs[0];
      console.log("Current tab URL:", currentTab.url);

      // First update UI based on URL
      updateUIBasedOnURL(currentTab.url);

      // Try to ping the content script
      console.log("Attempting to ping content script...");
      browser.tabs.sendMessage(currentTab.id, { action: 'ping' })
        .then(response => {
          if (response && response.status === 'pong') {
            console.log("Content script is ready");
            checkCurrentPage();
          } else {
            console.log("Content script responded but with unexpected data:", response);
            showStatus('Content script responded with unexpected data. Please refresh the page and try again.', 'error');
          }
        })
        .catch(error => {
          console.log("Error pinging content script:", error);
          // If we're on the Bungie.net page but content script isn't responding,
          // it might be that the page just loaded and the content script isn't ready yet
          if (currentTab.url.includes('bungie.net')) {
            showStatus('Content script not ready. The page may still be loading. Please wait a moment and try again.', 'info');
          } else {
            showStatus('You need to be on the Bungie code redemption page.', 'info');
          }
        });
    });
  }

  // Function to update UI based on URL
  function updateUIBasedOnURL(url) {
    const isRedeemPage = url.includes('bungie.net') && url.includes('Codes/Redeem');

    if (!isRedeemPage) {
      // Not on the redeem page, update button text
      redeemCodesButton.textContent = 'Go to redeem page';
      showStatus('You need to be on the Bungie code redemption page.', 'info');
    } else {
      // On the redeem page, normal button text
      redeemCodesButton.textContent = 'Start Redemption';
    }
  }

  // Function to check if we're on the redeem page and update UI accordingly
  function checkCurrentPage() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const currentTab = tabs[0];

      // Update UI based on URL first
      const isRedeemPageByUrl = currentTab.url.includes('bungie.net') && currentTab.url.includes('Codes/Redeem');
      updateUIBasedOnURL(currentTab.url);

      // If we're already on the redeem page by URL, update the button immediately
      if (isRedeemPageByUrl) {
        redeemCodesButton.textContent = 'Start Redemption';
      }

      // Also check with content script
      browser.tabs.sendMessage(currentTab.id, { action: 'checkRedeemPage' })
        .then(response => {
          if (response) {
            console.log("Content script redeem page check:", response.isRedeemPage);
            if (response.isRedeemPage) {
              // We're on the redeem page, update button
              redeemCodesButton.textContent = 'Start Redemption';
              showStatus('Ready to redeem codes!', 'success');
            } else {
              redeemCodesButton.textContent = 'Go to redeem page';
              showStatus('You need to be on the Bungie code redemption page.', 'info');
            }
          }
        })
        .catch(error => {
          console.log("Error checking redeem page:", error);
        });
    });
  }

  // Listen for messages from the content script
  browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Message received in popup:", request);

    if (request.action === 'pageIsReady' && request.isRedeemPage) {
      console.log("Redeem page is ready, updating button");
      redeemCodesButton.textContent = 'Start Redemption';
      showStatus('Ready to redeem codes!', 'success');
    }
    
    return Promise.resolve();
  });

  // Send the codes to the content script for redemption
  redeemCodesButton.addEventListener('click', function () {
    // First check if we're on the right page
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const currentTab = tabs[0];

      // Check if we're on the redeem page
      if (!currentTab.url.includes('bungie.net') || !currentTab.url.includes('Codes/Redeem')) {
        // Not on the redeem page, open in a new tab
        browser.tabs.create({ url: 'https://www.bungie.net/7/en/Codes/Redeem' });
        showStatus('Opening redemption page in a new tab.', 'info');
        return;
      }

      // Extract just the codes without descriptions
      const cleanCodes = allCodes.map(codeWithDesc => {
        // Match the code pattern (like "ABC-DEF-GHI")
        const match = codeWithDesc.match(/([A-Za-z0-9]{3}-[A-Za-z0-9]{3}-[A-Za-z0-9]{3})/);
        return match ? match[1] : codeWithDesc.trim();
      }).filter(code => code.length > 0);

      // First ping the content script to make sure it's ready
      browser.tabs.sendMessage(currentTab.id, { action: 'ping' })
        .then(response => {
          if (!response) {
            console.log("No response from content script ping");
            showStatus('Content script not ready. Please refresh the page and try again.', 'error');
            return;
          }

          console.log("Content script is ready, sending codes for redemption");

          // Send the codes to the content script
          return browser.tabs.sendMessage(currentTab.id, { action: 'redeemCodes', codes: cleanCodes });
        })
        .then(response => {
          if (response && response.status === 'started') {
            showStatus(`Starting redemption of ${cleanCodes.length} codes...`, 'success');

            // Update button states when redemption starts
            redeemCodesButton.disabled = true;
            stopRedeemCodesButton.disabled = false;
            stopRedeemCodesButton.style.display = 'block';
          } else {
            console.log("Unexpected response from content script:", response);
            showStatus('Unexpected response from content script. Please refresh and try again.', 'error');
          }
        })
        .catch(error => {
          console.log("Error sending codes to content script:", error);
          showStatus('Error: Content script not ready. Please refresh the page and try again.', 'error');
        });
    });
  });

  // Stop code redemption
  stopRedeemCodesButton.addEventListener('click', function () {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const currentTab = tabs[0];

      // Send stop message to content script
      browser.tabs.sendMessage(currentTab.id, { action: 'stopRedemption' })
        .then(response => {
          if (response && response.status === 'stopped') {
            showStatus('Redemption process stopped.', 'info');

            // Reset UI
            redeemCodesButton.disabled = false;
            stopRedeemCodesButton.disabled = true;
            stopRedeemCodesButton.style.display = 'none';
          }
        })
        .catch(error => {
          showStatus('Error: Content script not ready.', 'error');
        });
    });
  });

  // Show status message
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    // Set color based on message type
    if (type === 'error') {
      statusDiv.style.backgroundColor = '#5c2626';
    } else if (type === 'success') {
      statusDiv.style.backgroundColor = '#265c26';
    } else {
      statusDiv.style.backgroundColor = '#2a2a2a';
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }

  // Check if content script is ready and check current page
  checkContentScriptReady();
});
