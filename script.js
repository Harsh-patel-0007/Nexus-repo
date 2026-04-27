// const { json } = require("express");
// const { json } = require("node:stream/consumers");

// const { post } = require("d:/backend_knovia/src/app");

function openModal() { document.getElementById('overlay').classList.add('active'); }

function closeModal() { document.getElementById('overlay').classList.remove('active'); }

function closeModal() { document.getElementById('overlay').classList.remove('active'); }

///...........................................................//
// Create folder — runs when Create button is clicked
function createFolder() {

    // Step 1 — read the inputs
    const name = document.getElementById('folder_name').value.trim();
    const date = document.getElementById('Date').value;


    // Step 2 — if name is empty, stop
    if (name === '') {
        alert('Please enter a folder name!');
        return;
    }


    // Step 3 — format date nicely e.g. "Apr 2026"
    const d = new Date(date);
    const dateLabel = d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
    });


    //........................................................................//
    // Step 4 — create a new item div (matching YOUR html structure)
    const newItem = document.createElement('div');
    newItem.className = 'items';

    newItem.innerHTML = `
        <div class="pic"></div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // Step 5 — append it to foldersGrid
    document.getElementById('foldersGrid').appendChild(newItem);

    // Step 6 — close the modal
    closeModal();
}


//..............................................................//
//.......................filemodal...............//
function openfilemodal() { document.getElementById('fileoverlay').classList.add('pctive'); }

function closefilemodal() { document.getElementById('fileoverlay').classList.remove('pctive'); }


//............ham..................................//
function closehammodal() { document.getElementById('hamoverlay').classList.remove('active'); }

function openhammodal() { document.getElementById('hamoverlay').classList.add('active'); }

const menu = document.getElementById("hamoverlay")

document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        menu.classList.remove("active")
    })
})

//.............................................................................//
//..........profile................//
function closeprofile() { document.getElementById('profileoverlay').classList.remove('active'); }

function openprofile() { document.getElementById('profileoverlay').classList.add('active'); }


//....................................................................................................//
// ============================================================
// ASSUMPTIONS ABOUT YOUR HTML FORM:
//
//   <input type="file"   id="fileInput">       ← file picker
//   <input type="text"   id="fileName">        ← custom name field
//   <button onclick="uploadFile()">Upload</button>
// ============================================================


async function uploadFile() {

    // -----------------------------------------------------------
    // STEP 1 — Read values from the form
    // -----------------------------------------------------------
    const fileInput = document.getElementById('fileInput');   // the file picker
    const fileNameInput = document.getElementById('imageName'); // the text input

    const file = fileInput.files[0];          // actual file object
    const fileName = fileNameInput.value.trim();  // custom name typed by user

    // -----------------------------------------------------------
    // STEP 2 — Basic validation before sending anything
    // -----------------------------------------------------------
    if (!file) {
        alert('Please select a file first!');
        return;
    }
    if (fileName === '') {
        alert('Please enter a file name!');
        return;
    }

    // -----------------------------------------------------------
    // STEP 3 — Pack everything into FormData
    //
    //   FormData is a built-in browser object that bundles
    //   files + text fields together, exactly like an HTML form
    //   submission — but done programmatically in JS.
    // -----------------------------------------------------------
    const formData = new FormData();
    formData.append('file', file);          // key: 'file'     → the binary file
    formData.append('fileName', fileName);  // key: 'filename' → the custom name

    // Optional: send file type too (handy for backend filtering)
    formData.append('filetype', file.type); // e.g. "image/png", "video/mp4"/////////////////////////

    // -----------------------------------------------------------
    // STEP 4 — Send FormData to your backend via fetch API
    // -----------------------------------------------------------

    // Show a loading state on the button
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/files', {
            //                           ^^^^^^^^^^^^
            //              Replace this with your actual backend endpoint URL
            //              e.g. 'http://localhost:5000/upload'  (Flask)
            //              e.g. 'http://localhost:3000/upload'  (Express)

            method: 'POST',
            body: formData,
            credentials:"include"
            // ⚠️ DO NOT set Content-Type header manually.
            // The browser sets it automatically to multipart/form-data
            // with the correct boundary — if you set it manually, it breaks.
        });

        // -----------------------------------------------------------
        // STEP 5 — Handle the backend response
        // -----------------------------------------------------------

        const data = await response.json();
        //  Expected backend response (example):
        //  { success: true, message: "File saved!", fileId: 42 }

        if (response.ok) {
            // ✅ Success
            console.log('Upload successful:', data);
            alert(`File "${fileName}" uploaded successfully!`);

            // Optional: reset the form after success
            fileInput.value = '';
            fileNameInput.value = '';
            
            // loadFilesFromDB()

        } else {
            // ❌ Backend returned an error (e.g. 400, 500)
            console.error('Upload failed:', data);
            alert(`Upload failed: ${data.message || 'Unknown error from server'}`);
        }

    } catch (error) {
        // ❌ Network error — backend not reachable
        console.error('Network error:', error);
        alert('Could not reach the server. Make sure your backend is running.');

    } finally {
        // Always re-enable the button whether success or fail
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
    }
}


// ============================================================
// RUNS ON PAGE LOAD — fetch all saved files and render cards
// ============================================================

window.addEventListener('load', () => {
    loadFilesFromDB();
});

// setInterval(() => {
//     loadFilesFromDB()
// }, 5000)

async function loadFilesFromDB() {
    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/files',{
            credentials: "include"
        }); // ← your backend IP:port
        // credentials: true
        const data = await response.json();

        data.forEach(file => {
            createFileCard(file.fileName, file.file, file.date);
        });

    } catch (error) {
        console.error('Could not load files', error);
    }
}

// ============================================================
// CREATE CARD — same structure as your folder card
// ============================================================

function createFileCard(name, url, dateStr) {
    const dateLabel = new Date(dateStr).toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
    });

    const newItem = document.createElement('div');
    newItem.className = 'items';
    newItem.innerHTML = `
        <div class="pic"><img src="file_12477960.png" alt=""></div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // Click → open file preview
    newItem.addEventListener('click', () => {
        window.open(url, '_blank');
    });

    document.getElementById('foldersGrid').appendChild(newItem);
}

// createFileCard()

//.............folders...........................................//

async function uploadFolder() {
    const folderNameInput = document.getElementById('folder_name');

    const folderName = folderNameInput.value.trim();


    if (folderName === '') {
        alert('Please enter a folder name!');
        return;
    }

    const createbtn = document.getElementById('createbtn');
    createbtn.disabled = true;
    createbtn.textContent = 'creating...';

    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/folder', {
            method: 'POST',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ folderName }),
            credentials:"include"
        })

        const data = await response.json();

        if (response.ok) {
            // ✅ Success
            console.log('Upload successful:', data);
            alert(`File "${folderName}" uploaded successfully!`);


            // Optional: reset the form after success
            folderNameInput.value = '';

            // loadFoldersFromDB()
        }



        else {
            console.error('Upload failed:', data);
            alert(`Upload failed: ${data.message || 'Unknown error from server'}`);
        }
    }
    catch (error) {
        console.error('Network error:', error);
        alert('Could not reach the server. Make sure your backend is running.');
    }

    finally {
        createbtn.disabled = false;
        createbtn.textContent = 'Create';
    }
}

window.addEventListener('load', () => {
    loadFoldersFromDB();
});

// setInterval(() => {
//     loadFoldersFromDB()
// }, 5000)

async function loadFoldersFromDB() {
    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/folder',
            {
                credentials: "include"
            }
        ); // ← your backend IP:port
       
        const resData = await response.json();
        const folders = resData

        if(!Array.isArray(folders)){
            console.log("response:",folders)
            return
        }

        folders.forEach(folder => {

            console.log(folder)
            createFolderCard(folder.folderName, folder._id, folder.date);
        });

    } catch (error) {
        console.error('Could not load folders:', error);
    }
}

function createFolderCard(name, folderId, dateStr) {
    console.log("createFolderCard called with ", name, folderId, dateStr)
    const dateLabel = new Date(dateStr).toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
    });

    const newItem = document.createElement('div');
    newItem.className = 'items';
    newItem.innerHTML = `
        <div class="pic"><img src="folder.png" alt=""></div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // Click → open file preview
    newItem.addEventListener('click', () => {
        openFolder(folderId, name);
    });

    document.getElementById('foldersGrid').appendChild(newItem);
}

//...................................................//
// createFolderCard(folderName, folder._id, folder.date)//..........................................//

function openFolder(folderId, name) { document.getElementById('folderoverlay').classList.add('active'); }
// function openFolder(folderId, name) { document.getElementById('folderoverlay.foldercont').classList.add('active'); }

function closeFolder(folderId, name) { document.getElementById('folderoverlay').classList.remove('active'); }


function closeFolderM() { document.getElementById('fileoverlay1').classList.remove('active'); }


function openFolderM() { document.getElementById('fileoverlay1').classList.add('active'); }

//...............................................................................................//

// let activeFolderId = null;

// async function openFolder(folderId,name) {
//     activeFolderId=folderId;

//     const res = await fetch('http://localhost:5000/api/files/${folderId}')

//     const files = await res.json()

//     const container = document.querySelector("#foldergr")
//     container.innerHTML=''

//     files.forEach(file=>{
//         container.innerHTML+=`
//         <div class="items">
//         <div class="pic"></div>
//         <div class="name">${file.fileName}</div>
//         <div class="date">${new Date(file.date).toLocaleDateString()}</div>
//         </div>
//         `
//     })
// }

// async function uploadToFolder() {
//     const FormData = new formData()
//     formData.append('file',fileInput.files[0])
//     formData.append('fileName',fileNameInput.value)

//     await fetch('http://localhost:5000/api/upload/${activeFolderId}',
//         {
//             method:"POST",
//             body:formData
//         })

//         openFolder(activeFolderId)
// }

let activeFolderId = null;
let activeFolderName = null;

// ✅ Single openFolder function — fetches files and opens overlay
async function openFolder(folderId, name) {
    activeFolderId = folderId;
    activeFolderName = name;

    // Open the folder overlay
    document.getElementById('folderoverlay').classList.add('active');

    // Show loading state
    const container = document.querySelector("#foldergr");
    container.innerHTML = '<p>Loading...</p>';

    try {
        // ✅ Backticks — so folderId is actually injected into the URL
        const res = await fetch(`https://nexus-backend-krh6.onrender.com/api/folder/${folderId}`,{
            credentials: "include"
        })
        // credentials: true
        const files = await res.json();

        // Clear loading
        container.innerHTML = '';

        if (files.length === 0) {
            container.innerHTML = '<p>No files in this folder yet.</p>';
            return;
        }

        // ✅ Render each file as a card
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'items';
            item.innerHTML = `
                <div class="pic"><img src="file_12477960.png" alt=""></div>
                <div class="name">${file.fileName}</div>
                <div class="date">${new Date(file.date).toLocaleDateString('en-IN')}</div>
            `;

            // ✅ Click on file → open it in new tab
            item.addEventListener('click', () => {
                window.open(file.file, '_blank');
            });

            container.appendChild(item);
        });

    } catch (error) {
        console.error('Could not load folder files:', error);
        container.innerHTML = '<p>Failed to load files.</p>';
    }
}

// ✅ Close folder overlay
function closeFolder() {
    document.getElementById('folderoverlay').classList.remove('active');
    activeFolderId = null;
    activeFolderName = null;
}

// ✅ Upload file INTO the active folder
async function uploadToFolder() {
    const fileInput = document.getElementById('fileInput1');
    const fileNameInput = document.getElementById('imageName1');
    const uploadBtn = document.getElementById('uploadBtn1');

    const file = fileInput.files[0];
    const fileName = fileNameInput.value.trim();

    // Validate
    if (!file) { alert('Please select a file!'); return; }
    if (!fileName) { alert('Please enter a file name!'); return; }
    if (!activeFolderId) { alert('No folder selected!'); return; }

    // Loading state
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    try {
        const formData = new FormData();            // ✅ capital F
        formData.append('file', file);
        formData.append('fileName', fileName);

        // ✅ Backticks — activeFolderId is injected into URL
        const res = await fetch(`https://nexus-backend-krh6.onrender.com/api/folder/${activeFolderId}`, {
            method: 'POST',
            body: formData,
            credentials: "include"
        });

        const data = await res.json();

        if (res.ok) {
            alert(`"${fileName}" uploaded successfully!`);

            // Reset inputs
            fileInput.value = '';
            fileNameInput.value = '';

            // ✅ Refresh the folder view to show new file
            closeFolderM();
            await openFolder(activeFolderId, activeFolderName);

        } else {
            alert(`Upload failed: ${data.message || 'Unknown error'}`);
        }

    } catch (error) {
        console.error('Upload error:', error);
        alert('Could not reach the server.');

    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
    }
}

function openFolderM() { document.getElementById('fileoverlay1').classList.add('active'); }
function closeFolderM() { document.getElementById('fileoverlay1').classList.remove('active'); }




function selectItem() { document.getElementById('allfileoverlay').classList.add('active'); }

function selectItem() { document.getElementById('allfileoverlay').classList.remove('active'); }

//function for signing in......................................................//
async function signin() {
    const email = document.getElementById('emailSignin').value.trim()
    const password = document.getElementById('passSignin').value.trim()
    const keepSignedIn = document.getElementById('check').checked

    // Step 1 — empty field guard
    if (!email || !password) {
        alert("Please fill in all fields")
        return
    }

    try {
        // Step 2 — hit the backend
        const res = await fetch('https://nexus-backend-krh6.onrender.com/api/auth/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        // Step 3 — handle responses
        if (res.status === 200) {

            // Step 4 — store token based on "Keep me Signed in" checkbox
            // if (keepSignedIn) {
            //     cookieStore.setItem('token', data.token)      // persists after browser closes
            //     cookieStore.setItem('user', JSON.stringify(data.user))
            // } else {
            //     cookieStore.setItem('token', data.token)    // clears when browser closes
            //     cookieStore.setItem('user', JSON.stringify(data.user))
            // }

            alert("Login successful!")
            window.location.href = 'http://127.0.0.1:5500/frontend/dashboard.html'            // 👈 change to your page///
            //
            //
            //

            //
            //
            //
            //


        } else if (res.status === 401) {
            alert("Wrong email or password")

        } else if (res.status === 404) {
            alert("No account found with this email")

        } else {
            alert(data.message || "Something went wrong")
        }

    } catch (err) {
        console.error(err)
        alert("Cannot connect to server. Is it running?")
    }
}

//function for register........................................................//
async function register() {
    const email = document.getElementById('emailRegister').value
    const password = document.getElementById('passRegister').value
    const username = document.getElementById('user').value

    if(!username||!email||!password){
        alert("please fill required fields")
        return
    }

    try {
        const res = await fetch('https://nexus-backend-krh6.onrender.com/api/auth/register',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username, email, password })
            })

            const data = await res.json()

            if(res.status===201){
                alert("account created successfully")
                window.location.href ="http://127.0.0.1:5500/frontend/index.html"
                //
                //
                //
                //
                //
                //
                //


            } 
            else if (res.status===409){
                alert("user already exist")
            }

            else{
                alert(data.message)
            }
    
    }


    catch (err) {
        console.log(err),
        alert("Something went wrong. is the server running?")
    }
}

//search functionality
function openSearchM() { document.getElementById('folderoverlay_s').classList.add('active'); }

function closeSearch() { document.getElementById('folderoverlay_s').classList.remove('active'); }

// Search functionality
function openSearchM() {
    document.getElementById('folderoverlay_s').classList.add('active');
}

function closeSearch() {
    document.getElementById('folderoverlay_s').classList.remove('active');
}

// Main search function - call this when user clicks search
async function performSearch() {
    const key = document.getElementById('site-search').value.trim()

    if (!key) {
        alert("Please enter a file name to search")
        return
    }

    // Open the overlay
    openSearchM()

    const grid = document.getElementById('foldergr_s')
    grid.innerHTML = '<p style="color:white">Searching...</p>'

    try {
        const token = localStorage.getItem('token')

        const res = await fetch(`https://nexus-backend-krh6.onrender.com/api/search?key=${key}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await res.json()

        if (!data || data.length === 0) {
            grid.innerHTML = '<p style="color:white">No files found.</p>'
            return
        }

        // Render results
        grid.innerHTML = ''

        data.forEach(file => {
            const item = document.createElement('div')
            item.classList.add('items')

            item.innerHTML = `
                <div class="pic">
                    <img src="file_12477960.png" alt="">
                </div>
                <div class="name">${file.fileName}</div>
                <div class="date">
                    ${new Date(file.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
                day:'numeric'

            })}
                </div>
            `

            grid.appendChild(item)

            // ✅ Click on file → open it in new tab
            item.addEventListener('click', () => {
                window.open(file.file, '_blank');
            });

        })

    } catch (err) {
        console.log(err)
        grid.innerHTML = '<p style="color:red">Error fetching results.</p>'
    }
}

function openCommunity() { document.getElementById('communityoverlay_s').classList.add('active'); }

function closeCommunity() { document.getElementById('communityoverlay_s').classList.remove('active'); }


function openCommunityoverlay() { document.getElementById('communityfileoverlay').classList.add('active'); }

function closeCommunityFileModel() { document.getElementById('communityfileoverlay').classList.remove('active'); }

async function uploadCommunityFile() {
    const fileInput = document.getElementById('communityfileInput')

    const fileNameInput = document.getElementById('communityimageName')

    const file = fileInput.files[0]

    const fileName = fileNameInput.value.trim()

    if (!file) {
        alert('Please select a file first!');
        return;
    }
    if (fileName === '') {
        alert('Please enter a file name!');
        return;
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName',fileName)
    formData.append('filetype', file.type)

    const uploadBtn = document.getElementById('communityuploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...'

    try{
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/community-uploads',{
            method: 'POST',
            body: formData,
            credentials: "include"
        })

        const data = await response.json();

        if (response.ok) {
            // ✅ Success
            console.log('Upload successful:', data);
            alert(`File "${fileName}" uploaded successfully!`);

            // Optional: reset the form after success
            fileInput.value = '';
            fileNameInput.value = '';
        }
        else {
            // ❌ Backend returned an error (e.g. 400, 500)
            console.error('Upload failed:', data);
            alert(`Upload failed: ${data.message || 'Unknown error from server'}`);
        }
    }
        catch (error) {
            // ❌ Network error — backend not reachable
            console.error('Network error:', error);
            alert('Could not reach the server. Make sure your backend is running.');

        } finally {
            // Always re-enable the button whether success or fail
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload';
        }

}

window.addEventListener('load', () => {
    loadcommunityFilesFromDB();
})

async function loadcommunityFilesFromDB() {
    try{
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/community-uploads',{
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)

        data.forEach(communityfile=>{
            createcommunityFileCard(communityfile.fileName,communityfile.file,communityfile.date)
        })
    }catch(error){
        console.error('Could not load files', error);
    }
}

function createcommunityFileCard(name, url, dateStr,username) {
    const dateLabel = new Date(dateStr).toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
    });

    const newItem = document.createElement('div');
    newItem.className = 'items';
    newItem.innerHTML = `
        <div class="pic"><img src="file_12477960.png" alt=""></div>
        <div class="name">${name}</div>
        <div class="date">${dateLabel}</div>
    `;

    // Click → open file preview
    newItem.addEventListener('click', () => {
        window.open(url, '_blank');
    });

    document.getElementById('communitygr_s').appendChild(newItem);
}

// createcommunityFileCard()

function openCommunitymessageoverlay() { document.getElementById('communitymessageoverlay').classList.add('active'); }

function closeCommunitymessageoverlay() { document.getElementById('communitymessageoverlay').classList.remove('active'); }

//..................................................//
//...................................................//

// let lastMessageCount =0
async function uploadCommunityMessage() {

    const messageinput = document.getElementById('description')

    const message = messageinput.value.trim()

    if (message === '') {
        alert('Please enter message!');
        return;
    }

    const uploadBtn = document.getElementById('communityUploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...'

    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/community-message', {
            method: 'POST',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ message }),
            credentials: "include"
        })

        const data = await response.json();

        // if(data.length>lastMessageCount){
        //     const newMessages = data.slice(lastMessageCount)

        //     newMessages.forEach(msg=>{
        //         createcommunityMessageCard(msg.message,msg.date)
        //     })

        //     lastMessageCount=data.length
            
        // }
        if (response.ok) {
            // ✅ Success
            console.log('Upload successful:', data);
            alert(`Message uploaded successfully!`);

            // Optional: reset the form after success
            
            messageinput.value = '';

            // loadcommunityMessageFromDB()
        }
        else {
            // ❌ Backend returned an error (e.g. 400, 500)
            console.error('Upload failed:', data);
            alert(`Upload failed: ${data.message || 'Unknown error from server'}`);
        }
    }
    catch (error) {
        // ❌ Network error — backend not reachable
        console.error('Network error:', error);
        alert('Could not reach 1 the server. Make sure your backend is running.');}

     finally {
        // Always re-enable the button whether success or fail
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
    }

}

window.addEventListener('load', () => {
    loadcommunityMessageFromDB();
})

// setInterval(()=>{
//     loadcommunityMessageFromDB()
// },5000)

async function loadcommunityMessageFromDB() {
    try {
        const response = await fetch('https://nexus-backend-krh6.onrender.com/api/community-message', {
            credentials: "include"
        })

        const data = await response.json()
        console.log(data)

        data.forEach(communityMessage => {
            createcommunityMessageCard(communityMessage.message, communityMessage.date)
        })
    } catch (error) {
        console.error('Could not load message', error);
    }
}

function createcommunityMessageCard(message,dateStr) {
    const dateLabel =dateStr? new Date(dateStr).toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        year: 'numeric',
        day: 'numeric'
    })
    :'UNKNOWN DATE'
    
    const newItem = document.createElement('div');
    newItem.className = 'msg';
    newItem.innerHTML = `
        <div class="date1">${dateLabel}</div>
            <div class="txt">
                <p>${message}</p>
            </div>
    `

    // Click → open file preview
    newItem.addEventListener('click', () => {
        window.open(url, '_blank');
    });

    document.getElementById('msggrd').appendChild(newItem);
}

// createcommunityMessageCard()


