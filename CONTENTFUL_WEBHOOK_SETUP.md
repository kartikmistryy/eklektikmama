# Contentful Webhook Setup Guide

This guide explains how to set up Contentful webhooks to automatically revalidate your blog pages when content is updated.

## What Was Implemented

1. **ISR (Incremental Static Regeneration)**: Blog pages now revalidate every 60 seconds automatically
2. **On-Demand Revalidation**: A webhook endpoint that triggers immediate revalidation when Contentful content is published/updated

## Setting Up the Contentful Webhook

### Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://your-domain.com/api/webhooks/contentful
```

Replace `your-domain.com` with your actual Vercel deployment domain (e.g., `eklektikmama.com` or `eklektikmama.vercel.app`).

### Step 2: Configure in Contentful

1. Go to your Contentful space
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Fill in the details:
   - **Name**: `Blog Revalidation` (or any name you prefer)
   - **URL**: `https://your-domain.com/api/webhooks/contentful`
   - **Content type**: Select `blogs`
   - **Trigger**: Select:
     - ✅ **Publish** (when content is published)
     - ✅ **Unpublish** (when content is unpublished)
     - ✅ **Archive** (when content is archived)
     - ✅ **Unarchive** (when content is unarchived)
     - ✅ **Create** (when new content is created)
     - ✅ **Save** (when content is saved - optional, can cause frequent revalidations)
   - **HTTP method**: `POST`
   - **Authentication**: (Optional) If you want to add a secret, see Step 3

### Step 3: Optional - Add Webhook Secret (Recommended for Production)

For added security, you can verify webhook signatures:

1. In Contentful webhook settings, generate or set a webhook secret
2. Add the secret to your Vercel environment variables:
   - Variable name: `CONTENTFUL_WEBHOOK_SECRET`
   - Value: The secret from Contentful
3. The webhook handler will automatically verify signatures if this variable is set

### Step 4: Test the Webhook

1. Make a small change to a blog post in Contentful
2. Publish the change
3. Check your Vercel deployment logs to see the webhook being called
4. Visit your blog page - it should show the updated content within 60 seconds (or immediately if the webhook worked)

## How It Works

1. **Time-Based Revalidation (ISR)**: 
   - Pages automatically revalidate every 60 seconds
   - This ensures content is never more than 60 seconds old
   - Works even if webhooks fail

2. **On-Demand Revalidation (Webhook)**:
   - When you publish/update content in Contentful, it sends a webhook to your API
   - The API immediately revalidates the affected pages
   - This provides instant updates without waiting for the 60-second interval

## Troubleshooting

### Webhook Not Working

1. **Check Vercel Logs**: Go to your Vercel dashboard → Deployment → Functions → View logs
2. **Test the Endpoint**: Visit `https://your-domain.com/api/webhooks/contentful` in your browser (should return a JSON response)
3. **Verify URL**: Make sure the webhook URL in Contentful matches your deployment URL exactly
4. **Check Environment Variables**: Ensure `CONTENTFUL_WEBHOOK_SECRET` is set if you're using signature verification

### Content Still Not Updating

1. **Wait 60 seconds**: ISR will update the page automatically
2. **Check if webhook is being called**: Look at Vercel function logs
3. **Manually trigger revalidation**: You can manually call the webhook endpoint or wait for the next ISR cycle
4. **Clear browser cache**: Sometimes browsers cache pages aggressively

### Manual Revalidation

If you need to manually trigger revalidation, you can:

1. Call the webhook endpoint directly (if you have the secret configured)
2. Or wait for the 60-second ISR cycle
3. Or redeploy your Vercel application

## Environment Variables

Make sure these are set in your Vercel project:

- `CONTENTFUL_SPACE_ID` - Your Contentful space ID
- `CONTENTFUL_ACCESS_TOKEN` - Your Contentful access token
- `CONTENTFUL_WEBHOOK_SECRET` - (Optional) Webhook secret for signature verification

## Notes

- The webhook handler only processes `blogs` content type updates
- Other content types will be ignored (but the webhook will still return success)
- The webhook revalidates both the blog listing page (`/blogs`) and individual blog post pages
- The home page is also revalidated in case it displays blog content

