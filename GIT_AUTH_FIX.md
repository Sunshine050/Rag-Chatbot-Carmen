# 🔧 แก้ไขปัญหา Git Authentication

## ❌ Error ที่พบ

```
fatal: could not read Username for 'https://github.com': No such device or address
```

**สาเหตุ:** ใช้ HTTPS URL แต่ไม่มี credentials

---

## ✅ วิธีแก้ไข

### วิธีที่ 1: ใช้ Personal Access Token (แนะนำ)

#### ขั้นตอน:

**1. สร้าง Personal Access Token ใน GitHub**

1. ไปที่ GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. ตั้งค่า:
   - Note: `Wiki.js Git Storage`
   - Expiration: ตามต้องการ
   - Scopes: ติ๊ก `repo` (full control of private repositories)
5. Generate token
6. **Copy token** (จะแสดงแค่ครั้งเดียว!)

**2. ใช้ Token ใน Wiki.js**

**ในหน้า Git Storage Configuration:**

- **Authentication Type**: `basic`
- **Repository URI**: `https://github.com/Sunshine050/Rag-Chatbot-Carmen.git`
- **Username**: GitHub username ของคุณ
- **Password / PAT**: วาง **Personal Access Token** (ไม่ใช่ password!)

**3. Apply และทดสอบ**

---

### วิธีที่ 2: ใช้ SSH (ปลอดภัยกว่า)

#### ขั้นตอน:

**1. สร้าง SSH Key (ถ้ายังไม่มี)**

```bash
# บน Mac
ssh-keygen -t ed25519 -C "your_email@example.com"

# ดู public key
cat ~/.ssh/id_ed25519.pub
```

**2. เพิ่ม SSH Key ใน GitHub**

1. Copy public key ที่ได้
2. ไปที่ GitHub → Settings → SSH and GPG keys
3. New SSH key
4. วาง public key
5. Add SSH key

**3. ใช้ SSH ใน Wiki.js**

**ในหน้า Git Storage Configuration:**

- **Authentication Type**: `SSH`
- **Repository URI**: `git@github.com:Sunshine050/Rag-Chatbot-Carmen.git`
- **SSH Private Key Mode**: `contents`
- **SSH Private Key Contents**: วาง **private key** (`~/.ssh/id_ed25519`)

**4. Apply และทดสอบ**

---

## 🔍 ตรวจสอบ

### ทดสอบการเชื่อมต่อ

**สำหรับ HTTPS:**
```bash
# ทดสอบด้วย token
git clone https://<token>@github.com/Sunshine050/Rag-Chatbot-Carmen.git
```

**สำหรับ SSH:**
```bash
# ทดสอบ SSH connection
ssh -T git@github.com
```

---

## 📝 สรุป

### วิธีที่แนะนำ: Personal Access Token

**ข้อดี:**
- ตั้งค่าครั้งเดียว
- ใช้งานง่าย
- ควบคุมได้ (revoke ได้)

**ขั้นตอน:**
1. สร้าง Personal Access Token ใน GitHub
2. ใช้ใน Wiki.js: Username = GitHub username, Password = Token
3. Apply

---

## ⚠️ หมายเหตุ

- **Personal Access Token** ไม่ใช่ password
- Token จะแสดงแค่ครั้งเดียว - ต้อง copy ไว้
- ถ้าลืม token → สร้างใหม่ได้
- Token มี expiration date - ต้อง renew เมื่อหมดอายุ

---

## 🆘 ถ้ายังไม่ได้

### ตรวจสอบ:

1. **Token ถูกต้องหรือไม่?**
   - ตรวจสอบว่า copy ครบทุกตัวอักษร
   - ไม่มี space หรือ newline

2. **Repository มีสิทธิ์หรือไม่?**
   - ตรวจสอบว่า account มีสิทธิ์ push ไป repository

3. **URL ถูกต้องหรือไม่?**
   - HTTPS: `https://github.com/username/repo.git`
   - SSH: `git@github.com:username/repo.git`

---

## ✅ หลังจากแก้ไข

เมื่อตั้งค่าเสร็จแล้ว:
1. ทดสอบการสร้างเนื้อหาใน Wiki
2. ตรวจสอบว่า push ไป GitHub สำเร็จ
3. ตรวจสอบใน GitHub repository
