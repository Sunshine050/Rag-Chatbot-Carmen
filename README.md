# RAG Chatbot Project

RAG (Retrieval-Augmented Generation) Chatbot สำหรับ BlueLedgers Documentation Hub

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: NestJS (TypeScript)
- **Vector Database**: ChromaDB Cloud
- **LLM**: Ollama (llama3.2)
- **Embeddings**: Ollama (nomic-embed-text)

## 📁 Project Structure

```
rag-chatbot-project/
├── Backend/          # NestJS Backend API
│   ├── src/
│   │   ├── chromadb/ # ChromaDB service
│   │   ├── ollama/   # Ollama service
│   │   └── rag/      # RAG service
│   └── .env          # Environment variables
├── Frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/      # Next.js app router
│   │   ├── components/
│   │   └── services/
│   └── .env.local    # Frontend environment variables
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Ollama (รันบน Mac หรือเครื่องอื่น)
- ChromaDB Cloud account

### Backend Setup

1. ติดตั้ง dependencies:
```bash
cd Backend
npm install
```

2. สร้างไฟล์ `.env`:
```env
OLLAMA_URL=http://192.168.11.71:11434
CHROMA_API_KEY=your-api-key
CHROMA_TENANT=your-tenant
CHROMA_DATABASE=your-database
CHROMA_COLLECTION_NAME=rag_documents
EMBEDDING_MODEL=nomic-embed-text
LLM_MODEL=llama3.2
```

3. รัน Backend:
```bash
npm run start:dev
```

### Frontend Setup

1. ติดตั้ง dependencies:
```bash
cd Frontend
npm install
```

2. (Optional) สร้างไฟล์ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. รัน Frontend:
```bash
npm run dev
```

## 📚 API Endpoints

### POST `/api/chat`
ส่งคำถามและรับคำตอบ

**Request:**
```json
{
  "query": "คำถามของคุณ",
  "topK": 5
}
```

**Response:**
```json
{
  "answer": "คำตอบ",
  "sources": ["source1.md"],
  "retrievedDocuments": 1
}
```

### POST `/api/documents`
เพิ่มเอกสารเข้า knowledge base

**Request:**
```json
{
  "id": "doc1",
  "content": "เนื้อหาของเอกสาร",
  "metadata": {
    "source": "manual.md",
    "title": "User Manual"
  }
}
```

### GET `/api/documents/info`
ดูข้อมูล collection

## 🔧 Configuration

ดูรายละเอียดการ config ใน:
- `Backend/SETUP.md` - คู่มือการตั้งค่า
- `Backend/CHROMADB_CLOUD_SETUP.md` - การตั้งค่า ChromaDB Cloud
- `Backend/CONFIG_CHECKLIST.md` - Checklist การ config

## 📝 License

Private project
