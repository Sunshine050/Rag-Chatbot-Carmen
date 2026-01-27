# 🔄 Workflow Overview: Wiki.js → Git → ChromaDB → RAG

## 📋 Workflow สมบูรณ์

```
┌─────────────────────┐
│   Wiki.js           │
│  (Production)       │
│  wiki.semapru.com   │
└──────┬──────────────┘
       │
       │ Auto Sync (ทุก 5 นาที)
       │ SSH/Basic Auth
       ▼
┌─────────────┐
│   GitHub    │
│  (Git Repo) │
│  Rag-Chatbot│
│  -Carmen    │
└──────┬──────┘
       │
       │ Option A: ChromaDB Sync (อัตโนมัติ)
       │ Option B: N8n Webhook Trigger
       ▼
┌─────────────┐
│  ChromaDB   │
│  (Vector DB)│
│  Cloud      │
└──────┬──────┘
       │
       │ Query via API
       ▼
┌─────────────┐
│   RAG API   │
│  (Backend)  │
└──────┬──────┘
       │
       │ Frontend
       ▼
┌─────────────┐
│   User      │
│  (Chatbot)  │
└─────────────┘
```

---

## ✅ สิ่งที่ทำเสร็จแล้ว

### Phase 1: Wiki.js → Git ✅

**สถานะ:** ต้องตั้งค่าใหม่ใน Production

**การตั้งค่า:**
- ✅ Wiki.js Production: `https://wiki.semapru.com/`
- ⏳ Git Storage: ต้องตั้งค่าใหม่ใน Production
- ✅ Repository: `git@github.com:Sunshine050/Rag-Chatbot-Carmen.git`
- ✅ Sync Direction: Bi-directional (แนะนำ)
- ✅ Sync Schedule: ทุก 5 นาที (แนะนำ)
- ⏳ Status: ต้องตรวจสอบหลังตั้งค่า

**การทำงาน:**
- เมื่อมีการแก้ไข/สร้างหน้าใหม่ใน Wiki.js
- Wiki.js จะ auto-push ไป GitHub ทุก 5 นาที
- หรือสามารถ Force Sync ได้ทันที

---

### Phase 2: Git → ChromaDB (ปัจจุบัน)

**สถานะ:** ใช้ ChromaDB Sync (GitHub Integration)

**การตั้งค่า:**
- ✅ ChromaDB Cloud: Connected
- ✅ Collection: `sunshine050_rag_chatbot_carmen_main`
- ✅ Documents: 160 records (sync จาก GitHub แล้ว)
- ✅ Embedding Model: `Qwen3-Embedding-0.6B`
- ✅ Chunk Strategy: `tree_sitter`

**การทำงาน (ปัจจุบัน):**
- ChromaDB มี GitHub Sync feature ที่ sync อัตโนมัติ
- เมื่อ GitHub มี commit ใหม่ → ChromaDB จะ sync อัตโนมัติ
- ไม่ต้องใช้ N8n (ถ้าใช้ ChromaDB Sync)

---

### Phase 3: ChromaDB → RAG API ✅

**สถานะ:** ตั้งค่าเสร็จแล้ว

**การตั้งค่า:**
- ✅ Backend: NestJS API
- ✅ ChromaDB Service: เชื่อมต่อกับ Cloud
- ✅ Collection Name: `sunshine050_rag_chatbot_carmen_main`
- ✅ Ollama: สำหรับ embeddings และ LLM
- ✅ API Endpoints:
  - `POST /api/chat` - ถามคำถาม
  - `POST /api/documents` - เพิ่มเอกสาร
  - `GET /api/documents/info` - ดู collection info

---

## 🔄 Workflow Options

### Option A: ChromaDB Sync (ปัจจุบัน - อัตโนมัติ)

**Workflow:**
```
Wiki.js → Git (auto sync ทุก 5 นาที)
  ↓
GitHub (commit ใหม่)
  ↓
ChromaDB Sync (auto sync จาก GitHub)
  ↓
ChromaDB Collection (อัปเดตอัตโนมัติ)
  ↓
RAG API (พร้อมใช้งาน)
```

**ข้อดี:**
- ✅ ไม่ต้องตั้งค่าเพิ่มเติม
- ✅ Sync อัตโนมัติ
- ✅ ใช้งานง่าย

**ข้อเสีย:**
- ❌ ควบคุม sync timing ไม่ได้ (ขึ้นกับ ChromaDB)
- ❌ อาจ sync ช้ากว่า N8n

---

### Option B: N8n Webhook Trigger (แนะนำสำหรับ Production)

**Workflow:**
```
Wiki.js → Git (auto sync ทุก 5 นาที)
  ↓
GitHub (commit ใหม่)
  ↓
GitHub Webhook → N8n
  ↓
N8n Workflow:
  1. Pull จาก GitHub
  2. Process Markdown files
  3. Generate embeddings
  4. Import เข้า ChromaDB (via API)
  ↓
ChromaDB Collection (อัปเดต)
  ↓
RAG API (พร้อมใช้งาน)
```

**ข้อดี:**
- ✅ ควบคุม sync timing ได้เต็มที่
- ✅ สามารถ process/transform ข้อมูลก่อน import
- ✅ มี error handling และ retry logic
- ✅ Monitor และ log ได้ดีกว่า
- ✅ ใช้ collection เดิม (`rag_documents`) ได้

**ข้อเสีย:**
- ❌ ต้องตั้งค่า N8n workflow
- ❌ ต้องเขียน logic สำหรับ import

---

## 🎯 คำตอบสำหรับคำถาม

### Q: เมื่อมีการอัพเดตแก้ไขอะไรใน wiki มันจะอัพเดตไปที่ git อัตโนมัติตามที่เชื่อมต่อไว้แล้ว

**A: ✅ ใช่!**
- Wiki.js จะ auto-sync ไป GitHub ทุก 5 นาที
- หรือ Force Sync ได้ทันที

### Q: Git ก็จะทำการเทียบแล้วอัพเดตเข้าไปที่ Chroma ใช่ไหมโดยใช้ N8n ทำ trigger

**A: ⚠️ ตอนนี้ยังไม่ใช่!**

**สถานะปัจจุบัน:**
- Git → ChromaDB: ใช้ **ChromaDB Sync** (GitHub Integration) - sync อัตโนมัติ
- **ยังไม่ได้ใช้ N8n**

**ถ้าต้องการใช้ N8n:**
- ต้องตั้งค่า GitHub Webhook → N8n
- สร้าง N8n workflow สำหรับ import
- ใช้ Backend API (`POST /api/documents`) หรือ import script

---

## 📝 สรุป Workflow ปัจจุบัน

### Current Setup (ตอนนี้):

```
1. Wiki.js → Git ✅
   - Auto sync ทุก 5 นาที
   - SSH authentication
   
2. Git → ChromaDB ✅
   - ChromaDB Sync (GitHub Integration)
   - Auto sync จาก GitHub
   - Collection: sunshine050_rag_chatbot_carmen_main
   
3. ChromaDB → RAG API ✅
   - Backend เชื่อมต่อ ChromaDB
   - Collection: sunshine050_rag_chatbot_carmen_main
   - พร้อมใช้งาน
```

---

## 🚀 ขั้นตอนต่อไป (ถ้าต้องการใช้ N8n)

### Step 1: ตั้งค่า GitHub Webhook

1. ไปที่: https://github.com/Sunshine050/Rag-Chatbot-Carmen/settings/hooks
2. Add webhook
3. Payload URL: `https://your-n8n-instance.com/webhook/github-wiki-update`
4. Content type: `application/json`
5. Events: `push` (เมื่อมี commit ใหม่)
6. Active: ✅

### Step 2: สร้าง N8n Workflow

**Workflow Structure:**
```
1. Webhook Trigger (GitHub)
   ↓
2. Extract commit info
   ↓
3. Pull repository (หรือใช้ GitHub API)
   ↓
4. Process Markdown files
   ↓
5. Generate embeddings (via Ollama)
   ↓
6. Import to ChromaDB (via Backend API)
   ↓
7. Send notification (optional)
```

### Step 3: ใช้ Backend API หรือ Import Script

**Option A: ใช้ Backend API**
```javascript
// ใน N8n
POST http://localhost:3001/api/documents
{
  "id": "doc-123",
  "content": "...",
  "metadata": {...}
}
```

**Option B: ใช้ Import Script**
```bash
# ใน N8n Execute Command node
cd /path/to/Backend
npm run import:wiki
```

---

## 🔍 เปรียบเทียบ Option A vs Option B

| Feature | ChromaDB Sync | N8n Workflow |
|---------|---------------|--------------|
| Setup | ✅ ง่าย (ตั้งค่าใน ChromaDB) | ⚠️ ต้องตั้งค่า N8n |
| Auto Sync | ✅ อัตโนมัติ | ✅ อัตโนมัติ (via webhook) |
| Control | ❌ จำกัด | ✅ เต็มที่ |
| Custom Processing | ❌ ไม่ได้ | ✅ ได้ |
| Error Handling | ⚠️ จำกัด | ✅ ดีกว่า |
| Monitoring | ⚠️ จำกัด | ✅ ดีกว่า |
| Collection | ใช้ collection ที่ ChromaDB สร้าง | ใช้ collection ไหนก็ได้ |

---

## 💡 คำแนะนำ

### สำหรับ Development/Testing:
- ✅ ใช้ **ChromaDB Sync** (ง่าย, พร้อมใช้งาน)

### สำหรับ Production:
- ✅ ใช้ **N8n Workflow** (ควบคุมได้เต็มที่, monitor ได้ดีกว่า)

---

## 📚 เอกสารอ้างอิง

- `WIKI_TEST_SETUP.md` - คู่มือตั้งค่า Wiki.js
- `Backend/IMPORT_WIKI_GUIDE.md` - คู่มือ import script
- `HOW_TO_RUN.md` - คู่มือการรันระบบ

---

## ✅ Checklist

### Current Setup:
- [x] Wiki.js → Git (auto sync)
- [x] Git → ChromaDB (ChromaDB Sync)
- [x] ChromaDB → RAG API (พร้อมใช้งาน)

### ถ้าต้องการใช้ N8n:
- [ ] ตั้งค่า GitHub Webhook
- [ ] สร้าง N8n Workflow
- [ ] ทดสอบ workflow
- [ ] ตั้งค่า monitoring/alerting
