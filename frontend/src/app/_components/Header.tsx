// components/Header.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Header = () => {
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/updates", label: "Updates" },
  ];

  return (
    <header className="p-6 px-10 flex justify-between items-center shadow-md fixed top-0 w-full z-10 bg-white backdrop-blur-md bg-opacity-75">
      <div className="flex gap-12 items-center">
        <Link href="/">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            DisasterPulse
          </h1>
        </Link>
        <nav className="hidden md:flex gap-10">
          <ul className="flex gap-10">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`hover:text-primary font-medium text-sm cursor-pointer ${
                    pathname === item.href ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex gap-2">
        <SignedOut>
          {/* <Link href="/sign-in">
            <Button variant="outline">Login for PulseInsight AI</Button>
          </Link> */}
        </SignedOut>
        <SignedIn>
          <Button>
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            PulseInsight AI
          </Button>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
