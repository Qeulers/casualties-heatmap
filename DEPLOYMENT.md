# Deployment Guide for Render.com

This guide walks you through deploying the Maritime Casualties Heatmap to Render.com as a static site.

## Prerequisites

- A Render.com account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code** to your Git repository, including the `render.yaml` file

2. **Create a new Blueprint** on Render.com:

   - Go to https://dashboard.render.com/blueprints
   - Click "New Blueprint Instance"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

3. **Set environment variable**:

   - In the Blueprint setup, you'll be prompted to set `VITE_APP_PASSWORD`
   - Enter a secure password (this will be required to access the app)

4. **Deploy**:
   - Click "Apply" to create and deploy your service
   - Wait for the build to complete (~2-3 minutes)

### Option 2: Manual Setup

1. **Create a new Static Site** on Render.com:

   - Go to https://dashboard.render.com/
   - Click "New +" → "Static Site"
   - Connect your repository

2. **Configure build settings**:

   - **Name**: `casualties-heatmap` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add environment variable**:

   - Go to "Environment" tab
   - Add key: `VITE_APP_PASSWORD`
   - Add value: Your secure password
   - Click "Save Changes"

4. **Deploy**:
   - Click "Create Static Site"
   - Wait for the build to complete

## Post-Deployment

### Accessing Your App

Once deployed, your app will be available at:

```
https://your-app-name.onrender.com
```

You'll be prompted to enter the password you set in `VITE_APP_PASSWORD`.

### Custom Domain (Optional)

To use a custom domain:

1. Go to your service settings on Render
2. Navigate to "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

### Updating the App

To deploy updates:

1. Push changes to your Git repository
2. Render will automatically detect changes and redeploy
3. Or manually trigger a deploy from the Render dashboard

## Environment Variables

The app uses one environment variable:

- `VITE_APP_PASSWORD`: The password required to access the application

**Important**: Never commit your `.env` file to Git. The `.env.example` file is provided as a template.

## Build Optimization

The production build is optimized with:

- Code splitting
- Minification
- Tree shaking
- Asset optimization

The 3.4MB CSV file is included in the build and will be cached by browsers.

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node version compatibility (requires Node 20.10+)
- Check build logs for specific errors

### App Not Loading

- Verify `VITE_APP_PASSWORD` is set correctly
- Check browser console for errors
- Ensure the CSV file is in `public/merged.csv`

### Password Not Working

- Verify the environment variable is set on Render
- Remember that environment variables are case-sensitive
- Try redeploying after changing the password

## Performance Notes

- First load: ~3.5MB (includes CSV data)
- Subsequent loads: Cached (only ~500KB for app code)
- Map tiles are loaded on-demand from CDN
- All filtering happens client-side (no backend required)

## Cost

This app runs entirely on Render's free tier:

- Static site hosting: Free
- Bandwidth: 100GB/month free
- No backend or database costs

## Security Notes

- Password is checked client-side (suitable for POC)
- For production, consider implementing proper authentication
- The CSV data is publicly accessible once authenticated
- Environment variables are secure and not exposed to clients
