let manifestsData = [];
let dlcList = {};

function showStatus(message, loading = false) {
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  const statusSpinner = document.getElementById('statusSpinner');
  
  statusText.textContent = message;
  
  if (loading) {
    statusSpinner.classList.remove('hidden');
  } else {
    statusSpinner.classList.add('hidden');
  }
  
  statusBar.classList.remove('hidden');
  
  if (!loading) {
    setTimeout(() => {
      statusBar.classList.add('hidden');
    }, 3000);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl animate-slide-up flex items-center gap-3`;
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 5000);
}

function validateManifest(manifest) {
  const errors = [];
  
  if (!manifest.manifestId || !/^\d{10,22}$/.test(manifest.manifestId)) {
    errors.push('Invalid Manifest ID');
  }
  
  if (!manifest.depotId || !/^\d{5,9}$/.test(manifest.depotId)) {
    errors.push('Invalid Depot ID');
  }
  
  if (!manifest.appid) {
    errors.push('Missing APPID');
  } else if (!/^\d+$/.test(manifest.appid)) {
    errors.push('Invalid APPID');
  }
  
  if (manifest.decryptionKey && !/^[0-9a-fA-F]{64}$/.test(manifest.decryptionKey)) {
    errors.push('Invalid Decryption Key');
  }
  
  return errors;
}

function updateTable() {
  const tbody = document.getElementById('manifestTable');
  
  if (manifestsData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center p-8 text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg font-medium">No manifests loaded</p>
          <p class="text-sm">Click "Scan Steam Depotcache" or "Select .manifest Files" to get started</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = '';
  
  manifestsData.forEach((manifest, index) => {
    const errors = validateManifest(manifest);
    const isValid = errors.length === 0;
    const rowClass = isValid ? 'hover:bg-slate-50 transition-colors' : 'bg-red-50 hover:bg-red-100 transition-colors';
    
    const tr = document.createElement('tr');
    tr.className = `border-b border-slate-200 ${rowClass}`;
    
    tr.innerHTML = `
      <td class="p-2 text-xs truncate max-w-xs" title="${manifest.file}">${manifest.file}</td>
      <td class="p-2 text-xs font-mono">${manifest.manifestId || '-'}</td>
      <td class="p-2 text-xs font-mono">${manifest.depotId || '-'}</td>
      <td class="p-2">
        <input type="number" 
               class="w-20 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
               value="${manifest.appid || ''}" 
               data-index="${index}"
               data-field="appid">
      </td>
      <td class="p-2">
        <select class="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                data-index="${index}"
                data-field="type">
          <option value="Base" ${manifest.type === 'Base' ? 'selected' : ''}>Base</option>
          <option value="DLC" ${manifest.type === 'DLC' ? 'selected' : ''}>DLC</option>
          <option value="Depot" ${manifest.type === 'Depot' ? 'selected' : ''}>Depot</option>
        </select>
      </td>
      <td class="p-2 text-xs font-mono truncate max-w-xs" title="${manifest.decryptionKey || 'None'}">
        ${manifest.decryptionKey ? manifest.decryptionKey.substring(0, 16) + '...' : '-'}
      </td>
      <td class="p-2 text-xs">
        <span class="${isValid ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}">
          ${isValid ? '✓ Valid' : '✗ ' + errors.join(', ')}
        </span>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  document.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const field = e.target.dataset.field;
      manifestsData[index][field] = e.target.value;
      updatePreview();
      updateSaveButton();
    });
  });
  
  updatePreview();
  updateSaveButton();
}

function updatePreview() {
  const preview = document.getElementById('luaPreview');
  
  if (manifestsData.length === 0) {
    preview.innerHTML = '<code>-- No data to preview\n-- Scan or select manifest files to see Lua output here</code>';
    return;
  }
  
  const groupedByAppid = {};
  
  manifestsData.forEach(manifest => {
    const errors = validateManifest(manifest);
    if (errors.length === 0 && manifest.appid) {
      if (!groupedByAppid[manifest.appid]) {
        groupedByAppid[manifest.appid] = [];
      }
      groupedByAppid[manifest.appid].push(manifest);
    }
  });
  
  let luaContent = '';
  
  const sortedAppids = Object.keys(groupedByAppid).sort((a, b) => parseInt(a) - parseInt(b));
  
  sortedAppids.forEach(appid => {
    const manifests = groupedByAppid[appid];
    
    luaContent += `-- APPID: ${appid}\n`;
    luaContent += `addappid(${appid})\n`;
    
    manifests.forEach(manifest => {
      luaContent += `setManifestid(${appid},"${manifest.manifestId}")\n`;
      if (manifest.decryptionKey) {
        luaContent += `setDecryptionKey(${appid},"${manifest.decryptionKey}")\n`;
      }
    });
    
    luaContent += '\n';
  });
  
  if (luaContent) {
    preview.innerHTML = `<code>${escapeHtml(luaContent.trim())}</code>`;
  } else {
    preview.innerHTML = '<code>-- No valid data to generate\n-- Fix validation errors in the table above</code>';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateSaveButton() {
  const saveBtn = document.getElementById('saveBtn');
  const validManifests = manifestsData.filter(m => validateManifest(m).length === 0 && m.appid);
  const outputRoot = document.getElementById('outputRoot').value;
  
  saveBtn.disabled = validManifests.length === 0 || !outputRoot;
}

async function scanDepotcache() {
  try {
    showStatus('Scanning Steam depotcache...', true);
    
    const result = await window.electron.scanDepotcache();
    manifestsData = result.manifests;
    dlcList = result.dlcList;
    
    const inferAppid = document.getElementById('inferAppid').checked;
    const defaultAppid = document.getElementById('defaultAppid').value;
    
    if (!inferAppid && defaultAppid) {
      manifestsData.forEach(manifest => {
        if (!manifest.appid) {
          manifest.appid = defaultAppid;
        }
      });
    }
    
    updateTable();
    showStatus(`Found ${manifestsData.length} manifest files`);
    showToast(`Successfully scanned ${manifestsData.length} manifest files`, 'success');
  } catch (error) {
    showStatus('');
    showToast(`Error: ${error.message}`, 'error');
    console.error('Scan error:', error);
  }
}

async function selectFiles() {
  try {
    showStatus('Selecting manifest files...', true);
    
    const manifests = await window.electron.selectManifestFiles();
    
    if (manifests.length === 0) {
      showStatus('');
      return;
    }
    
    manifestsData = manifests;
    
    const inferAppid = document.getElementById('inferAppid').checked;
    const defaultAppid = document.getElementById('defaultAppid').value;
    
    if (!inferAppid && defaultAppid) {
      manifestsData.forEach(manifest => {
        if (!manifest.appid) {
          manifest.appid = defaultAppid;
        }
      });
    }
    
    updateTable();
    showStatus(`Loaded ${manifestsData.length} manifest files`);
    showToast(`Successfully loaded ${manifestsData.length} manifest files`, 'success');
  } catch (error) {
    showStatus('');
    showToast(`Error: ${error.message}`, 'error');
    console.error('Select files error:', error);
  }
}

async function selectFolder() {
  try {
    const folder = await window.electron.selectFolder();
    if (folder) {
      document.getElementById('outputRoot').value = folder;
      updateSaveButton();
      saveSettings();
    }
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
    console.error('Select folder error:', error);
  }
}

async function saveLuaScripts() {
  try {
    const outputRoot = document.getElementById('outputRoot').value;
    const structure = document.querySelector('input[name="structure"]:checked').value;
    const pattern = document.getElementById('filenamePattern').value;
    const dumpMode = document.getElementById('dumpMode').value;
    
    if (!outputRoot) {
      showToast('Please select an output directory', 'warning');
      return;
    }
    
    showStatus('Saving Lua scripts...', true);
    
    const savedFiles = await window.electron.saveLuaScripts({
      manifests: manifestsData,
      outputRoot,
      structure,
      pattern,
      dumpMode,
      dlcList
    });
    
    showStatus('');
    showToast(`Successfully saved ${savedFiles.length} Lua script(s)`, 'success');
  } catch (error) {
    showStatus('');
    showToast(`Error: ${error.message}`, 'error');
    console.error('Save error:', error);
  }
}

function copyToClipboard() {
  const preview = document.getElementById('luaPreview');
  const text = preview.textContent;
  
  if (text.includes('-- No')) {
    showToast('Nothing to copy', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(err => {
    showToast('Failed to copy to clipboard', 'error');
    console.error('Copy error:', err);
  });
}

async function loadSettings() {
  try {
    const settings = await window.electron.loadSettings();
    if (settings) {
      if (settings.defaultAppid) {
        document.getElementById('defaultAppid').value = settings.defaultAppid;
      }
      if (settings.inferAppid !== undefined) {
        document.getElementById('inferAppid').checked = settings.inferAppid;
      }
      if (settings.dumpMode) {
        document.getElementById('dumpMode').value = settings.dumpMode;
      }
      if (settings.outputRoot) {
        document.getElementById('outputRoot').value = settings.outputRoot;
      }
      if (settings.structure) {
        const radio = document.querySelector(`input[name="structure"][value="${settings.structure}"]`);
        if (radio) radio.checked = true;
      }
      if (settings.filenamePattern) {
        document.getElementById('filenamePattern').value = settings.filenamePattern;
      }
    }
  } catch (error) {
    console.error('Load settings error:', error);
  }
}

async function saveSettings() {
  try {
    const settings = {
      defaultAppid: document.getElementById('defaultAppid').value,
      inferAppid: document.getElementById('inferAppid').checked,
      dumpMode: document.getElementById('dumpMode').value,
      outputRoot: document.getElementById('outputRoot').value,
      structure: document.querySelector('input[name="structure"]:checked').value,
      filenamePattern: document.getElementById('filenamePattern').value
    };
    
    await window.electron.saveSettings(settings);
  } catch (error) {
    console.error('Save settings error:', error);
  }
}

document.getElementById('scanBtn').addEventListener('click', scanDepotcache);
document.getElementById('selectFilesBtn').addEventListener('click', selectFiles);
document.getElementById('saveBtn').addEventListener('click', saveLuaScripts);
document.getElementById('selectFolderBtn').addEventListener('click', selectFolder);
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

document.getElementById('defaultAppid').addEventListener('change', () => {
  saveSettings();
  updateSaveButton();
});

document.getElementById('inferAppid').addEventListener('change', saveSettings);
document.getElementById('dumpMode').addEventListener('change', saveSettings);
document.getElementById('filenamePattern').addEventListener('change', saveSettings);

document.querySelectorAll('input[name="structure"]').forEach(radio => {
  radio.addEventListener('change', saveSettings);
});

loadSettings();
