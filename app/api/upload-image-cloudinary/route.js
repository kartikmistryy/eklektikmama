import { NextResponse } from "next/server";

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

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const uploadData = new FormData();
    uploadData.append('file', base64String);
    uploadData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
    uploadData.append('folder', 'eklektikmama/events'); // Organize by folder
    uploadData.append('transformation', 'f_auto,q_auto'); // Auto-optimize format and quality

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
      url: result.secure_url, // HTTPS URL
      publicId: result.public_id,
      filename: file.name,
      message: "Image uploaded successfully to cloud"
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: `Failed to upload image: ${error.message}` },
      { status: 500 }
    );
  }
}
