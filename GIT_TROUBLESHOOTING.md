# 🔧 แก้ไขปัญหา Git Storage ใน Wiki.js

## ❌ ปัญหาที่พบ

- Error: "README.md: needs merge error: you need to resolve your current index first"
- Status: แสดง error แม้ว่าจะตั้งค่าแล้ว
- Sync ไม่ทำงาน

---

## 🔍 วิธีแก้ไขแบบละเอียด

### วิธีที่ 1: ตรวจสอบ Repository Settings

**1. ตรวจสอบว่า Repository เป็น Public หรือ Private**

- ไปที่: https://github.com/Sunshine050/Rag-Chatbot-Carmen
- ดูว่าเป็น "Public" หรือ "Private"

**2. ถ้าเป็น Private:**
- PAT ต้องมี scope `repo` (full control)
- ตรวจสอบว่า PAT มีสิทธิ์เข้าถึง private repositories

**3. ถ้าเป็น Public:**
- PAT ต้องมี scope `public_repo` อย่างน้อย
- หรือ scope `repo` (ครอบคลุม public_repo)

---

### วิธีที่ 2: สร้าง PAT ใหม่ที่มีสิทธิ์ครบ

**1. ไปที่:** https://github.com/settings/tokens

**2. Generate new token (classic)**

**3. ตั้งค่า:**
- Note: `Wiki.js Git Storage - Full Access`
- Expiration: `No expiration` (หรือ 90 days)
- **Scopes: ติ๊กทุก checkbox ภายใต้ `repo`:**
  - ✅ repo (full control of private repositories)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events

**4. Generate token**

**5. Copy token ใหม่**

---

### วิธีที่ 3: ใช้ SSH แทน HTTPS (แนะนำถ้า PAT ไม่ได้ผล)

#### ขั้นตอน:

**1. สร้าง SSH Key (บน Mac)**

```bash
# สร้าง SSH key
ssh-keygen -t ed25519 -C "wiki@carmen"

# ดู public key
cat ~/.ssh/id_ed25519.pub
```

**2. เพิ่ม SSH Key ใน GitHub**

1. ไปที่: https://github.com/settings/keys
2. New SSH key
3. Title: `Wiki.js Mac`
4. Key: วาง public key ที่ copy มา
5. Add SSH key

**3. ใช้ SSH ใน Wiki.js**

**ในหน้า Git Storage Configuration:**

- **Authentication Type**: `ssh` (เปลี่ยนจาก basic)
- **Repository URI**: `git@github.com:Sunshine050/Rag-Chatbot-Carmen.git`
- **SSH Private Key Mode**: `contents`
- **SSH Private Key Contents**: วาง **private key** (`~/.ssh/id_ed25519`)
  - ดู private key: `cat ~/.ssh/id_ed25519`

**4. Apply และทดสอบ**

---

### วิธีที่ 4: ตรวจสอบ Repository Permissions

**1. ตรวจสอบว่า Account มีสิทธิ์:**

- ไปที่: https://github.com/Sunshine050/Rag-Chatbot-Carmen/settings
- Settings → Collaborators
- ตรวจสอบว่า account `Sunshine050` มีสิทธิ์ `Write` หรือ `Admin`

**2. ถ้าไม่มีสิทธิ์:**
- ต้องเพิ่มตัวเองเป็น collaborator
- หรือใช้ account ที่มีสิทธิ์

---

### วิธีที่ 5: Manual Fix (ถ้าเข้าถึง Container ได้)

**1. เข้าไปใน Wiki.js Container:**

```bash
# บน Mac
docker-compose exec wiki bash

# หรือ
docker exec -it rag-chatbot-project-wiki-1 bash
```

**2. ไปที่ Local Repository:**

```bash
cd /wiki/data/repo
```

**3. แก้ไข Git Issues:**

```bash
# ดู status
git status

# Reset hard
git reset --hard HEAD

# Pull จาก remote
git fetch origin
git reset --hard origin/main

# หรือลบและ clone ใหม่
cd /wiki/data
rm -rf repo
git clone https://github.com/Sunshine050/Rag-Chatbot-Carmen.git repo
```

---

## 🎯 ขั้นตอนที่แนะนำ (ตามลำดับ)

### Step 1: ลองใช้ SSH (แนะนำ)

1. สร้าง SSH key
2. เพิ่ม SSH key ใน GitHub
3. เปลี่ยน Authentication Type เป็น `ssh` ใน Wiki.js
4. ใช้ SSH URL และ private key
5. Apply และทดสอบ

### Step 2: ถ้า SSH ไม่ได้ → ตรวจสอบ PAT

1. สร้าง PAT ใหม่ที่มี scope `repo` ครบทุก checkbox
2. ใช้ใน Wiki.js
3. ลองใช้ Username = `x-access-token`
4. Apply และทดสอบ

### Step 3: ถ้ายังไม่ได้ → Manual Fix

1. เข้าไปใน container
2. แก้ไข Git repository manually
3. หรือลบและ clone ใหม่

---

## 🔍 ตรวจสอบเพิ่มเติม

### ตรวจสอบ Logs:

**ดู logs ของ Wiki.js:**
```bash
docker-compose logs wiki --tail 50
```

**ดู error messages:**
- คลิกที่ red 'i' icon ใน Status
- ดู error message ที่ชัดเจน

### ตรวจสอบ Network:

**ทดสอบการเชื่อมต่อ:**
```bash
# ทดสอบ HTTPS
curl -I https://github.com/Sunshine050/Rag-Chatbot-Carmen.git

# ทดสอบ SSH (ถ้าใช้ SSH)
ssh -T git@github.com
```

---

## ✅ สรุป

**ลองตามลำดับ:**
1. ใช้ SSH authentication (แนะนำ - ปลอดภัยกว่า)
2. สร้าง PAT ใหม่ที่มี scope ครบ
3. Manual fix ใน container
4. ตรวจสอบ repository permissions

**ถ้ายังไม่ได้ → แจ้ง error message ที่ชัดเจนมา**
