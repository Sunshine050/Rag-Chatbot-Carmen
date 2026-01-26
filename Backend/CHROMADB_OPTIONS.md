# ทางเลือกในการใช้ ChromaDB ใน NestJS

## ⚠️ สิ่งสำคัญที่ต้องเข้าใจ

**ChromaDB ใน Node.js/NestJS ต้องมี server รันแยก** - ไม่สามารถรันแบบ embedded ใน-process ได้เหมือน Python

---

## ทางเลือกที่ 1: ใช้ ChromaDB Cloud (แนะนำ - ไม่ต้องติดตั้งเอง)

### ข้อดี:
- ✅ ไม่ต้องติดตั้ง Python หรือ Docker
- ✅ ไม่ต้องรัน server เอง
- ✅ มี backup อัตโนมัติ
- ✅ ใช้งานง่าย

### ข้อเสีย:
- ❌ ต้องมี internet connection
- ❌ อาจมีค่าใช้จ่าย (มี free tier)

### ขั้นตอน:

1. **สมัคร ChromaDB Cloud:**
   - ไปที่ https://www.trychroma.com/
   - สมัครและสร้าง database

2. **ได้ API Key และ URL:**
   - จะได้ URL แบบ: `https://xxxxx-xxxxx.gcp-us-central1.chromadb.cloud`
   - และ API Key

3. **อัปเดตไฟล์ `.env`:**
```env
CHROMA_URL=https://xxxxx-xxxxx.gcp-us-central1.chromadb.cloud
CHROMA_API_KEY=your-api-key-here
CHROMA_COLLECTION_NAME=rag_documents
```

4. **อัปเดต ChromaDB Service** (ถ้าต้องการใช้ API Key):
   - ต้องเพิ่มการส่ง API Key ใน request headers

---

## ทางเลือกที่ 2: ใช้ Python (ต้องติดตั้ง Python)

### ขั้นตอน:

1. **ติดตั้ง Python 3.8-3.11:**
   - ดาวน์โหลดจาก https://www.python.org/downloads/

2. **ติดตั้ง ChromaDB:**
```bash
pip install chromadb
```

3. **รัน ChromaDB Server:**
```bash
# เปิด terminal แยกและรัน:
chroma run --host localhost --port 8000 --path ./chroma_data
```

4. **เปิด terminal อื่นสำหรับรัน NestJS:**
```bash
cd Backend
npm run start:dev
```

**หมายเหตุ:** ต้องเปิด terminal 2 ตัว - ตัวหนึ่งสำหรับ ChromaDB server, อีกตัวสำหรับ NestJS

---

## ทางเลือกที่ 3: ใช้ Docker

```bash
docker run -d --name chromadb -p 8000:8000 chromadb/chroma:latest
```

---

## ทางเลือกที่ 4: เปลี่ยนไปใช้ LanceDB (Embedded ใน Node.js)

LanceDB รองรับ embedded mode ใน Node.js - ไม่ต้องรัน server แยก

### ข้อดี:
- ✅ รันแบบ embedded ใน-process
- ✅ ไม่ต้องติดตั้ง Python หรือ Docker
- ✅ เก็บข้อมูลใน local file

### ข้อเสีย:
- ❌ ต้องแก้ไขโค้ด (เปลี่ยนจาก ChromaDB เป็น LanceDB)

### ถ้าต้องการเปลี่ยนไปใช้ LanceDB:

1. ติดตั้ง:
```bash
npm install @lancedb/lancedb
```

2. ต้องแก้ไข `chromadb.service.ts` ให้ใช้ LanceDB แทน

---

## คำแนะนำ

**ถ้าไม่ต้องการติดตั้ง Python หรือ Docker:**
- ใช้ **ChromaDB Cloud** (ทางเลือกที่ 1) - ง่ายที่สุด

**ถ้าต้องการรัน local และไม่ต้องการแก้ไขโค้ด:**
- ใช้ **Python** (ทางเลือกที่ 2) - ต้องติดตั้ง Python

**ถ้าต้องการ embedded mode จริงๆ:**
- เปลี่ยนไปใช้ **LanceDB** (ทางเลือกที่ 4) - ต้องแก้ไขโค้ด
