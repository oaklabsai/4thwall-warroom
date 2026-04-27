/**
 * War Room Password Gate
 * Simple client-side password protection
 * Stores auth in sessionStorage (clears on tab close)
 */

(function() {
  const PASSWORD_HASH = 'be01497ab3ff09930187054421695cd19e63dbdb1fbf574a8bca07ae88a551f4'; // "greenwich"
  const STORAGE_KEY = 'warroom_auth';
  
  async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  function isAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  }
  
  function setAuthenticated() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }
  
  function clearAuthentication() {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  
  async function validatePassword(input) {
    const hash = await sha256(input);
    return hash === PASSWORD_HASH;
  }
  
  function createGate() {
    const gate = document.createElement('div');
    gate.id = 'warroom-gate';
    gate.innerHTML = `
      <style>
        #warroom-gate {
          position: fixed;
          inset: 0;
          background: #111110;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Geist', system-ui, sans-serif;
        }
        .gate-container {
          text-align: center;
          padding: 2rem;
          max-width: 400px;
        }
        .gate-title {
          font-family: 'Geist Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 1.5rem;
        }
        .gate-heading {
          font-size: 28px;
          font-weight: 600;
          color: #f0ede8;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .gate-sub {
          font-size: 14px;
          color: #6b6b68;
          margin-bottom: 2.5rem;
          line-height: 1.5;
        }
        .gate-input-wrap {
          position: relative;
          margin-bottom: 1rem;
        }
        .gate-input {
          width: 100%;
          background: #1a1a18;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 14px 16px;
          color: #f0ede8;
          font-family: 'Geist Mono', monospace;
          font-size: 14px;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.15s;
          text-align: center;
        }
        .gate-input:focus {
          border-color: rgba(201, 168, 76, 0.4);
        }
        .gate-input::placeholder {
          color: #6b6b68;
          font-family: 'Geist', system-ui, sans-serif;
          letter-spacing: 0;
        }
        .gate-btn {
          width: 100%;
          padding: 14px 24px;
          background: #c9a84c;
          border: none;
          border-radius: 8px;
          color: #111110;
          font-family: 'Geist', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .gate-btn:hover {
          opacity: 0.9;
        }
        .gate-btn:active {
          opacity: 0.8;
        }
        .gate-error {
          color: #c94c4c;
          font-size: 12px;
          margin-top: 1rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .gate-error.show {
          opacity: 1;
        }
        .gate-hint {
          font-size: 11px;
          color: #4a4a48;
          margin-top: 2rem;
        }
      </style>
      <div class="gate-container">
        <div class="gate-title">⚡ 4THWALL · WAR ROOM</div>
        <h1 class="gate-heading">Restricted Access</h1>
        <p class="gate-sub">This area contains confidential business intelligence. Authorized personnel only.</p>
        <div class="gate-input-wrap">
          <input type="password" class="gate-input" id="gatePassword" placeholder="Enter access code" autocomplete="off">
        </div>
        <button class="gate-btn" id="gateSubmit">Enter War Room</button>
        <div class="gate-error" id="gateError">Invalid access code</div>
      </div>
    `;
    return gate;
  }
  
  async function handleSubmit() {
    const input = document.getElementById('gatePassword');
    const error = document.getElementById('gateError');
    const btn = document.getElementById('gateSubmit');
    
    const password = input.value.trim();
    if (!password) return;
    
    btn.disabled = true;
    btn.textContent = 'Verifying...';
    
    const valid = await validatePassword(password);
    
    if (valid) {
      setAuthenticated();
      const gate = document.getElementById('warroom-gate');
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 0.3s';
      setTimeout(() => gate.remove(), 300);
    } else {
      error.classList.add('show');
      input.value = '';
      input.focus();
      btn.disabled = false;
      btn.textContent = 'Enter War Room';
      
      // Shake animation
      input.style.transform = 'translateX(-5px)';
      setTimeout(() => input.style.transform = 'translateX(5px)', 50);
      setTimeout(() => input.style.transform = 'translateX(-5px)', 100);
      setTimeout(() => input.style.transform = 'translateX(0)', 150);
    }
  }
  
  function init() {
    // Check if already authenticated this session
    if (isAuthenticated()) {
      return; // Gate not needed
    }
    
    // Create and show gate
    const gate = createGate();
    document.body.appendChild(gate);
    
    // Focus input
    setTimeout(() => document.getElementById('gatePassword').focus(), 100);
    
    // Event listeners
    document.getElementById('gateSubmit').addEventListener('click', handleSubmit);
    document.getElementById('gatePassword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
    
    // Clear error on input
    document.getElementById('gatePassword').addEventListener('input', () => {
      document.getElementById('gateError').classList.remove('show');
    });
  }
  
  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose for manual use
  window.WarRoomGate = {
    logout: () => {
      clearAuthentication();
      location.reload();
    },
    isAuthenticated
  };
})();
