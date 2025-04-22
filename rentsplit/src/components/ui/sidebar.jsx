'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  Activity,
  UserCircle,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Households", icon: Home, href: "/households" },
  { label: "Activity", icon: Activity, href: "/activity" },
];

const Sidebar = ({ user }) => {
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r h-screen w-64 fixed flex flex-col justify-between">
      <div>
        {/* Profile Section */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={user?.image || "/default-avatar.png"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{user?.name || "User"}</div>
            <div className="text-xs text-gray-500">View Profile</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 ${
                  isActive ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-700"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t text-sm text-gray-600">
        &copy; 2025 RentSplit
      </div>
    </aside>
  );
};

export default Sidebar;
