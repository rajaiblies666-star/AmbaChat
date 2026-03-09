import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Konfigurasi asli milikmu
const firebaseConfig = {
    apiKey: "AIzaSyA1urH_4VoPwmWHsQFuURlsB4QMwNRVYgM",
    authDomain: "chitchat-60a65.firebaseapp.com",
    databaseURL: "https://chitchat-60a65-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chitchat-60a65",
    storageBucket: "chitchat-60a65.firebasestorage.app",
    messagingSenderId: "345661126805",
    appId: "1:345661126805:web:93e41cb86f4b44e354839c"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const statusBadge = document.getElementById('status');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');

let userId = "";

// 1. Login Anonim
signInAnonymously(auth).catch(err => console.error("Auth Error:", err));

onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
        statusBadge.innerText = "Online";
        statusBadge.style.background = "#25d366";
    }
});

// Fitur Pilih Foto
attachBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Image = event.target.result;
        sendData(null, base64Image); // Kirim sebagai gambar
    };
    reader.readAsDataURL(file);
    fileInput.value = ""; // Reset input
});

// 2. Kirim Pesan ke Realtime Database
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !userId) return;
    sendData(text, null);
    msgInput.value = '';
});

// Fungsi bantuan untuk kirim data (Teks atau Gambar)
function sendData(text, image) {
    const messagesRef = ref(db, 'messages');
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
        uid: userId,
        text: text,
        image: image, // Menambahkan field image
        timestamp: Date.now()
    });
}

// 3. Mendengarkan Pesan Masuk (Real-time)
const messagesRef = ref(db, 'messages');
onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    renderMessage(msg);
});

function renderMessage(msg) {
    const isMe = msg.uid === userId;
    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'sent' : 'recv'}`;
    
    let content = `<span class="sender">${isMe ? 'Saya' : 'User ' + msg.uid.slice(0,4)}</span>`;
    
    if (msg.image) {
        content += `<img src="${msg.image}" class="chat-img" alt="Foto">`;
    }
    
    if (msg.text) {
        content += `<p>${msg.text}</p>`;
    }
    
    div.innerHTML = content;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
                           }
