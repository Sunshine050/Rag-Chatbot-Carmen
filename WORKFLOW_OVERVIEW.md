# 🔄 Workflow Overview: Wiki.js → Git → n8n → ChromaDB → RAG

เอกสารนี้สรุป **ทั้ง flow** และ **ขั้นตอนการตั้งค่าทีละจุด** ตั้งแต่ Wiki.js → Git → n8n → Backend → ChromaDB → Chatbot

---

## 📋 ภาพรวม Workflow

```
┌─────────────────────┐
│   Wiki.js           │
│  (Production)       │
│  wiki.semapru.com   │
└──────┬──────────────┘
       │
       │ Auto Sync (ทุก 5 นาที)
       │ SSH / PAT
       ▼
┌─────────────┐
│   GitHub    │
│  (Git Repo) │
│  Rag-Chatbot│
│  -Carmen    │
└──────┬──────┘
       │
       │ n8n Schedule Trigger
       ▼
┌─────────────┐      HTTP POST
│    n8n      │ ───────────────▶  http://localhost:3001/api/import/wiki
└──────┬──────┘                       (Backend)
       │
       ▼
┌─────────────┐
│  Backend    │  (NestJS + Ollama)
│  /api/docs  │  สร้าง embeddings → Chroma
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ChromaDB   │
│  rag_docs   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   /api/chat │  (RAG API)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Frontend   │  (Next.js)
└──────┬──────┘
       ▼
┌─────────────┐
│   User      │
│  (Chatbot)  │
└─────────────┘
```

---

## 1️⃣ ตั้งค่า Wiki.js ให้ Sync กับ GitHub

### 1.1 เตรียม GitHub Repository

- สร้าง repo: `Sunshine050/Rag-Chatbot-Carmen`
- แนะนำให้ตั้งเป็น **Public** (เริ่มต้นง่าย)
- ถ้าใช้ Private:
  - ต้องสร้าง PAT ที่มี scope `repo`

### 1.2 ตั้งค่า Git Storage ใน Wiki.js

1. เข้า `https://wiki.semapru.com/` ด้วยบัญชี admin
2. ไปที่ `Administration → Storage → Git`
3. กด `Add target` หรือแก้ไข target เดิม

#### 1.2.1 ค่า Repository / Auth

**ถ้าใช้ SSH (แนะนำ):**

- **Authentication Type**: `ssh`
- **Repository URI**:
  ```text
  git@github.com:Sunshine050/Rag-Chatbot-Carmen.git
  ```
- **SSH Private Key Mode**: `contents`
- **SSH Private Key Contents**:
  - วาง private key ที่มีสิทธิ์ push ไป repo นี้
  - ห้ามมี passphrase (ไม่งั้น Wiki.js ใช้ไม่ได้)

**ถ้าใช้ HTTPS + PAT:**

- **Authentication Type**: `basic`
- **Repository URI**:
  ```text
  https://github.com/Sunshine050/Rag-Chatbot-Carmen.git
  ```
- **Username**: `x-access-token` (หรือ GitHub username)
- **Password / PAT**: GitHub Personal Access Token ที่มี scope `repo`

#### 1.2.2 ค่าทั่วไป

- **Branch**: `main`
- **Sync Direction**: `Bi-directional` (แนะนำ)
- **Sync Schedule**: `Every 5 minutes` (หรือค่าที่ต้องการ)
- เปิด `Enable` / `Active` ให้ storage target นี้
- กด **Apply / Save**

### 1.3 ทดสอบการ Sync

1. สร้างหน้าใหม่ใน Wiki.js เช่น `Test Auto Sync`
2. กด Save / Publish
3. กลับไปที่ `Administration → Storage → Git`
4. กดปุ่ม **Force Sync**
5. เช็ก:
   - Status เป็นเขียว + ข้อความ `Last synchronization ...`
   - ใน GitHub repo มีไฟล์ `.md` ใหม่ (เช่น `test-auto-sync.md`)

ถ้าถึงจุดนี้ แสดงว่า **Wiki.js → GitHub** ทำงานถูกต้องแล้ว

---

## 2️⃣ ตั้งค่า ChromaDB และ Backend

### 2.1 ChromaDB Cloud

ใน ChromaDB Cloud (Database: `Carmen-Iven`) จะได้ค่าต่อไปนี้:

- **Tenant ID** → `CHROMA_TENANT`
- **Database Name** → `CHROMA_DATABASE` (เช่น `Carmen-Iven`)
- **API Key** → `CHROMA_API_KEY`

เราใช้ collection ของตัวเองชื่อ **`rag_documents`** (ไม่ใช้ collection auto-sync ของ Chroma เพื่อเลี่ยงปัญหา embedding function)

### 2.2 `.env` ของ Backend (NestJS)

ไฟล์ `Backend/.env` ตัวอย่าง:

```env
# Ollama Configuration (รันบน Mac เพื่อน ผ่าน ngrok)
OLLAMA_URL=https://shelba-perorational-datedly.ngrok-free.dev
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=llama3.2

# ChromaDB Configuration
CHROMA_API_KEY=...
CHROMA_TENANT=...
CHROMA_DATABASE=Carmen-Iven
CHROMA_COLLECTION_NAME=rag_documents

# Backend
PORT=3001
FRONTEND_URL=http://localhost:3000

# Wiki / Git Import
WIKI_GIT_REPO_URL=git@github.com:Sunshine050/Rag-Chatbot-Carmen.git
BACKEND_URL=http://localhost:3001
```

> ทดสอบ Ollama: `curl https://...ngrok.../api/tags` ต้องได้รายการโมเดล (`nomic-embed-text`, `llama3.2`)

### 2.3 โค้ดสำคัญฝั่ง Backend

- `ChromaDBService`:
  - ใช้ `OllamaService.generateEmbedding(EMBEDDING_MODEL, text)` เพื่อสร้าง embeddings
  - `addDocument(s)`:
    - เรียก `generateEmbedding` แล้ว `collection.add({ ids, embeddings, documents, metadatas })`
  - `search(query)`:
    - generate embedding ของ query
    - `collection.query({ queryEmbeddings: [embedding], nResults: topK })`

- `RagService.chat(query, topK)`:
  - เรียก `ChromaDBService.search` เพื่อได้ context
  - ต่อ context + question เป็น prompt
  - เรียก Ollama (`LLM_MODEL`) เพื่อสร้างคำตอบ

- `AppController` (`Backend/src/app.controller.ts`):
  - `POST /api/chat` → รับ `{ query, topK }`
  - `POST /api/documents` → ใช้ตอน import docs
  - `GET /api/documents/info` → ใช้ตรวจจำนวน docs ใน collection

---

## 3️⃣ สคริปต์ Import: Git → ChromaDB (ด้วยมือ)

ไฟล์ `Backend/scripts/import-wiki-to-rag.ts` มีหน้าที่:

1. อ่าน `.env` → เอา `WIKI_GIT_REPO_URL`, `BACKEND_URL`
2. ถ้ายังไม่มี `wiki-repo/`:
   - รัน `git clone WIKI_GIT_REPO_URL wiki-repo`
3. ถ้ามีอยู่แล้ว:
   - รัน `git pull` ใน `wiki-repo/`
4. หาไฟล์ Markdown ทั้งหมด (`*.md`, `*.markdown`)
5. อ่านเนื้อหาแต่ละไฟล์ → ดึง H1 เป็น title (ถ้ามี)
6. แบ่งเนื้อหาเป็น chunks ด้วย `CHUNK_SIZE` และ `CHUNK_OVERLAP`
7. ส่งแต่ละ chunk เข้า Backend:

```http
POST http://localhost:3001/api/documents
{
  "id": "<filename>-chunk-<index>",
  "content": "<chunk text>",
  "metadata": {
    "source": "wiki",
    "title": "...",
    "filePath": "...",
    "chunkIndex": ...,
    "totalChunks": ...
  }
}
```

8. Backend ใช้ `ChromaDBService` เพิ่ม document เข้า `rag_documents`
9. ตอนจบ สคริปต์เรียก `GET /api/documents/info` เพื่อโชว์ `count` และ metadata

**คำสั่งที่ใช้รันด้วยมือ:**

```bash
cd Backend
npm run import:wiki
```

หลังรันเสร็จ:

- ใน ChromaDB → collection `rag_documents` จะเห็น `count` เพิ่มขึ้น
- สามารถถาม Chatbot ด้วยคำถามที่มีในเอกสารเหล่านั้นได้

---

## 4️⃣ เชื่อม n8n เพื่อ Trigger Import อัตโนมัติ

เป้าหมาย: ไม่ต้องกด `npm run import:wiki` เอง ให้ n8n เรียกแทน

### 4.1 Backend Endpoint (ทางเลือกแนะนำ)

