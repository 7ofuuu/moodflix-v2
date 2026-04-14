"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-7">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MoodFlix</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4">
          <Link
            href="/"
            className={`relative transition-colors hover:text-primary text-foreground/60 [&.active]:font-semibold [&.active]:underline [&.active]:underline-offset-8 [&.active]:decoration-2 [&.active]:text-primary ${
              pathname === "/" ? "active" : ""
            }`}
          >
            Home
          </Link>

          <Link
            href="/popular"
            className={`relative transition-colors hover:text-primary text-foreground/60 [&.active]:font-semibold [&.active]:underline [&.active]:underline-offset-8 [&.active]:decoration-2 [&.active]:text-primary ${
              pathname === "/popular" ? "active" : ""
            }`}
          >
            Popular
          </Link>

          <Link
            href="/top-rated"
            className={`relative transition-colors hover:text-primary text-foreground/60 [&.active]:font-semibold [&.active]:underline [&.active]:underline-offset-8 [&.active]:decoration-2 [&.active]:text-primary ${
              pathname === "/top-rated" ? "active" : ""
            }`}
          >
            Top Rated
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none" aria-expanded="false">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild className="py-4.5">
            <Link href="/quiz">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" onClick={toggleMenu} className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${pathname === "/" ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
              Home
            </Link>
            <Link
              href="/popular"
              onClick={toggleMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${pathname === "/popular" ? "bg-gray-900 text-white" : "text-black hover:bg-gray-700 hover:text-white"}`}
            >
              Popular
            </Link>
            <Link
              href="/top-rated"
              onClick={toggleMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${pathname === "/top-rated" ? "bg-gray-900 text-white" : "text-black hover:bg-gray-700 hover:text-white"}`}
            >
              Top Rated
            </Link>
            <Button asChild className="w-full mt-2">
              <Link href="/quiz" onClick={toggleMenu}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
