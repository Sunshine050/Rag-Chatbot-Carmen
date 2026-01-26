# 🚀 คู่มือการรันระบบ RAG Chatbot

## 📋 ส่วนประกอบของระบบ

ระบบ RAG Chatbot ประกอบด้วย **3 ส่วนหลัก**:

1. **Ollama Server** (รันบน Mac - 192.168.11.71)
2. **Backend** (NestJS - รันบน Windows)
3. **Frontend** (Next.js - รันบน Windows)

---

## 🎯 ขั้นตอนการรัน (ตามลำดับ)

### 1️⃣ รัน Ollama Server (บน Mac)

**ทำครั้งเดียว** - Ollama ต้องรันอยู่ตลอดเวลา

```bash
# บน Mac (192.168.11.71)
# ตั้งค่าให้ bind กับ network interface
export OLLAMA_HOST=0.0.0.0:11434

# รัน Ollama
ollama serve
```

**ตรวจสอบว่า Ollama ทำงาน:**
```bash
# จาก Windows หรือ Mac
curl http://192.168.11.71:11434/api/tags
```

ควรเห็นรายการ models:
- `llama3.2:latest`
- `nomic-embed-text:latest`

---

### 2️⃣ รัน Backend (บน Windows)

**เปิด Terminal ใหม่** (Terminal 1)

```bash
# ไปที่โฟลเดอร์ Backend
cd d:\rag-chatbot-project\Backend

# ตรวจสอบว่า .env ถูกต้อง
# (ควรมี OLLAMA_URL=http://192.168.11.71:11434)

# รัน Backend
npm run start:dev
```

**ควรเห็น logs:**
```
[ChromaDBService] ChromaDB Cloud Client initialized for database: Carmen-Iven
[ChromaDBService] Collection 'rag_documents' initialized
[ChromaDBService] ChromaDB service initialized successfully
🚀 Backend is running on: http://localhost:3001
```

**ตรวจสอบว่า Backend ทำงาน:**
```bash
# เปิด Terminal ใหม่
curl http://localhost:3001/api/documents/info
```

---

### 3️⃣ รัน Frontend (บน Windows)

**เปิด Terminal ใหม่** (Terminal 2)

```bash
# ไปที่โฟลเดอร์ Frontend
cd d:\rag-chatbot-project\Frontend

# รัน Frontend
npm run dev
```

**ควรเห็น logs:**
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

**เปิดเบราว์เซอร์:**
- ไปที่: `http://localhost:3000`

---

## 📊 สรุป Terminal ที่ต้องเปิด

### Terminal 1: Backend
```bash
cd d:\rag-chatbot-project\Backend
npm run start:dev
```
**Port:** 3001

### Terminal 2: Frontend
```bash
cd d:\rag-chatbot-project\Frontend
npm run dev
```
**Port:** 3000

### Mac Terminal: Ollama (ถ้ายังไม่ได้รัน)
```bash
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```
**Port:** 11434

---

## ✅ ตรวจสอบว่าระบบทำงาน

### 1. ตรวจสอบ Ollama
```bash
curl http://192.168.11.71:11434/api/tags
```

### 2. ตรวจสอบ Backend
```bash
curl http://localhost:3001/api/documents/info
```

### 3. ตรวจสอบ Frontend
- เปิดเบราว์เซอร์: `http://localhost:3000`
- ควรเห็นหน้า Chat Interface

---

## 🧪 ทดสอบระบบ

### ทดสอบเพิ่มเอกสาร:
```bash
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test1",
    "content": "นี่คือเอกสารทดสอบสำหรับ RAG system",
    "metadata": {
      "source": "test.md",
      "title": "Test Document"
    }
  }'
```

### ทดสอบการสนทนา:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "สวัสดี",
    "topK": 5
  }'
```

หรือทดสอบผ่าน Frontend:
- เปิด `http://localhost:3000`
- พิมพ์คำถามในช่อง chat
- กดส่ง

---

## ⚠️ ปัญหาที่อาจพบ

### Backend ไม่สามารถเชื่อมต่อ Ollama
- ตรวจสอบว่า Ollama รันอยู่บน Mac
- ตรวจสอบ IP address ใน `.env`: `OLLAMA_URL=http://192.168.11.71:11434`
- ตรวจสอบ network connection

### Frontend ไม่สามารถเชื่อมต่อ Backend
- ตรวจสอบว่า Backend รันอยู่ที่ port 3001
- ตรวจสอบ CORS settings (ควรเปิดอยู่แล้ว)

### ChromaDB Connection Error
- ตรวจสอบ API Key, Tenant, Database ใน `.env`
- ตรวจสอบ internet connection

---

## 📝 Quick Start Checklist

- [ ] Ollama รันอยู่บน Mac (192.168.11.71:11434)
- [ ] Backend `.env` ตั้งค่าถูกต้อง
- [ ] Backend รันอยู่ที่ port 3001
- [ ] Frontend รันอยู่ที่ port 3000
- [ ] เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## 🎉 พร้อมใช้งาน!

เมื่อทุกอย่างรันแล้ว คุณสามารถ:
1. เปิด Frontend: `http://localhost:3000`
2. พิมพ์คำถามในช่อง chat
3. ระบบจะค้นหาจาก ChromaDB และสร้างคำตอบด้วย Ollama
