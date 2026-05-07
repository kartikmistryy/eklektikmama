"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const fileToBase64 = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

export default function AdminCategoryListingsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const blankForm = {
    title: "",
    description: "",
    image: "",
    imageAlt: "",
    link: "",
    order: 0,
    isActive: true,
  };
  const [form, setForm] = useState(blankForm);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/admin/local-edit/categories/${id}`);
      if (res.ok) setCategory(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(
        `/api/admin/local-edit/listings?categoryId=${id}`
      );
      if (res.ok) {
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchCategory();
    fetchListings();
  }, [id]);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (listing) => {
    setEditingId(listing._id);
    setForm({
      title: listing.title || "",
      description: listing.description || "",
      image: listing.image || "",
      imageAlt: listing.imageAlt || "",
      link: listing.link || "",
      order: listing.order ?? 0,
      isActive: listing.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("📤 Uploading image...");
    try {
      const base64 = await fileToBase64(file);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const data = new FormData();
      data.append("file", base64);
      data.append("upload_preset", preset);
      data.append("folder", "eklektikmama/local-edit/listings");

      const res = await fetch(url, { method: "POST", body: data });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Upload failed");
      }
      const result = await res.json();
      setForm((prev) => ({ ...prev, image: result.secure_url }));
      setMessage("✅ Image uploaded");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image || !form.link) {
      setMessage("❌ Title, image and link are required");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        category: id,
        title: form.title,
        description: form.description,
        image: form.image,
        imageAlt: form.imageAlt,
        link: form.link,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/admin/local-edit/listings/${editingId}`
        : `/api/admin/local-edit/listings`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(editingId ? "✅ Listing updated" : "✅ Listing created");
        resetForm();
        fetchListings();
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.message || "Failed to save"}`);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (listingId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(listingId);
    try {
      const res = await fetch(`/api/admin/local-edit/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("✅ Listing deleted");
        fetchListings();
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.message || "Failed to delete"}`);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Listings — {category ? category.title : "Loading..."}
          </h1>
          <p className="text-gray-600">
            Add or update business cards inside this category.
          </p>
          {category && (
            <p className="text-xs text-gray-500 font-mono mt-1">
              /the-local-edit/{category.slug}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/local-edit"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            All Categories
          </Link>
          {category && (
            <Link
              href={`/the-local-edit/${category.slug}`}
              target="_blank"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              View on site
            </Link>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.startsWith("✅")
              ? "bg-green-50 text-green-800"
              : message.startsWith("❌")
              ? "bg-red-50 text-red-800"
              : "bg-blue-50 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {editingId ? "Edit Listing" : "Add a New Listing"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Cuppa & Co."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              External Link *
            </label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Short description shown on the card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Image *
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="text-sm"
            />
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="flex-1 min-w-[260px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="…or paste an image URL"
            />
          </div>
          {uploading && (
            <p className="text-sm text-blue-700 mt-2">Uploading…</p>
          )}
          {form.image && (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image}
                alt="Preview"
                className="w-48 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Alt Text (SEO)
          </label>
          <input
            type="text"
            value={form.imageAlt}
            onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`e.g. "${form.title ? form.title.toLowerCase() : "business name"} Abu Dhabi"`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Descriptive alt text for the listing image. Include location keywords like
            &quot;Abu Dhabi&quot; here for SEO. Leave blank to fall back to the title.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              id="listingActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="h-4 w-4"
            />
            <label htmlFor="listingActive" className="text-sm text-gray-700">
              Active (visible on website)
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
              ? "Update Listing"
              : "Add Listing"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Listings in this Category ({listings.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No listings yet. Add the first one above.
          </div>
        ) : (
          <ul className="divide-y">
            {listings.map((listing) => (
              <li
                key={listing._id}
                className="p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden border">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {listing.title}
                    </h3>
                    {!listing.isActive && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {listing.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                  <a
                    href={listing.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {listing.link}
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(listing)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing._id, listing.title)}
                    disabled={deletingId === listing._id}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    {deletingId === listing._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
