document.addEventListener('DOMContentLoaded', async () => {
  const updateBtn = document.getElementById('updatePassword');
  const statusEl = document.getElementById('status');

  updateBtn.addEventListener('click', async () => {
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    // Validate inputs
    if (newPass !== confirmPass) {
      statusEl.textContent = "New passwords don't match!";
      return;
    }

    // Get stored hash
    const { passwordHash } = await chrome.storage.local.get('passwordHash');

    // Verify current password if exists
    if (passwordHash) {
      const currentHash = await hashPassword(currentPass);
      if (currentHash !== passwordHash) {
        statusEl.textContent = "Current password is incorrect!";
        return;
      }
    }

    // Store new password hash
    const newHash = await hashPassword(newPass);
    await chrome.storage.local.set({ passwordHash: newHash });
    
    statusEl.textContent = "Password updated successfully!";
    statusEl.style.color = "green";
    setTimeout(() => {
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      statusEl.textContent = '';
    }, 1500);
  });
});

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}