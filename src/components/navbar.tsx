"use client";

import { cn } from "@/lib/utils";
import { Home, Leaf, Map, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Map",
      href: "/map",
      icon: Map,
    },
    {
      name: "Actions",
      href: "/actions",
      icon: Leaf,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-t from-transparent to-gray-200/50" />

      <div className="border-t border-gray-200 backdrop-blur-lg bg-white/90">
        <div className="container mx-auto max-w-md py-2">
          <nav className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="w-full">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center py-2 transition-all duration-200 ease-in-out",
                      isActive
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <item.icon
                        className={cn(
                          "h-6 w-6 transition-all",
                          isActive && "scale-110"
                        )}
                      />
                      {isActive && (
                        <span className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-subtle" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1 font-medium transition-all",
                        isActive && "scale-105"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
