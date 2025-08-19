"use client";
import { useState } from "react";

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverImage: "",
    date: "",
    price: "",
    location: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <input type="text" placeholder="Event Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input type="url" placeholder="Cover Image URL"
        onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
      <input type="datetime-local"
        onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <input type="number" placeholder="Price"
        onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <input type="text" placeholder="Location"
        onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
        Create Event
      </button>
    </form>
  );
}
