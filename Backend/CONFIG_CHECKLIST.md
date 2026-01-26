# ✅ Checklist การ Config ทั้งหมด

## ✅ สิ่งที่ Config แล้ว

### 1. ChromaDB Cloud ✅
- [x] API Key: `ck-2L3cnsvkzuwwgsSMgewtDEvS2eKsQ164LoKpZk9AX7Zv`
- [x] Tenant: `6513189e-998e-4463-bbac-d90ec0ccd4ba`
- [x] Database: `Carmen-Iven`
- [x] Collection: `rag_documents`

### 2. Backend Configuration ✅
- [x] ไฟล์ `.env` สร้างแล้ว
- [x] ChromaDB Service รองรับ CloudClient แล้ว
- [x] Dependencies ติดตั้งแล้ว

### 3. Frontend Configuration ✅
- [x] Path alias (`@/*`) ตั้งค่าแล้ว
- [x] API URL: `http://localhost:3001/api` (default)

---

## ⚠️ สิ่งที่ยังต้อง Config

### 1. Ollama (สำคัญมาก!) ⚠️

#### ขั้นตอน:

**1.1 ติดตั้ง Ollama:**
- ดาวน์โหลดจาก: https://ollama.ai/download
- ติดตั้งและรัน Ollama

**1.2 ดาวน์โหลด Models:**
```bash
# LLM Model สำหรับสร้างคำตอบ
ollama pull llama3

# Embedding Model สำหรับสร้าง embeddings
ollama pull nomic-embed-text
```

**1.3 ตรวจสอบว่า Ollama ทำงาน:**
```bash
curl http://localhost:11434/api/tags
```

ควรเห็นรายการ models ที่ติดตั้งแล้ว

**1.4 ตรวจสอบใน `.env`:**
```env
OLLAMA_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=llama3
```

---

### 2. Frontend Environment Variables (ถ้าต้องการ)

ถ้า Backend รันที่ port อื่น (ไม่ใช่ 3001) ให้สร้างไฟล์ `Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**หมายเหตุ:** Frontend ใช้ default `http://localhost:3001/api` อยู่แล้ว ถ้า Backend รันที่ port 3001 ไม่ต้อง config

---

### 3. Backend Port (ถ้าต้องการเปลี่ยน)

Backend default รันที่ port **3000** (NestJS default)

ถ้าต้องการเปลี่ยน port:
1. สร้างไฟล์ `Backend/src/main.ts` (ถ้ายังไม่มี)
2. เพิ่ม:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3001);
}
```

หรือใช้ environment variable:
```env
PORT=3001
```

---

## 📋 สรุป Checklist

### ✅ Config แล้ว:
- [x] ChromaDB Cloud (API Key, Tenant, Database)
- [x] Backend `.env` file
- [x] Frontend path alias
- [x] Backend dependencies

### ⚠️ ยังต้องทำ:
- [ ] ติดตั้ง Ollama
- [ ] ดาวน์โหลด `llama3` model
- [ ] ดาวน์โหลด `nomic-embed-text` model
- [ ] ตรวจสอบ Ollama ทำงานที่ `http://localhost:11434`
- [ ] (Optional) ตั้งค่า Frontend `.env.local` ถ้า Backend port ไม่ใช่ 3001
- [ ] (Optional) ตั้งค่า Backend port ถ้าต้องการเปลี่ยน

---

## 🚀 ขั้นตอนการรัน

### 1. รัน Ollama (ถ้ายังไม่ได้รัน)
Ollama จะรันอัตโนมัติหลังจากติดตั้ง หรือ:
```bash
ollama serve
```

### 2. รัน Backend
```bash
cd Backend
npm run start:dev
```

### 3. รัน Frontend
```bash
cd Frontend
npm run dev
```

---

## 🔍 ตรวจสอบการทำงาน

### 1. ตรวจสอบ Ollama
```bash
curl http://localhost:11434/api/tags
```

### 2. ตรวจสอบ Backend
```bash
curl http://localhost:3001/api/documents/info
```

### 3. ตรวจสอบ Frontend
เปิดเบราว์เซอร์: `http://localhost:3000`

---

## ⚠️ ปัญหาที่อาจพบ

### Ollama ไม่ทำงาน
- ตรวจสอบว่า Ollama ติดตั้งแล้ว
- ตรวจสอบว่า models ถูกดาวน์โหลดแล้ว: `ollama list`
- ตรวจสอบ port 11434 ไม่ถูกใช้งาน

### Backend ไม่เชื่อมต่อ ChromaDB
- ตรวจสอบ API Key, Tenant, Database ใน `.env`
- ตรวจสอบ internet connection (สำหรับ ChromaDB Cloud)

### Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบ Backend รันอยู่ที่ port 3001
- ตรวจสอบ CORS settings (ถ้ามี)
