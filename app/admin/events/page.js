"use client";
import { useState } from "react";

export default function AdminEventsPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverImage: "",
    date: "",
    endDate: "",
    price: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("✅ Event created!");
      setForm({
        title: "",
        description: "",
        coverImage: "",
        date: "",
        endDate: "",
        price: "",
        location: "",
      });
    } else {
      alert("❌ Failed to create event");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto pt-32">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border p-2" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
        <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="Cover Image URL" className="w-full border p-2" />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2" required />
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border p-2" />
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border p-2" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full border p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  );
}
