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

// 2. Kirim Pesan ke Realtime Database
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !userId) return;

    // Membuat referensi baru di folder 'messages'
    const messagesRef = ref(db, 'messages');
    const newMessageRef = push(messagesRef);
    
    set(newMessageRef, {
        uid: userId,
        text: text,
        timestamp: Date.now()
    });

    msgInput.value = '';
});

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
    
    div.innerHTML = `
        <span class="sender">${isMe ? 'Saya' : 'User ' + msg.uid.slice(0,4)}</span>
        <p>${msg.text}</p>
    `;
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
