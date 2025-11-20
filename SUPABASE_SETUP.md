# Supabase Setup Guide

This guide will walk you through connecting your Casualties Heatmap app to your Supabase project.

## Prerequisites

- A Supabase account and project
- The CSV file already uploaded to a Supabase Storage bucket

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Navigate to **Settings** (gear icon in sidebar) → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## Step 2: Configure Storage Bucket

1. In your Supabase dashboard, go to **Storage** in the sidebar
2. Find the bucket where you uploaded `merged.csv`
3. Note the bucket name (you'll need this)
4. **IMPORTANT**: Make the bucket public or configure appropriate policies:

   ### Option A: Make Bucket Public (Simplest)

   - Click on your bucket
   - Go to **Policies** tab
   - Click **New Policy** → **Get started quickly** → **Allow public read access**
   - This allows anyone to read files from this bucket

   ### Option B: Create Custom Policy (More Secure)

   - Create a policy with the following SQL:

   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'your-bucket-name' );
   ```

## Step 3: Update Local Environment Variables

1. Open your `.env` file in the project root
2. Add the following variables with your actual values:

```env
VITE_APP_PASSWORD=your_secure_password_here

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_BUCKET_NAME=your-bucket-name
VITE_SUPABASE_FILE_PATH=merged.csv
```

**Replace:**

- `https://xxxxxxxxxxxxx.supabase.co` with your Project URL
- `your-anon-key-here` with your anon/public key
- `your-bucket-name` with the name of your storage bucket
- `merged.csv` with the path to your file in the bucket (if it's in a subfolder, use `folder/merged.csv`)

## Step 4: Test Locally

1. Install dependencies (if not already done):

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the app in your browser and verify that:
   - The app loads without errors
   - The heatmap displays with data from Supabase
   - Check the browser console for any errors

## Step 5: Deploy to Render

1. **Commit and push your changes** to GitHub:

   ```bash
   git add .
   git commit -m "Add Supabase integration for CSV data"
   git push origin main
   ```

2. **Set up Render deployment**:

   - Go to https://render.com/dashboard
   - Click **New** → **Static Site**
   - Connect your GitHub repository
   - Configure the build settings:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`

3. **Add Environment Variables in Render**:

   - In your Render service dashboard, go to **Environment**
   - Add the following environment variables:
     ```
     VITE_APP_PASSWORD=your_secure_password_here
     VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     VITE_SUPABASE_BUCKET_NAME=your-bucket-name
     VITE_SUPABASE_FILE_PATH=merged.csv
     ```

4. **Deploy**: Render will automatically build and deploy your app

## Troubleshooting

### Error: "Failed to load CSV from Supabase"

**Possible causes:**

1. **Bucket is not public**: Make sure you've set up the storage policy (see Step 2)
2. **Wrong bucket name**: Double-check the bucket name in your `.env` file
3. **Wrong file path**: Verify the file path matches the location in your bucket
4. **Invalid credentials**: Verify your Supabase URL and anon key are correct

### How to check bucket policies:

1. Go to **Storage** in Supabase dashboard
2. Click on your bucket
3. Go to **Policies** tab
4. Ensure there's a policy allowing SELECT operations

### Testing the Supabase connection:

Open your browser's developer console and run:

```javascript
// This will show you the exact error from Supabase
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Bucket:", import.meta.env.VITE_SUPABASE_BUCKET_NAME);
```

## Security Notes

- The **anon key** is safe to use in frontend applications - it's designed for public access
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- For production, consider implementing Row Level Security (RLS) policies in Supabase
- The anon key has limited permissions and can't access protected data

## Benefits of This Approach

✅ No large files in Git repository  
✅ Easy to update data without redeploying  
✅ Scalable storage solution  
✅ Works seamlessly with Render deployment  
✅ Can leverage Supabase CDN for faster downloads
