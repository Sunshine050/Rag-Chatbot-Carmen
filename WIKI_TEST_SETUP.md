# 🧪 คู่มือการทดสอบ Wiki.js + RAG Integration

## 📋 วัตถุประสงค์

ทดสอบกระบวนการทั้งหมด:
1. สร้าง/แก้ไขข้อมูลใน Wiki.js
2. Wiki.js → Git Repository (auto sync)
3. Pull จาก Git → Import เข้า RAG System

---

## 🚀 ขั้นตอนการ Setup

### 1. รัน Docker Compose

```bash
cd d:\rag-chatbot-project
docker-compose up -d
```

**ตรวจสอบว่า containers รันอยู่:**
```bash
docker-compose ps
```

ควรเห็น:
- `rag-wiki-db-1` หรือ `db` - Database
- `rag-wiki-wiki-1` หรือ `wiki` - Wiki.js

---

### 2. ตั้งค่า Wiki.js (ครั้งแรก)

**เปิดเบราว์เซอร์:**
- URL: `http://localhost:3993` (ใช้ port 3993 เหมือนกับ production)

**Setup Wizard:**
1. เลือกภาษา
2. ตั้งค่า Admin Account:
   - Email: `admin@test.com`
   - Password: `admin123` (หรือตามต้องการ)
   - Site Name: `Carmen Documentation Test`

3. Database Configuration:
   - Type: `PostgreSQL`
   - Host: `db` (ใช้ชื่อ service)
   - Port: `5432`
   - Database: `wiki`
   - Username: `wikijs`
   - Password: `wikijsrocks`

4. Complete Setup

---

### 3. ตั้งค่า Git Storage ใน Wiki.js

**หลังจาก login แล้ว:**

1. ไปที่ **Administration** → **Storage** → **Git**

2. ตั้งค่า:
   - **Authentication Type**: `SSH` หรือ `basic`
   - **Repository URI**: 
     - สำหรับทดสอบ: สร้าง test repo ใน GitHub
     - หรือใช้: `git@github.com:your-username/test-wiki.git`
   - **Branch**: `main`
   - **SSH Private Key**: ใส่ private key (ถ้าใช้ SSH)
   - **Username/Password**: ใส่ credentials (ถ้าใช้ basic)

3. **Sync Direction**: 
   - เลือก `Bi-directional` (แนะนำ)
   - หรือ `Push to target` (ถ้าต้องการแค่ push)

4. **Sync Schedule**: `Every 5 minutes`

5. **Activate**: เปิดใช้งาน

6. **Apply**: บันทึกการตั้งค่า

---

### 4. ทดสอบการทำงาน

#### Test 1: สร้างเนื้อหาใน Wiki

1. สร้างหน้าใหม่ใน Wiki.js
2. เพิ่มเนื้อหา (Markdown)
3. Save

**ตรวจสอบ:**
- ดูว่า Git repository มี commit ใหม่หรือไม่
- ตรวจสอบใน GitHub repository

#### Test 2: Pull และ Import เข้า RAG

**Option A: Manual Test**
```bash
# 1. Clone หรือ pull repository
cd d:\rag-chatbot-project\docs
git clone <your-test-repo-url> test-wiki
# หรือ
cd test-wiki && git pull

# 2. Import เข้า RAG
node scripts/import-docs-to-rag.js
```

**Option B: ใช้ N8n (ถ้ามี)**
- สร้าง workflow สำหรับ pull + import

---

## 🔧 Configuration Files

### docker-compose.yml
- Wiki.js + PostgreSQL
- พร้อมสำหรับทดสอบ

### Environment Variables
- Database credentials
- Wiki.js settings

---

## 📝 Testing Checklist

### Phase 1: Wiki.js Setup
- [ ] Docker containers รันอยู่
- [ ] เข้า Wiki.js ได้ (http://localhost:3000)
- [ ] Setup wizard สำเร็จ
- [ ] Login ได้

### Phase 2: Git Storage Setup
- [ ] ตั้งค่า Git Storage ใน Wiki.js
- [ ] Activate storage target
- [ ] ทดสอบ push ไป Git repository

### Phase 3: Content Creation
- [ ] สร้างหน้าใหม่ใน Wiki
- [ ] ตรวจสอบว่า commit ไป Git แล้ว
- [ ] ตรวจสอบใน GitHub repository

### Phase 4: RAG Integration
- [ ] Clone/pull repository
- [ ] Import script ทำงานได้
- [ ] ข้อมูลเข้า ChromaDB แล้ว
- [ ] ทดสอบค้นหาใน RAG system

### Phase 5: Auto Update
- [ ] แก้ไขเนื้อหาใน Wiki
- [ ] ตรวจสอบว่า sync ไป Git แล้ว
- [ ] Pull ข้อมูลใหม่
- [ ] Import เข้า RAG
- [ ] ตรวจสอบว่าข้อมูลอัปเดตใน RAG แล้ว

---

## 🐛 Troubleshooting

### Wiki.js ไม่สามารถเชื่อมต่อ Database
```bash
# ตรวจสอบว่า postgres container รันอยู่
docker-compose ps

# ตรวจสอบ logs
docker-compose logs postgres
docker-compose logs wiki
```

### Git Storage ไม่ทำงาน
- ตรวจสอบ SSH key หรือ credentials
- ตรวจสอบ repository URL
- ตรวจสอบ network connection

### Import Script ไม่ทำงาน
- ตรวจสอบว่า repository clone มาแล้ว
- ตรวจสอบว่า Backend API รันอยู่
- ตรวจสอบ ChromaDB connection

---

## 🧹 Cleanup

**หยุด containers:**
```bash
docker-compose down
```

**ลบ volumes (ลบข้อมูลทั้งหมด):**
```bash
docker-compose down -v
```

---

## 📚 Next Steps

หลังจากทดสอบสำเร็จ:
1. ตั้งค่า Git Storage ให้ชี้ไป repo ของหัวหน้า
2. สร้าง N8n workflow สำหรับ auto-sync
3. Deploy production
