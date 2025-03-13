// Global variable to track if redemption should be stopped
let stopRedemptionRequested = false;

// Initialize the content script
console.log("Destiny 2 Code Redeemer content script initialized");

// Check if we're on the redeem page and add appropriate UI
document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded, checking redeem page status");
  checkRedeemPage();
});

// Also check when the page is fully loaded (including images and other resources)
window.addEventListener('load', function() {
  console.log("Window fully loaded, checking redeem page status");
  checkRedeemPage();
  
  // If we're on the redeem page, notify the popup
  if (isRedeemPage()) {
    console.log("On redeem page, notifying popup");
    browser.runtime.sendMessage({ action: 'pageIsReady', isRedeemPage: true });
  }
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received in content script:", request.action);

  if (request.action === 'ping') {
    // Simple ping to check if content script is ready
    console.log("Ping received, responding with pong");
    return Promise.resolve({ status: 'pong' });
  }
  
  if (request.action === 'redeemCodes') {
    // Reset the stop flag when starting a new redemption process
    stopRedemptionRequested = false;
    
    // Check if we're on the redeem page
    if (!isRedeemPage()) {
      // If not, show a message to redirect
      console.log("Not on redeem page, showing redirect overlay");
      createRedirectOverlay();
      return Promise.resolve({ status: 'error', message: 'Not on redeem page' });
    }
    
    console.log("Starting redemption process for", request.codes.length, "codes");
    
    // Start the redemption process
    redeemCodes(request.codes);
    return Promise.resolve({ status: 'started' });
  } 
  
  if (request.action === 'stopRedemption') {
    // Set the flag to stop the redemption process
    stopRedemptionRequested = true;
    console.log("Redemption process stopped by user");
    return Promise.resolve({ status: 'stopped' });
  } 
  
  if (request.action === 'checkRedeemPage') {
    // Return whether we're on the redeem page
    const isOnRedeemPage = isRedeemPage();
    console.log("Checking redeem page status, result:", isOnRedeemPage);
    return Promise.resolve({ isRedeemPage: isOnRedeemPage });
  }
  
  // Default response for unhandled actions
  return Promise.resolve({ status: 'unknown_action' });
});

// Function to check if we're on the redeem page
function isRedeemPage() {
  return window.location.href.includes('bungie.net') && window.location.href.includes('Codes/Redeem');
}

// Function to check the current page and add appropriate UI
function checkRedeemPage() {
  // If we're not on the redeem page, we don't need to do anything
  if (!document.body) {
    // Wait for the body to be available
    window.addEventListener('DOMContentLoaded', checkRedeemPage);
    return;
  }

  // Check again when the URL changes
  window.addEventListener('popstate', checkRedeemPage);
}

// Function to create a redirect overlay
function createRedirectOverlay() {
  // Remove any existing overlay
  removeStatusOverlay();

  // Create overlay elements
  const overlay = document.createElement('div');
  overlay.id = 'bungie-redeemer-overlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 350px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  `;

  const statusText = document.createElement('div');
  statusText.id = 'bungie-redeemer-status';
  statusText.textContent = 'You need to be on the Bungie code redemption page to redeem codes.';
  statusText.style.cssText = `
    margin-bottom: 10px;
  `;

  // Create redirect button
  const redirectButton = document.createElement('button');
  redirectButton.id = 'bungie-redeemer-redirect';
  redirectButton.textContent = 'Go to redeem page';
  redirectButton.style.cssText = `
    background-color: #d4af37;
    color: black;
    border: none;
    padding: 8px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
    margin-right: 10px;
  `;

  // Add click event to redirect
  redirectButton.addEventListener('click', function () {
    window.location.href = 'https://www.bungie.net/7/en/Codes/Redeem';
  });

  // Assemble the overlay
  overlay.appendChild(statusText);
  overlay.appendChild(redirectButton);
  document.body.appendChild(overlay);

  // Auto-remove after 30 seconds
  setTimeout(removeStatusOverlay, 30000);
}

// Function to redeem codes one by one
async function redeemCodes(codes) {
  console.log(`Starting to redeem ${codes.length} codes...`);

  // Create a status overlay to show progress
  createStatusOverlay();

  // Process each code with delay between submissions
  for (let i = 0; i < codes.length; i++) {
    // Check if stop was requested
    if (stopRedemptionRequested) {
      const message = i === 0 ? `Redemption stopped before starting` : i === 1 ? `Redemption stopped after ${i} code` : `Redemption stopped after ${i} codes`;
      updateStatusOverlay(message, 'info');
      console.log(`Redemption process stopped after ${i} ${i === 1 ? 'code' : 'codes'}`);

      // Remove the overlay after 5 seconds
      setTimeout(removeStatusOverlay, 5000);
      return;
    }

    const code = codes[i];
    updateStatusOverlay(`Redeeming code ${i + 1}/${codes.length}: ${code}`);

    try {
      await redeemSingleCode(code);
      // Add a delay between submissions to avoid rate limiting
      if (i < codes.length - 1) {
        await sleep(1000); // 1 second delay between submissions
      }
    } catch (error) {
      console.error(`Error redeeming code ${code}:`, error);
      updateStatusOverlay(`Error with code ${code}: ${error.message}`, 'error');
      await sleep(1000);
    }
  }

  updateStatusOverlay(`Completed redemption of ${codes.length} codes!`, 'success');
  // Remove the overlay after 5 seconds
  setTimeout(removeStatusOverlay, 5000);
}

// Function to redeem a single code
async function redeemSingleCode(code) {
  return new Promise((resolve, reject) => {
    try {
      // Find the input field
      const inputField = document.querySelector('input[placeholder="XXX-XXX-XXX"]');
      if (!inputField) {
        reject(new Error('Could not find the code input field'));
        return;
      }

      // Clear any existing value
      inputField.value = '';

      // Set the value and trigger input event
      inputField.value = code;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));

      // Find the redeem button (it's usually in the parent div of the input)
      let redeemButton = null;
      let parentElement = inputField.parentElement;

      // Look for the button in the parent elements (up to 5 levels)
      for (let i = 0; i < 5; i++) {
        if (!parentElement) break;

        const button = parentElement.querySelector('button');
        if (button) {
          redeemButton = button;
          break;
        }
        parentElement = parentElement.parentElement;
      }

      if (!redeemButton) {
        reject(new Error('Could not find the redeem button'));
        return;
      }

      // Click the button
      redeemButton.click();

      // Check for confirmation modal (for already redeemed codes)
      setTimeout(() => {
        // Look for confirmation modal with "Ok" button
        const confirmationModal = document.querySelector('div[class*="ConfirmationModal_buttons"]');
        if (confirmationModal) {
          // Find the "Ok" button within the modal
          const okButton = confirmationModal.querySelector('button');
          if (okButton) {
            console.log('Found confirmation modal, clicking Ok button');
            okButton.click();
            resolve();
          } else {
            console.log('Found confirmation modal but could not find Ok button');
            resolve();
          }
        } else {
          // Check for success box (CodesRedemptionForm_box)
          const successBox = document.querySelector('div[class*="CodesRedemptionForm_box"]');
          if (successBox) {
            console.log('Found success box, looking for button to continue');
            // Find the button within the success box
            const continueButton = document.querySelector('button[class*="CodesRedemptionForm_button"]');
            if (continueButton) {
              console.log('Found continue button, clicking to prepare for next code');
              continueButton.click();
            } else {
              console.log('Success box found but no continue button');
            }
          }

          // Consider it successful regardless
          resolve();
        }
      }, 1500); // Wait 1.5 seconds for any modal to appear
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a status overlay to show progress
function createStatusOverlay() {
  // Remove any existing overlay
  removeStatusOverlay();

  // Create overlay elements
  const overlay = document.createElement('div');
  overlay.id = 'bungie-redeemer-overlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 350px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  `;

  const statusText = document.createElement('div');
  statusText.id = 'bungie-redeemer-status';
  statusText.style.cssText = `
    margin-bottom: 10px;
  `;

  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = `
    width: 100%;
    background-color: #333;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 10px;
  `;

  const progressBar = document.createElement('div');
  progressBar.id = 'bungie-redeemer-progress';
  progressBar.style.cssText = `
    height: 5px;
    width: 0%;
    background-color: #d4af37;
    transition: width 0.3s;
  `;

  // Create stop button
  const stopButton = document.createElement('button');
  stopButton.id = 'bungie-redeemer-stop';
  stopButton.textContent = 'Stop Redemption';
  stopButton.style.cssText = `
    background-color: #9e2a2a;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
    transition: background-color 0.3s;
  `;

  // Add click event to stop button
  stopButton.addEventListener('click', function () {
    stopRedemptionRequested = true;
    stopButton.textContent = 'Stopping...';
    stopButton.disabled = true;
    stopButton.style.backgroundColor = '#666';
  });

  // Assemble the overlay
  progressContainer.appendChild(progressBar);
  overlay.appendChild(statusText);
  overlay.appendChild(progressContainer);
  overlay.appendChild(stopButton);
  document.body.appendChild(overlay);
}

// Update the status overlay
function updateStatusOverlay(message, type = 'info') {
  const statusText = document.getElementById('bungie-redeemer-status');
  const progressBar = document.getElementById('bungie-redeemer-progress');

  if (statusText) {
    statusText.textContent = message;

    // Set color based on message type
    if (type === 'error') {
      statusText.style.color = '#ff6b6b';
    } else if (type === 'success') {
      statusText.style.color = '#6bff6b';
    } else {
      statusText.style.color = 'white';
    }
  }

  // Extract progress information if available
  const progressMatch = message.match(/(\d+)\/(\d+)/);
  if (progressMatch && progressBar) {
    const [_, current, total] = progressMatch;
    const percentage = (parseInt(current) / parseInt(total)) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

// Remove the status overlay
function removeStatusOverlay() {
  const overlay = document.getElementById('bungie-redeemer-overlay');
  if (overlay) {
    overlay.remove();
  }
}
