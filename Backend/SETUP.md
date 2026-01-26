# คู่มือการตั้งค่า RAG Chatbot Backend

## สิ่งที่ต้อง Config

### 1. สร้างไฟล์ `.env`

สร้างไฟล์ `.env` ในโฟลเดอร์ `Backend` และเพิ่มค่าต่อไปนี้:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434

# ChromaDB Configuration
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION_NAME=rag_documents

# Embedding Model Configuration
EMBEDDING_MODEL=nomic-embed-text

# LLM Model for Generation
LLM_MODEL=llama3
```

**หมายเหตุ:** ถ้าไม่สร้างไฟล์ `.env` ระบบจะใช้ค่า default ที่กำหนดไว้ในโค้ด

---

### 2. ติดตั้งและรัน ChromaDB Server

**⚠️ สิ่งสำคัญ:** ChromaDB ใน Node.js ต้องมี **server รันแยก** (ไม่สามารถรันแบบ embedded ใน-process ได้) 

มี 3 ทางเลือก:

#### วิธีที่ 1: ใช้ Python (แนะนำ - ง่ายที่สุด)

**ข้อกำหนด:**
- Python 3.8 - 3.11 (ตรวจสอบด้วย `python --version`)

**ขั้นตอน:**

1. ติดตั้ง ChromaDB:
```bash
pip install chromadb
```

2. รัน ChromaDB Server:
```bash
# รันแบบเก็บข้อมูลถาวร (แนะนำ)
chroma run --host localhost --port 8000 --path ./chroma_data
```

**หมายเหตุ:** เปิด terminal แยกไว้รัน ChromaDB server นี้ (อย่าปิด terminal นี้)

#### วิธีที่ 2: ใช้ Docker

```bash
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  chromadb/chroma:latest
```

#### วิธีที่ 3: ใช้ ChromaDB Cloud (Managed Service)

ถ้าไม่ต้องการติดตั้งเอง สามารถใช้ ChromaDB Cloud:
- ไปที่ https://www.trychroma.com/
- สมัครและสร้าง database
- ใช้ URL ที่ได้มาแทน `http://localhost:8000` ในไฟล์ `.env`

#### ตรวจสอบว่า ChromaDB ทำงาน

เปิดเบราว์เซอร์ไปที่: `http://localhost:8000/api/v1/heartbeat`

ควรเห็น response: `{"nanosecond heartbeat": ...}`

หรือใช้คำสั่ง:
```bash
curl http://localhost:8000/api/v1/heartbeat
```

---

### 3. ติดตั้งและรัน Ollama

#### ดาวน์โหลดและติดตั้ง Ollama

- Windows: ดาวน์โหลดจาก https://ollama.ai/download
- หรือใช้ Chocolatey: `choco install ollama`

#### รัน Ollama Server

Ollama จะรันอัตโนมัติหลังจากติดตั้ง หรือรันด้วยคำสั่ง:

```bash
ollama serve
```

#### ดาวน์โหลด Models ที่จำเป็น

```bash
# ดาวน์โหลด LLM model สำหรับการสร้างคำตอบ
ollama pull llama3

# ดาวน์โหลด Embedding model สำหรับสร้าง embeddings
ollama pull nomic-embed-text
```

**หมายเหตุ:** 
- `llama3` ใช้สำหรับการสร้างคำตอบ (Generation)
- `nomic-embed-text` ใช้สำหรับสร้าง embeddings (Retrieval)

---

### 4. ติดตั้ง Dependencies

```bash
cd Backend
npm install
```

---

### 5. รัน Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend จะรันที่ `http://localhost:3001` (หรือ port ที่กำหนด)

---

## ตรวจสอบการทำงาน

### 1. ตรวจสอบ Ollama

```bash
curl http://localhost:11434/api/tags
```

ควรเห็นรายการ models ที่ติดตั้งแล้ว

### 2. ตรวจสอบ ChromaDB

```bash
curl http://localhost:8000/api/v1/heartbeat
```

ควรเห็น heartbeat response

### 3. ทดสอบ Backend API

```bash
# ทดสอบเพิ่มเอกสาร
curl -X POST http://localhost:3001/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test1",
    "content": "นี่คือเอกสารทดสอบ",
    "metadata": {
      "source": "test.md",
      "title": "Test Document"
    }
  }'

# ทดสอบการสนทนา
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "สวัสดี",
    "topK": 5
  }'
```

---

## Environment Variables อธิบาย

| Variable | Default | คำอธิบาย |
|----------|---------|----------|
| `OLLAMA_URL` | `http://localhost:11434` | URL ของ Ollama server |
| `CHROMA_URL` | `http://localhost:8000` | URL ของ ChromaDB server |
| `CHROMA_COLLECTION_NAME` | `rag_documents` | ชื่อ collection ใน ChromaDB |
| `EMBEDDING_MODEL` | `nomic-embed-text` | ชื่อ Ollama model สำหรับสร้าง embeddings |
| `LLM_MODEL` | `llama3` | ชื่อ Ollama model สำหรับสร้างคำตอบ (ใช้ในโค้ด) |

---

## Troubleshooting

### ChromaDB ไม่เชื่อมต่อได้
- ตรวจสอบว่า ChromaDB server รันอยู่: `curl http://localhost:8000/api/v1/heartbeat`
- ตรวจสอบ port 8000 ไม่ถูกใช้งานโดยโปรแกรมอื่น
- ตรวจสอบ firewall settings

### Ollama ไม่เชื่อมต่อได้
- ตรวจสอบว่า Ollama รันอยู่: `curl http://localhost:11434/api/tags`
- ตรวจสอบว่า models ถูกดาวน์โหลดแล้ว: `ollama list`
- ตรวจสอบ port 11434 ไม่ถูกใช้งานโดยโปรแกรมอื่น

### Embedding model ไม่พบ
- ดาวน์โหลด model: `ollama pull nomic-embed-text`
- ตรวจสอบชื่อ model ใน `.env` ตรงกับที่ติดตั้ง

### Collection ไม่ถูกสร้าง
- ตรวจสอบว่า ChromaDB ทำงานปกติ
- ตรวจสอบ logs ของ Backend เพื่อดู error messages
- ลอง restart Backend server
