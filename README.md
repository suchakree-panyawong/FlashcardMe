# ⚡ FlashcardMe - Flashcard & Spaced Repetition PWA

**FlashcardMe** เป็นเว็บแอปพลิเคชันรูปแบบ **Progressive Web App (PWA)** สำหรับสร้างและทบทวนแฟลชการ์ด โดยใช้ระบบทบทวนซ้ำเว้นระยะ (Spaced Repetition System)

ออกแบบด้วยสไตล์ **Minimalist Light Mode** แบบ Mobile-First รองรับการออกเสียงอ่านคำศัพท์ภาษาอังกฤษ (Text-to-Speech) และมีคำอธิบายภาษาไทยในทุกการ์ด

---

## ✨ ฟีเจอร์หลัก (Features)

- 🔊 **Audio Text-to-Speech (TTS)**: มีปุ่มกดฟังเสียงอ่านออกเสียงคำศัพท์ภาษาอังกฤษสำเนียงเจ้าของภาษา
- 🇹🇭 **Thai Localization & Dual-Language**: คำอธิบายและจุดสังเกตคีย์เวิร์ดเป็นภาษาไทยสลับอังกฤษเข้าใจง่าย
- 🧠 **Spaced Repetition System (SRS)**: ระบบคำนวณรอบทบทวนอัตโนมัติ (Hard = 1 วัน, Good = 3 วัน, Easy = 7 วัน)
- 🔒 **100% Client-Side Privacy**: ข้อมูลทั้งหมดเก็บบน LocalStorage ของเบราว์เซอร์ผู้ใช้ ไม่มี Database Server ไม่เก็บข้อมูลส่วนตัว
- 📱 **Progressive Web App (PWA)**: สามารถกด "Add to Home Screen" เพื่อติดตั้งลงสมาร์ตโฟน iOS และ Android ได้ฟรี
- 💾 **Import / Export Backup**: สำรองข้อมูลคำศัพท์ออกมาเป็นไฟล์ JSON หรือโหลดเข้าไฟล์เพื่อแชร์ให้เพื่อนได้ทันที
- 🔐 **Private-by-Default Decks**: Public starter cards เป็นเพียงตัวอย่างทั่วไป ข้อมูลที่ผู้ใช้เพิ่มหรือ Import จะอยู่ใน LocalStorage ของอุปกรณ์นั้น

## 🔐 ความเป็นส่วนตัวของการ์ด

โปรเจกต์ Public นี้ไม่มีชุดการ์ดส่วนตัวฝังอยู่ใน source code ผู้ใช้แต่ละคนสามารถสร้างหรือ Import การ์ดของตัวเองผ่านเมนูสำรองข้อมูลได้ ข้อมูลจะเก็บไว้ใน browser ของอุปกรณ์นั้นและไม่ถูกส่งไปยังเซิร์ฟเวอร์ของแอป

ควร Export เป็นไฟล์ JSON สำรองและเก็บไว้ในพื้นที่ส่วนตัว ไฟล์ backup ส่วนตัวไม่ควร commit ขึ้น GitHub หรือวางไว้ในโฟลเดอร์ `public/`

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio API**: Web Speech API (`window.speechSynthesis`)
- **Storage**: LocalStorage (`flashcardme_cards_v8`)

---

## 🚀 การเริ่มใช้งานบนเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เปิดใช้งาน Dev Server
npm run dev

# เปิดเบราว์เซอร์ไปที่ http://localhost:3000
```

---

## 📄 License

Open Source under the [MIT License](LICENSE).
