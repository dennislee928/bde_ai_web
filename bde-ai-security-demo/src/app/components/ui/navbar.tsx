//typescript:bde-ai-security-demo/src/app/components/ui/navbar.tsx
import React from "react";
import Link from "next/link";

function Navbar() {
  return (
    <header className="border-b border-green-500 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="text-2xl text-black font-bold">Twister5-BDE.AI</div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className="hover:text-green-300 transition-colors text-black"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/security-dashboard"
                className="hover:text-green-300 transition-colors text-black"
              >
                Security Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/military"
                className="hover:text-green-300 transition-colors text-black"
              >
                Military
              </Link>
            </li>
            <li>
              <Link
                href="/finance-commercial"
                className="hover:text-green-300 transition-colors text-black"
              >
                Finance & Commercial
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
