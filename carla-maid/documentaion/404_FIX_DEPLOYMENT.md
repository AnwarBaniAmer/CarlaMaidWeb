# Fix 404 Error on Page Refresh - Deployment Guide

## Problem
When refreshing any page (e.g., `/our-services`, `/contact-us`), you get a 404 error:
```
The requested URL was not found on this server.
```

## Solution
This happens because Apache/cPanel doesn't know to redirect all routes to `index.html` for Angular routing. We've created a `.htaccess` file to fix this.

## ✅ What's Been Done

1. **Created `.htaccess` file** in `public/.htaccess`
   - This file will be automatically copied to `dist/carla-maid/browser/` during build
   - The file includes:
     - Route rewriting rules to redirect all requests to `index.html`
     - Compression settings
     - Browser caching
     - Security headers

## 🚀 Deployment Steps

### Step 1: Rebuild Your Application
```bash
cd carla-maid
npm run build
```

### Step 2: Verify `.htaccess` is in Build Output
After building, check that `.htaccess` exists in:
```
dist/carla-maid/browser/.htaccess
```

### Step 3: Deploy to cPanel
The `.htaccess` file should be in your `public_html/` directory (root of your website).

**Important:** Make sure the `.htaccess` file is:
- ✅ In the root directory (`public_html/`)
- ✅ Named exactly `.htaccess` (with the dot at the beginning)
- ✅ Has proper permissions (644 or 644)

### Step 4: Verify in cPanel File Manager
1. Go to **File Manager** in cPanel
2. Navigate to `public_html/`
3. Make sure you can see `.htaccess` file
4. If you don't see it, enable "Show Hidden Files" in File Manager settings

### Step 5: Test
1. Visit your website: `https://yourdomain.com/our-services`
2. Refresh the page (F5 or Ctrl+R)
3. The page should load correctly without 404 error

## 🔧 Manual Upload (If Needed)

If the `.htaccess` file doesn't get deployed automatically:

1. **Download the file** from `carla-maid/public/.htaccess`
2. **Upload to cPanel**:
   - Go to File Manager
   - Navigate to `public_html/`
   - Click "Upload"
   - Select the `.htaccess` file
   - Make sure it's named `.htaccess` (with the dot)

## 📋 .htaccess File Contents

The file includes:
- **Route Rewriting**: Redirects all routes to `index.html` for Angular routing
- **Compression**: Gzip compression for faster loading
- **Browser Caching**: Optimized caching for static assets
- **Security Headers**: Basic security headers

## ⚠️ Troubleshooting

### If 404 errors persist:

1. **Check if mod_rewrite is enabled**:
   - In cPanel, go to **Apache Modules**
   - Make sure `mod_rewrite` is enabled

2. **Check file permissions**:
   ```bash
   chmod 644 .htaccess
   ```

3. **Check if .htaccess is in the right location**:
   - Must be in `public_html/` (root directory)
   - Not in a subdirectory

4. **Check Apache error logs**:
   - In cPanel, go to **Error Logs**
   - Look for any `.htaccess` related errors

5. **Test .htaccess syntax**:
   - You can test the syntax using online validators
   - Or check Apache error logs for syntax errors

## ✅ Expected Result

After deployment:
- ✅ All routes work when accessed directly
- ✅ Page refresh works on any route
- ✅ No more 404 errors
- ✅ Angular routing works correctly

## 📝 Notes

- The `.htaccess` file is automatically included in the build output
- It's copied from `public/.htaccess` to `dist/carla-maid/browser/.htaccess`
- Make sure your deployment process copies all files from `dist/carla-maid/browser/` to `public_html/`

