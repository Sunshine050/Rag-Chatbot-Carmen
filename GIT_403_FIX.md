# 🔧 แก้ไขปัญหา Git 403 Permission Denied

## ❌ Error ที่พบ

```
remote: Permission to Sunshine050/Rag-Chatbot-Carmen.git denied to Sunshine050.
fatal: unable to access 'https://github.com/Sunshine050/Rag-Chatbot-Carmen.git/': 
The requested URL returned error: 403
```

**สาเหตุที่เป็นไปได้:**
1. PAT ไม่มี scope `repo` ที่ถูกต้อง
2. PAT หมดอายุ
3. Username ไม่ถูกต้อง
4. Repository เป็น private และ PAT ไม่มีสิทธิ์

---

## ✅ วิธีแก้ไข

### วิธีที่ 1: ตรวจสอบและสร้าง PAT ใหม่ (แนะนำ)

#### ขั้นตอน:

**1. ตรวจสอบ PAT ที่มีอยู่**

- ไปที่: https://github.com/settings/tokens
- ดูว่า PAT ที่ใช้มี scope `repo` หรือไม่
- ตรวจสอบว่า PAT ยังไม่หมดอายุ

**2. สร้าง PAT ใหม่ (ถ้าจำเป็น)**

1. ไปที่: https://github.com/settings/tokens
2. Generate new token (classic)
3. ตั้งค่า:
   - **Note**: `Wiki.js Git Storage - Full Access`
   - **Expiration**: ตามต้องการ (แนะนำ: 90 days หรือ No expiration)
   - **Scopes**: ติ๊ก **`repo`** (full control of private repositories)
     - ต้องติ๊ก `repo` ให้ครบทุก checkbox:
       - ✅ repo
       - ✅ repo:status
       - ✅ repo_deployment
       - ✅ public_repo (ถ้า repository เป็น public)
       - ✅ repo:invite
       - ✅ security_events
4. Generate token
5. **Copy token** (แสดงแค่ครั้งเดียว!)

**3. ใช้ PAT ใหม่ใน Wiki.js**

- **Username**: GitHub username ของคุณ (เช่น `Sunshine050`)
- **Password / PAT**: วาง PAT ใหม่ที่สร้าง

---

### วิธีที่ 2: ใช้ Username เป็น `x-access-token` (บางกรณี)

**บางครั้งต้องใช้:**

- **Username**: `x-access-token`
- **Password / PAT**: วาง PAT

ลองวิธีนี้ถ้าวิธีแรกไม่ได้ผล

---

### วิธีที่ 3: ตรวจสอบ Repository Permissions

**ตรวจสอบว่า account มีสิทธิ์ push:**

1. ไปที่ Repository: https://github.com/Sunshine050/Rag-Chatbot-Carmen
2. Settings → Collaborators
3. ตรวจสอบว่า account ของคุณมีสิทธิ์ `Write` หรือ `Admin`

---

## 🔍 ตรวจสอบ PAT

### ตรวจสอบ Scope ของ PAT

PAT ต้องมี scope ต่อไปนี้:
- ✅ **repo** (full control of private repositories)
- ✅ **repo:status**
- ✅ **repo_deployment**
- ✅ **public_repo** (ถ้า repository เป็น public)

### ตรวจสอบ Expiration

- ดูว่า PAT ยังไม่หมดอายุ
- ถ้าหมดอายุ → สร้างใหม่

---

## 📝 ขั้นตอนการแก้ไข (สรุป)

### 1. สร้าง PAT ใหม่

```
GitHub → Settings → Developer settings → 
Personal access tokens → Tokens (classic) → 
Generate new token (classic)
```

**ตั้งค่า:**
- Note: `Wiki.js Git Storage`
- Expiration: 90 days หรือ No expiration
- Scopes: ✅ repo (ทุก checkbox)

### 2. ใช้ใน Wiki.js

**ในหน้า Git Storage Configuration:**

- **Authentication Type**: `basic`
- **Repository URI**: `https://github.com/Sunshine050/Rag-Chatbot-Carmen.git`
- **Username**: `Sunshine050` (หรือลอง `x-access-token`)
- **Password / PAT**: วาง PAT ใหม่

### 3. Apply และทดสอบ

- Apply: บันทึกการตั้งค่า
- ทดสอบ: สร้างหน้าใหม่ใน Wiki
- ตรวจสอบ: ดูว่า push สำเร็จหรือไม่

---

## 🆘 ถ้ายังไม่ได้

### ตรวจสอบเพิ่มเติม:

1. **Repository เป็น Private หรือ Public?**
   - ถ้า Private → PAT ต้องมี scope `repo`
   - ถ้า Public → PAT ต้องมี scope `public_repo`

2. **Account มีสิทธิ์ใน Repository หรือไม่?**
   - ตรวจสอบใน Repository Settings → Collaborators

3. **ลองใช้ SSH แทน HTTPS**
   - ตั้งค่า SSH key
   - ใช้ SSH URL: `git@github.com:Sunshine050/Rag-Chatbot-Carmen.git`

---

## ✅ สรุป

**สิ่งที่ต้องทำ:**
1. สร้าง PAT ใหม่ที่มี scope `repo` ครบถ้วน
2. ใช้ใน Wiki.js: Username = GitHub username, Password = PAT
3. Apply และทดสอบ

**หรือลอง:**
- Username = `x-access-token`
- Password = PAT
