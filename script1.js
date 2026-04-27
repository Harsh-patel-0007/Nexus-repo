// ============================================================
// MODAL HELPERS
// ============================================================

function openModal() {
    // Auto-fill today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('Date').value = today;
    document.getElementById('overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('folder_name').value = '';
}

function openfilemodal() {
    document.getElementById('fileoverlay').classList.add('active'); // fixed typo: was 'pctive'
}

function closefilemodal() {
    document.getElementById('fileoverlay').classList.remove('active'); // fixed typo: was 'pctive'
    // Clear all file inputs and name fields
    document.querySelectorAll('#filemodal input[type="file"]').forEach(i => i.value = '');
    document.getElementById('imagename').value = '';
    document.getElementById('videoname').value = '';
    document.getElementById('audioname').value = '';
}

function openhammodal()  { document.getElementById('hamoverlay').classList.add('active'); }
function closehammodal() { document.getElementById('hamoverlay').classList.remove('active'); }


// ============================================================
// MENU ITEM SELECTION (hamburger menu)
// ============================================================

function selectItem(btn, action) {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    closehammodal();
    // You can extend this switch to filter/show different views
    switch (action) {
        case 'logout':
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/logout';
            }
            break;
        default:
            console.log('Selected:', action);
    }
}


// ============================================================
// CREATE FOLDER (local UI only — no backend needed for folders)
// ============================================================

function createFolder() {
    const name = document.getElementById('folder_name').value.trim();
    const date = document.getElementById('Date').value;

    if (name === '') {
        alert('Please enter a folder name!');
        return;
    }

    const dateLabel = formatDate(date);

    const newItem = document.createElement('div');
    newItem.className = 'items';
    newItem.innerHTML = `
        <div class="pic folder-icon">📁</div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // Click on folder to open it (extend as needed)
    newItem.addEventListener('click', () => {
        console.log('Opened folder:', name);
    });

    document.getElementById('foldersGrid').appendChild(newItem);
    closeModal();
}


// ============================================================
// UPLOAD FILE → BACKEND → CREATE FILE CARD
// ============================================================

async function uploadFile() {
    // --- 1. Grab the three file inputs and their name fields ---
    const imageInput = document.querySelector('#filemodal input[type="file"][accept="image/*"]');
    const videoInput = document.querySelector('#filemodal input[type="file"][accept="video/*"]');
    const audioInput = document.querySelector('#filemodal input[type="file"][accept="audio/*"]');

    const imageName  = document.getElementById('imagename').value.trim();
    const videoName  = document.getElementById('videoname').value.trim();
    const audioName  = document.getElementById('audioname').value.trim();

    // --- 2. Collect whichever files were actually picked ---
    const uploads = [];

    if (imageInput.files[0]) {
        uploads.push({ file: imageInput.files[0], name: imageName || imageInput.files[0].name, type: 'image' });
    }
    if (videoInput.files[0]) {
        uploads.push({ file: videoInput.files[0], name: videoName || videoInput.files[0].name, type: 'video' });
    }
    if (audioInput.files[0]) {
        uploads.push({ file: audioInput.files[0], name: audioName || audioInput.files[0].name, type: 'audio' });
    }

    if (uploads.length === 0) {
        alert('Please select at least one file to upload!');
        return;
    }

    // --- 3. Upload each file to the backend ---
    for (const item of uploads) {
        const formData = new FormData();
        formData.append('file', item.file);        // the actual file binary
        formData.append('filename', item.name);    // the custom name
        formData.append('filetype', item.type);    // image / video / audio

        try {
            const response = await fetch('/api/upload', {   // ← your backend endpoint
                method: 'POST',
                body: formData
                // NOTE: Do NOT set Content-Type header — browser sets it automatically with boundary
            });

            if (!response.ok) {
                const err = await response.json();
                alert(`Upload failed for "${item.name}": ${err.message || response.statusText}`);
                continue;
            }

            const data = await response.json();
            // Expected backend response shape:
            // { success: true, filename: "History", filetype: "image", date: "2026-04-19", url: "/uploads/..." }

            // --- 4. Create a file card on the UI ---
            createFileCard(data.filename || item.name, data.filetype || item.type, data.date || new Date().toISOString(), data.url || '');

        } catch (error) {
            console.error('Upload error:', error);
            alert(`Network error while uploading "${item.name}". Check your backend is running.`);
        }
    }

    closefilemodal();
}


// ============================================================
// CREATE FILE CARD ON THE UI
// ============================================================

function createFileCard(name, type, dateStr, url) {
    const dateLabel = formatDate(dateStr);

    // Pick an emoji icon based on file type
    const icons = { image: '🖼️', video: '🎬', audio: '🎵' };
    const icon  = icons[type] || '📄';

    const newItem = document.createElement('div');
    newItem.className = 'items file-card';
    newItem.dataset.url  = url;
    newItem.dataset.name = name;
    newItem.dataset.type = type;

    newItem.innerHTML = `
        <div class="pic file-icon">${icon}</div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // --- Click → open file preview modal ---
    newItem.addEventListener('click', () => openFilePreview(name, type, url));

    document.getElementById('foldersGrid').appendChild(newItem);
}


// ============================================================
// FILE PREVIEW MODAL (opens when a file card is clicked)
// ============================================================

function openFilePreview(name, type, url) {
    // Remove any existing preview modal
    const old = document.getElementById('previewOverlay');
    if (old) old.remove();

    // Build the media element based on type
    let mediaHTML = '';
    if (type === 'image') {
        mediaHTML = `<img src="${url}" alt="${name}" style="max-width:100%;max-height:60vh;border-radius:8px;">`;
    } else if (type === 'video') {
        mediaHTML = `<video controls style="max-width:100%;max-height:60vh;border-radius:8px;">
                        <source src="${url}">
                        Your browser does not support video.
                     </video>`;
    } else if (type === 'audio') {
        mediaHTML = `<audio controls style="width:100%;">
                        <source src="${url}">
                        Your browser does not support audio.
                     </audio>`;
    } else {
        mediaHTML = `<p>Cannot preview this file type.</p>`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'previewOverlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.75);
        display:flex;align-items:center;justify-content:center;z-index:9999;
    `;

    overlay.innerHTML = `
        <div style="background:#1e1e2e;padding:24px;border-radius:16px;
                    max-width:600px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;color:#fff;font-size:16px;">${name}</h3>
                <button onclick="document.getElementById('previewOverlay').remove()"
                    style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;">✕</button>
            </div>
            <div style="text-align:center;">${mediaHTML}</div>
            <div style="margin-top:16px;text-align:right;">
                <a href="${url}" download="${name}"
                   style="background:#6c63ff;color:#fff;padding:8px 20px;border-radius:8px;
                          text-decoration:none;font-size:14px;">⬇ Download</a>
            </div>
        </div>
    `;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
}


// ============================================================
// UTILITY — format date string to "Apr 2026"
// ============================================================

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
