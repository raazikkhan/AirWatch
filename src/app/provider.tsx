"use client";

import MobileNavbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";

export default function Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobileNavbarVisible = pathname !== "/" && pathname !== "/onboarding";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <div className={cn(isMobileNavbarVisible && "mb-16")}>{children}</div>
      {isMobileNavbarVisible ? <MobileNavbar /> : null}
    </ThemeProvider>
  );
}
