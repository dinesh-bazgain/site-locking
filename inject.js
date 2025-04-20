if (!sessionStorage.getItem('unlocked')) {
  if (!window.hasPromptedForPassword) {
    window.hasPromptedForPassword = true;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.webkitBackdropFilter = 'blur(5px)'; // For Safari
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998';
    document.body.appendChild(overlay);

    // Create password dialog
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'gray';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '10px';
    dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    dialog.style.zIndex = '9999';

    // Create password input with custom masking
    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = 'Enter password';
    input.style.display = 'block';
    input.style.marginBottom = '10px';
    input.style.padding = '8px';
    input.style.color = 'black';
    input.style.width = '200px';
    input.style.fontFamily = 'text-security-disc'; // Fallback for asterisks
    
    let realPassword = '';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        realPassword = realPassword.slice(0, -1);
        input.value = '*'.repeat(realPassword.length);
        e.preventDefault();
      }
      else if (e.key === 'Enter') {
        submitPassword();
      }
      else if (e.key.length === 1) {
        realPassword += e.key;
        input.value = '*'.repeat(realPassword.length);
        e.preventDefault();
      }
    });

    // Create buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '10px';
    buttons.style.justifyContent = 'flex-end';

    // Create submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'OK';
    submitBtn.style.padding = '8px 16px';
    submitBtn.addEventListener('click', submitPassword);

    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '8px 16px';
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'https://www.youtube.com/watch?v=umDr0mPuyQc';
    });


    // Modified password validation function
    async function submitPassword() {
      const { passwordHash } = await chrome.storage.local.get('passwordHash');
      const enteredHash = await hashPassword(realPassword);
      
      if (enteredHash === passwordHash) {
        sessionStorage.setItem('unlocked', 'true');
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        
        // Notify background script to authorize this tab
        chrome.runtime.sendMessage({ type: 'AUTHORIZE_TAB' });
      } else {
        window.location.href = 'https://www.youtube.com/watch?v=umDr0mPuyQc';
      }
    }

    // Add hashPassword function
    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ... [rest of your existing code] ...
    // Assemble elements
    buttons.appendChild(cancelBtn);
    buttons.appendChild(submitBtn);
    dialog.appendChild(input);
    dialog.appendChild(buttons);
    document.body.appendChild(dialog);

    // Focus on input
    input.focus();

    // Disable form submission
    dialog.addEventListener('submit', (e) => e.preventDefault());
  }
}