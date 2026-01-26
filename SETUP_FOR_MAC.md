# 🍎 คู่มือการ Setup สำหรับ Mac

## 📋 สำหรับเพื่อนที่ใช้ Mac

คู่มือนี้สำหรับเพื่อนที่ต้องการ pull code และรัน Wiki.js บน Mac

---

## 🚀 ขั้นตอนการ Setup

### 1. Clone Repository

```bash
# Clone repository
git clone https://github.com/Sunshine050/Rag-Chatbot-Carmen.git
cd Rag-Chatbot-Carmen
```

### 2. ตรวจสอบ Prerequisites

**ตรวจสอบว่ามี Docker หรือยัง:**
```bash
docker --version
docker-compose --version
```

**ถ้ายังไม่มี Docker:**
- ดาวน์โหลด Docker Desktop for Mac: https://www.docker.com/products/docker-desktop
- ติดตั้งและรัน Docker Desktop

### 3. รัน Wiki.js

```bash
# ไปที่โฟลเดอร์โปรเจกต์
cd Rag-Chatbot-Carmen

# รัน Docker Compose
docker-compose up -d
```

**ตรวจสอบว่า containers รันอยู่:**
```bash
docker-compose ps
```

ควรเห็น:
- `rag-chatbot-project-db-1` หรือ `db` - Database
- `rag-chatbot-project-wiki-1` หรือ `wiki` - Wiki.js

---

### 4. ตั้งค่า Wiki.js

**เปิดเบราว์เซอร์:**
- URL: `http://localhost:3993`

**Setup Wizard:**

1. **เลือกภาษา**

2. **ตั้งค่า Admin Account:**
   - Email: `admin@test.com`
   - Password: `admin123` (หรือตามต้องการ)
   - Site Name: `Carmen Documentation Test`

3. **Database Configuration:**
   - Type: `PostgreSQL`
   - Host: `db` (ใช้ชื่อ service)
   - Port: `5432`
   - Database: `wiki`
   - Username: `wikijs`
   - Password: `wikijsrocks`

4. **Complete Setup**

---

## 🔧 Troubleshooting

### Docker ไม่ทำงาน

**ตรวจสอบ:**
```bash
# ตรวจสอบว่า Docker Desktop รันอยู่
docker ps

# ถ้าไม่ได้ ให้เปิด Docker Desktop
```

### Port 3993 ถูกใช้งานแล้ว

**แก้ไข:**
```bash
# ดูว่า port 3993 ถูกใช้งานหรือไม่
lsof -i :3993

# หรือเปลี่ยน port ใน docker-compose.yml
# แก้ไข: "3993:3000" → "3994:3000" (หรือ port อื่น)
```

### Database Connection Error

**ตรวจสอบ logs:**
```bash
docker-compose logs db
docker-compose logs wiki
```

**Restart containers:**
```bash
docker-compose restart
```

---

## 📝 คำสั่งที่ใช้บ่อย

### ดู Logs
```bash
# ดู logs ของ Wiki.js
docker-compose logs wiki

# ดู logs ของ Database
docker-compose logs db

# ดู logs ทั้งหมด
docker-compose logs -f
```

### หยุด Containers
```bash
docker-compose stop
```

### เริ่ม Containers อีกครั้ง
```bash
docker-compose start
```

### หยุดและลบ Containers
```bash
docker-compose down
```

### หยุดและลบทุกอย่าง (รวม volumes)
```bash
docker-compose down -v
```

---

## ✅ Checklist

- [ ] Clone repository สำเร็จ
- [ ] Docker Desktop ติดตั้งและรันอยู่
- [ ] `docker-compose up -d` สำเร็จ
- [ ] เข้า Wiki.js ได้ที่ `http://localhost:3993`
- [ ] Setup Wizard สำเร็จ
- [ ] Login ได้

---

## 🆘 ถ้ามีปัญหา

### ตรวจสอบ Docker
```bash
docker --version
docker-compose --version
docker ps
```

### ตรวจสอบ Containers
```bash
docker-compose ps
docker-compose logs
```

### Restart ทั้งหมด
```bash
docker-compose down
docker-compose up -d
```

---

## 📚 ข้อมูลเพิ่มเติม

- Docker Compose file: `docker-compose.yml`
- คู่มือการทดสอบ: `WIKI_TEST_SETUP.md`
- คู่มือการรันระบบ: `HOW_TO_RUN.md`

---

## 🎉 พร้อมใช้งาน!

เมื่อ setup สำเร็จแล้ว:
- Wiki.js: `http://localhost:3993`
- พร้อมสำหรับทดสอบ Git Storage และ RAG Integration
