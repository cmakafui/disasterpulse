"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCirclePlus } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Header = () => {
  const pathname = usePathname();
  const navItems = [{ href: "/", label: "Disasters" }];

  return (
    <header className="p-6 px-10 flex justify-between items-center shadow-sm fixed top-0 w-full z-10 bg-white">
      <div className="flex gap-12 items-center">
        <Link href="/">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            Disasterpulse
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
        <Button>
          <MessageCirclePlus className="mr-2 h-4 w-4" />
          Q/A Chat
        </Button>
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="outline">Login</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
