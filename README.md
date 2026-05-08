# 🌌 CipherEmotion: Advanced Emotion AI & Secure Insights

An intelligent, privacy-first sentiment analysis engine that combines cutting-edge Large Language Models with military-grade client-side encryption.

---

### 🌟 Key Features

#### 🧠 Advanced Emotion AI
Powered by **Llama 3.3** (via Groq), the analysis engine dives deep into text sentiment with high-fidelity accuracy.
* **Granular Detection:** Maps text to 6 distinct emotional profiles: `Joy`, `Anger`, `Sadness`, `Fear`, `Love`, and `Surprise`.
* **Context-Aware:** Uses refined deterministic prompting to differentiate complex nuances, such as distinguishing grief from affection.
* **Fast Inference:** Leverages Groq's LPU™ (Language Processing Unit) hardware for near-instant results.

#### 🔒 Military-Grade Encryption (Zero-Knowledge)
A truly private experience where your emotional insights are secured before they ever leave your device.
* **AES-GCM Encryption:** Built natively on the browser's **Web Crypto API** for maximum performance and security.
* **Secure Token System:** Automatically generates a unique 6-character token (`EC-XXXXXX`) used as the sole cryptographic key.
* **Client-Side First:** The backend never sees the raw emotion JSON; it only stores the encrypted cipher text.

#### 📊 Dynamic Visualizations & UX
* **Interactive Probability Bars:** Beautifully rendered, animated progress bars showing the exact distribution of detected emotions.
* **Responsive & Modern UI:** A sleek, dark-themed **glassmorphism** aesthetic that adapts flawlessly to mobile, tablet, and desktop screens.
* **Seamless Flow:** Encrypt your thoughts, receive your secure token, and instantly decrypt/visualize your data in one smooth interface.

---

### 🚀 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+) |
| **Backend/AI** | Node.js, Express.js, Groq Cloud API (Llama 3.3) |
| **Database** | Supabase (PostgreSQL) |
| **Cryptography** | Web Crypto API (SHA-256 & AES-GCM) |

---

### 🛡️ Privacy & Security

* **No Backdoors:** Decryption is mathematically impossible without the exact user-generated token.
* **Zero Data Leakage:** The database only holds unintelligible cipher text—never raw user data.

---

### 🛠️ Deployment & Links

* **🔗 Live Demo:** [View Live Site](https://cipher-emotions.vercel.app/)
* **📁 GitHub Repository:** [Source Code](https://github.com/Fantasibrine/CipherEmotion_Stage2/)

---
*Developed with a focus on Privacy, Security, and Emotional Intelligence.*
