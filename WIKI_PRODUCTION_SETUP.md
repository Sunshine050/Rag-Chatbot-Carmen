# 🚀 คู่มือการตั้งค่า Wiki.js Production (wiki.semapru.com)

## 📋 ภาพรวม

Wiki.js ถูก deploy ไว้ที่: **https://wiki.semapru.com/**

---

## ✅ ขั้นตอนการตั้งค่า

### Step 1: Login เข้า Wiki.js Production

1. ไปที่: **https://wiki.semapru.com/**
2. Login ด้วย credentials ที่หัวหน้าให้มา

---

### Step 2: ตั้งค่า Git Storage

1. **ไปที่ Administration** → **Storage** → **Git**

2. **ตั้งค่า:**
   - **Authentication Type**: `ssh` (หรือ `basic` ตามที่ตั้งค่าไว้)
   
   - **Repository URI**: 
     - SSH: `git@github.com:Sunshine050/Rag-Chatbot-Carmen.git`
     - หรือ Basic: `https://github.com/Sunshine050/Rag-Chatbot-Carmen.git`
   
   - **Branch**: `main`
   
   - **SSH Private Key** (ถ้าใช้ SSH):
     - Mode: `contents`
     - วาง private key ในช่อง "SSH Private Key Contents"
   
   - **Username/Password** (ถ้าใช้ basic):
     - Username: `x-access-token` (หรือ GitHub username)
     - Password: Personal Access Token
   
   - **Sync Direction**: `Bi-directional` (แนะนำ)
   
   - **Sync Schedule**: `Every 5 minutes` (หรือตามต้องการ)

3. **Activate**: เปิดใช้งาน storage target

4. **Apply**: บันทึกการตั้งค่า

5. **Force Sync**: ทดสอบ sync ครั้งแรก

---

### Step 3: ตรวจสอบการ Sync

**1. สร้างหน้าใหม่ใน Wiki.js:**
- สร้างหน้า test
- Save/Publish

**2. Force Sync:**
- ไปที่ Git Storage Configuration
- คลิก "Force Sync"
- ตรวจสอบ Status (ควรเป็น green checkmark)

**3. ตรวจสอบใน GitHub:**
- ไปที่: https://github.com/Sunshine050/Rag-Chatbot-Carmen
- ดูว่ามี commit ใหม่หรือไม่

**4. ตรวจสอบใน ChromaDB:**
- ไปที่ ChromaDB Cloud Dashboard
- ดู Collection `sunshine050_rag_chatbot_carmen_main`
- ดูว่ามี documents เพิ่มขึ้นหรือไม่

---

## 🔄 Workflow หลังย้ายไป Production

```
Wiki.js (wiki.semapru.com)
  ↓
Git Storage (auto sync ทุก 5 นาที)
  ↓
GitHub (Rag-Chatbot-Carmen)
  ↓
ChromaDB Sync (auto sync จาก GitHub)
  ↓
ChromaDB Collection (sunshine050_rag_chatbot_carmen_main)
  ↓
RAG API (Backend)
  ↓
Frontend (Chatbot)
```

---

## 📝 Checklist

### การตั้งค่า Git Storage:
- [ ] Login เข้า wiki.semapru.com
- [ ] ไปที่ Administration → Storage → Git
- [ ] ตั้งค่า Repository URI
- [ ] ตั้งค่า Authentication (SSH หรือ Basic)
- [ ] ตั้งค่า Sync Direction: Bi-directional
- [ ] ตั้งค่า Sync Schedule: Every 5 minutes
- [ ] Activate storage target
- [ ] Apply changes
- [ ] Force Sync (ทดสอบ)

### การทดสอบ:
- [ ] สร้างหน้าใหม่ใน Wiki.js
- [ ] Force Sync
- [ ] ตรวจสอบใน GitHub (มี commit ใหม่)
- [ ] ตรวจสอบใน ChromaDB (มี documents เพิ่ม)
- [ ] ทดสอบถามคำถามใน RAG system

---

## 🔍 Troubleshooting

### Git Storage ไม่ทำงาน

**ปัญหา:** Sync ไม่สำเร็จ

**แก้ไข:**
1. ตรวจสอบ SSH key หรือ credentials
2. ตรวจสอบ repository URL
3. ตรวจสอบ network connection (VM server)
4. ดู error message ใน Status

### Sync ช้า

**ปัญหา:** Sync ใช้เวลานาน

**แก้ไข:**
1. ตรวจสอบ network connection
2. ตรวจสอบขนาดของ repository
3. ลอง Force Sync อีกครั้ง

### ChromaDB ไม่ sync

**ปัญหา:** ChromaDB ไม่มี documents ใหม่

**แก้ไข:**
1. ตรวจสอบว่า GitHub มี commit ใหม่หรือไม่
2. ตรวจสอบ ChromaDB Sync settings
3. ตรวจสอบ collection name ใน ChromaDB

---

## 📚 เอกสารอ้างอิง

- `WORKFLOW_OVERVIEW.md` - ภาพรวม workflow
- `GIT_AUTH_FIX.md` - แก้ไขปัญหา Git authentication
- `Backend/IMPORT_WIKI_GUIDE.md` - คู่มือ import script

---

## 🎯 สรุป

**หลังจากตั้งค่าเสร็จ:**
1. Wiki.js (wiki.semapru.com) → Git (auto sync)
2. Git → ChromaDB (auto sync via ChromaDB Sync)
3. ChromaDB → RAG API (พร้อมใช้งาน)

**Workflow จะทำงานอัตโนมัติ!** 🎉
