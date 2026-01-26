# คู่มือการตั้งค่า ChromaDB Cloud

## ขั้นตอนการตั้งค่า ChromaDB Cloud

### 1. สมัครและสร้าง Database

1. ไปที่ https://www.trychroma.com/
2. สมัครสมาชิก (Sign Up)
3. หลังจาก login แล้ว ให้สร้าง Database ใหม่
4. จะได้ข้อมูลต่อไปนี้:
   - **Database URL**: `https://xxxxx-xxxxx.gcp-us-central1.chromadb.cloud`
   - **API Key**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 2. อัปเดตไฟล์ `.env`

เปิดไฟล์ `Backend/.env` และแก้ไขค่าต่อไปนี้:

```env
# ChromaDB Configuration
CHROMA_URL=https://xxxxx-xxxxx.gcp-us-central1.chromadb.cloud
CHROMA_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CHROMA_COLLECTION_NAME=rag_documents
```

**ตัวอย่าง:**
```env
CHROMA_URL=https://abc123-def456.gcp-us-central1.chromadb.cloud
CHROMA_API_KEY=abc12345-def6-7890-abcd-ef1234567890
CHROMA_COLLECTION_NAME=rag_documents
```

### 3. รัน Backend

```bash
cd Backend
npm run start:dev
```

ระบบจะเชื่อมต่อกับ ChromaDB Cloud อัตโนมัติ!

---

## ตรวจสอบการเชื่อมต่อ

### 1. ดู Logs

เมื่อรัน Backend ควรเห็น log:
```
[ChromaDBService] ChromaDB Cloud authentication enabled
[ChromaDBService] Collection 'rag_documents' initialized
[ChromaDBService] ChromaDB service initialized successfully
```

### 2. ทดสอบเพิ่มเอกสาร

```bash
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
```

### 3. ทดสอบการค้นหา

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "สวัสดี",
    "topK": 5
  }'
```

---

## ข้อดีของ ChromaDB Cloud

✅ **ไม่ต้องติดตั้ง Python หรือ Docker**  
✅ **ไม่ต้องรัน server เอง**  
✅ **มี backup อัตโนมัติ**  
✅ **ใช้งานง่าย รวดเร็ว**  
✅ **รองรับ HTTPS/SSL**  

---

## Troubleshooting

### Error: "Failed to connect to ChromaDB"

**สาเหตุ:**
- URL ไม่ถูกต้อง
- API Key ไม่ถูกต้อง
- ไม่มี internet connection

**วิธีแก้:**
1. ตรวจสอบ URL และ API Key ในไฟล์ `.env`
2. ตรวจสอบ internet connection
3. ตรวจสอบว่า ChromaDB Cloud database ยัง active อยู่

### Error: "Unauthorized" หรือ "401"

**สาเหตุ:**
- API Key ไม่ถูกต้องหรือหมดอายุ

**วิธีแก้:**
1. ไปที่ ChromaDB Cloud dashboard
2. สร้าง API Key ใหม่
3. อัปเดตในไฟล์ `.env`

### Error: "Collection not found"

**สาเหตุ:**
- Collection ยังไม่ถูกสร้าง

**วิธีแก้:**
- ระบบจะสร้าง collection อัตโนมัติเมื่อเริ่มต้น
- ถ้ายังมีปัญหา ลอง restart Backend

---

## หมายเหตุ

- ChromaDB Cloud ต้องมี **internet connection**
- ข้อมูลจะถูกเก็บใน cloud (ไม่ใช่ local)
- มี free tier สำหรับทดสอบ
- ตรวจสอบ pricing ที่ https://www.trychroma.com/pricing
