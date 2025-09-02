import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check if cloud storage is configured
    const useCloudStorage = process.env.USE_CLOUD_STORAGE === 'true';
    
    if (useCloudStorage) {
      // Use Cloudinary if configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
        return await uploadToCloudinary(file);
      }
      
      // Use S3 if configured
      if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
        return await uploadToS3(file);
      }
      
      // Fallback to local storage if cloud config is incomplete
      console.warn("Cloud storage configured but incomplete, falling back to local storage");
    }

    // Default to local storage
    return await uploadToLocal(file);

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Local storage upload
async function uploadToLocal(file) {
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), "public", "uploads", "events");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const filename = `event-${timestamp}-${randomString}.${fileExtension}`;
  const filepath = join(uploadsDir, filename);

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);

  // Return the public URL
  const publicUrl = `/uploads/events/${filename}`;

  return NextResponse.json({
    success: true,
    url: publicUrl,
    filename: filename,
    storage: 'local',
    message: "Image uploaded successfully to local storage"
  });
}

// Cloudinary upload
async function uploadToCloudinary(file) {
  // Convert file to base64 for Cloudinary
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

  // Upload to Cloudinary
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const uploadData = new FormData();
  uploadData.append('file', base64String);
  uploadData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
  uploadData.append('folder', 'eklektikmama/events');
  uploadData.append('transformation', 'f_auto,q_auto');

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: uploadData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
  }

  const result = await response.json();

  return NextResponse.json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    filename: file.name,
    storage: 'cloudinary',
    message: "Image uploaded successfully to Cloudinary"
  });
}

// S3 upload
async function uploadToS3(file) {
  // Dynamic import to avoid bundling AWS SDK in client
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const filename = `event-${timestamp}-${randomString}.${fileExtension}`;
  const key = `events/${filename}`;

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to S3
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read',
    Metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  await s3Client.send(uploadCommand);

  // Generate public URL
  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return NextResponse.json({
    success: true,
    url: publicUrl,
    key: key,
    filename: filename,
    storage: 's3',
    message: "Image uploaded successfully to S3"
  });
}
