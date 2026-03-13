const MODEL_URL = "/api/emotion";

const SUPABASE_URL = "https://dmabbvhzuyjifpjxmyxf.supabase.co/";
const SUPABASE_KEY = "sb_publishable_0eFiuFZ57jYSd83SvNIaeA_6O4Kr02n";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SECRET_KEY = "CipherEmotionHackathonSecret";

function generateToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "EC-";

  for (let i = 0; i < 6; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }

  return token;
}

function setStatus(message) {
  const status = document.getElementById("status");

  status.style.opacity = 0;

  setTimeout(() => {
    status.innerText = message;
    status.style.opacity = 1;
  }, 150);
}

async function queryAI(text) {
  const response = await fetch(MODEL_URL, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  const result = await response.json();

  return result[0]
    .map((e) => ({
      label: e.label.toUpperCase(),
      percent: Math.round(e.score * 100),
    }))
    .sort((a, b) => b.percent - a.percent);
}

async function getKey() {
  const encoder = new TextEncoder();

  const hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(SECRET_KEY),
  );

  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function encryptAES(payload) {
  const encoder = new TextEncoder();
  const key = await getKey();

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(payload),
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);

  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return bufferToBase64(combined);
}

async function decryptAES(cipher) {
  const decoder = new TextDecoder();

  const data = base64ToBuffer(cipher);

  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  const key = await getKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted,
  );

  return decoder.decode(decrypted);
}

async function runAIEncryption() {
  const encBtn = document.getElementById("encBtn");
  encBtn.disabled = true;

  const text = document.getElementById("input").value.trim();

  if (!text) {
    alert("Enter message");
    encBtn.disabled = false;
    return;
  }

  try {
    setStatus("AI is analyzing emotion...");

    const emotions = await queryAI(text);
    const dominant = emotions[0].label;

    const emotionColors = {
      JOY: "#10B981",
      ANGER: "#EF4444",
      SADNESS: "#3B82F6",
      FEAR: "#8B5CF6",
      LOVE: "#EC4899",
      SURPRISE: "#F59E0B",
    };

    const color = emotionColors[dominant] || "#8B5CF6";

    document.querySelector(".result-area").style.borderColor = color;
    /* END */

    setStatus("Encrypting message...");

    setStatus("Encrypting message...");

    const emotionJSON = JSON.stringify(emotions);

    const cipher = await encryptAES(emotionJSON);

    const token = generateToken();

    const { error } = await db
      .from("ciphers")
      .insert({ token: token, cipher: cipher});

    if (error) {
      console.error(error);
      alert(error.message);
      encBtn.disabled = false;
      return;
    }

    setStatus("Encryption successful.");

    let barsHTML = "<br><strong>Emotion Redistribution:</strong>";

    emotions.forEach((e, i) => {
      barsHTML += `
<div class="emotion-bar">
<div class="emotion-label">${e.label}</div>
<div class="bar-container">
<div class="bar-fill" id="bar${i}"></div>
</div>
<div class="percent">${e.percent}%</div>
</div>
`;
    });

    const output = document.getElementById("output");

    output.innerHTML = `
<strong>Cipher Token:</strong> ${token}
${barsHTML}
`;

    spawnEmojis(dominant);

    setTimeout(() => {
      emotions.forEach((e, i) => {
        const bar = document.getElementById(`bar${i}`);
        if (bar) bar.style.width = e.percent + "%";
      });
    }, 100);
  } catch (err) {
    console.error(err);
    setStatus("Encryption failed");
  } finally {
    encBtn.disabled = false;
  }
}

async function runDecryption() {
  const decBtn = document.getElementById("decBtn");
  decBtn.disabled = true;

  const token = document.getElementById("input").value.trim();

  if (!token) {
    alert("Enter token");
    decBtn.disabled = false;
    return;
  }

  try {
    setStatus("Fetching cipher from database...");

    const { data, error } = await db
      .from("ciphers")
      .select("cipher, message")
      .eq("token", token)
      .single();

    if (error || !data) {
      setStatus("Token not found");
      decBtn.disabled = false;
      return;
    }

    setStatus("Decrypting message...");

    const emotionJSON = await decryptAES(data.cipher);

    const emotions = JSON.parse(emotionJSON);

    const message = data.message;

    setStatus("Decryption successful.");

    let barsHTML = "<br><strong>Emotion Redistribution:</strong>";

    emotions.forEach((e, i) => {
      barsHTML += `
<div class="emotion-bar">
<div class="emotion-label">${e.label}</div>
<div class="bar-container">
<div class="bar-fill" id="bar${i}"></div>
</div>
<div class="percent">${e.percent}%</div>
</div>
`;
    });

    const output = document.getElementById("output");

    output.innerHTML = `${barsHTML}`;

    setTimeout(() => {
      emotions.forEach((e, i) => {
        const bar = document.getElementById(`bar${i}`);
        if (bar) bar.style.width = e.percent + "%";
      });
    }, 100);
  } catch (err) {
    console.error(err);
    setStatus("Decryption failed");
  } finally {
    decBtn.disabled = false;
  }
}

function goToCipher() {
  const section = document.querySelector(".cipher-interface");

  section.classList.add("show");

  section.scrollIntoView({
    behavior: "smooth",
  });
}

function toggleMenu() {
  const nav = document.getElementById("navLinks");

  nav.classList.toggle("active");
}

function spawnEmojis(emotion) {
  const emojiMap = {
    JOY: ["😄", "🎉", "✨"],
    ANGER: ["😡", "🔥", "💥"],
    SADNESS: ["😢", "💧", "🥀"],
    LOVE: ["❤️", "💕", "😍"],
    FEAR: ["😨", "👻", "⚡"],
    SURPRISE: ["😲", "✨", "⚡"],
  };

  const emojis = emojiMap[emotion] || ["✨"];

  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement("div");

    emoji.className = "falling-emoji";

    emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    emoji.style.left = Math.random() * 100 + "vw";

    emoji.style.animationDuration = 2 + Math.random() * 2 + "s";

    document.body.appendChild(emoji);

    setTimeout(() => emoji.remove(), 4000);
  }
}

document.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", function(e){

        const url = this.href;

        if(url && !url.includes("#")){

            e.preventDefault();

            document.body.style.opacity = "0";
            document.body.style.transform = "translateY(20px)";

            setTimeout(()=>{
                window.location = url;
            },300);

        }

    });

});
