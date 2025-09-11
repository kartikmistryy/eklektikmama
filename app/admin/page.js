"use client";
import Link from 'next/link';

export default function AdminPage() {
  const adminFeatures = [
    {
      title: "Events Management",
      description: "Create, edit, and manage events",
      href: "/admin/events",
      icon: "📅",
      color: "bg-blue-500"
    },
    {
      title: "Highlights",
      description: "Create and manage event highlights",
      href: "/admin/highlights",
      icon: "⭐",
      color: "bg-yellow-500"
    },
    {
      title: "Bookings",
      description: "View and manage event bookings",
      href: "/admin/bookings",
      icon: "🎫",
      color: "bg-green-500"
    },
    {
      title: "Test Email",
      description: "Test email functionality",
      href: "/admin/test-email",
      icon: "📧",
      color: "bg-purple-500"
    },
    {
      title: "Test Newsletter",
      description: "Test newsletter signup",
      href: "/admin/test-newsletter",
      icon: "📰",
      color: "bg-orange-500"
    },
    {
      title: "Test Webhook",
      description: "Test webhook functionality",
      href: "/admin/test-webhook",
      icon: "🔗",
      color: "bg-red-500"
    },
    {
      title: "Debug Panel",
      description: "Test all API routes and debug issues",
      href: "/admin/debug-panel",
      icon: "🔍",
      color: "bg-indigo-500"
    },
    {
      title: "Delete Panel",
      description: "Delete events and highlights",
      href: "/admin/delete-panel",
      icon: "🗑️",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your website content and functionality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`${feature.color} text-white p-3 rounded-lg text-2xl`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {feature.description}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">📅</div>
              <div className="text-2xl font-bold text-gray-900">Events</div>
              <div className="text-gray-600">Manage your events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">🎫</div>
              <div className="text-2xl font-bold text-gray-900">Bookings</div>
              <div className="text-gray-600">Track reservations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">📧</div>
              <div className="text-2xl font-bold text-gray-900">Communication</div>
              <div className="text-gray-600">Email & newsletters</div>
            </div>
          </div>
        </div>

        {/* Environment Variables Status */}
        {/* <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <p className="font-medium">⚠️ Environment Variables Required</p>
              <p className="text-sm mt-1">
                Make sure to set <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_ADMIN_USERNAME</code> and <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> in your environment variables for admin access.
              </p>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
