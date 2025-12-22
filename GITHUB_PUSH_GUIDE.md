# Pushing Apple Pay Project to GitHub

## Quick Steps

### 1. Initialize Git (if not already done)
```bash
cd C:\Users\ali.yusuf\Documents\apple-pay
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create First Commit
```bash
git commit -m "Initial Apple Pay project setup"
```

### 4. Create GitHub Repository

1. Go to: https://github.com/new
2. Login with your account (ali.yusuf.uic@gmail.com)
3. Repository name: `apple-pay` (or whatever you want)
4. Description: `Apple Pay integration project`
5. Choose: **Private** (to keep your code safe)
6. Click **Create repository**

### 5. Add Remote & Push

GitHub will show you commands. Run these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/apple-pay.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## ✅ What Gets Uploaded (Safe):
- ✅ `public/` folder (HTML, CSS, JS)
- ✅ `src/` folder
- ✅ `server.js`
- ✅ `package.json`
- ✅ `.well-known/` folder (with placeholder)
- ✅ Documentation (`.md` files)

## ✅ What Gets IGNORED (Protected):
- ❌ `.env` (your secrets)
- ❌ `certs/` (your certificates)
- ❌ `csr/` (your keys)
- ❌ `node_modules/` (too large)

This is thanks to `.gitignore` we just created! 🔒

---

## Full Commands (Copy & Paste)

```bash
cd C:\Users\ali.yusuf\Documents\apple-pay
git init
git add .
git commit -m "Initial Apple Pay project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/apple-pay.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Need Help?

1. Create GitHub account if you don't have one
2. Go to https://github.com/new
3. Create a repo named `apple-pay`
4. GitHub will show you the commands to copy
5. Run them in your project folder

Done! Your code is now safe on GitHub. 🚀
