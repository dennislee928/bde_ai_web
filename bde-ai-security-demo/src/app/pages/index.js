/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CyberDefault() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeLogs = async (type) => {
    setIsLoading(true);
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setMessages([
      ...messages,
      { type, content: `Analysis for ${type} completed.` },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b border-green-500 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-2xl font-bold">CYBERDEFAULT</div>
          <nav>
            <ul className="flex space-x-6">
              {["SIGN IN", "WALLET CONNECT", "OPENSEA NFT", "MENU"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-green-300 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              EXPAND
              <br />
              YOUR REALITY
              <br />
              &<br />
              ENGAGE IN
              <br />
              CREATING A<br />
              UNIVERSE
            </h1>
            <p className="mb-8">
              Explore CyberDefault — a cutting edge solution for digital design
              challenges, seamlessly integrating unique NFT artworks with
              cybersecurity-inspired design.
            </p>
            <Button
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
              onClick={() => analyzeLogs("security")}
              disabled={isLoading}
            >
              {isLoading ? "ANALYZING..." : "[ S1.2 34S ]"}
            </Button>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=400"
              alt="Cyber VR Headset"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"></div>
          </div>
        </div>

        <Card className="mt-8 bg-black border border-green-500">
          <CardHeader>
            <CardTitle className="text-green-400">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.map((message, index) => (
              <p key={index} className="mb-2">
                {message.type}: {message.content}
              </p>
            ))}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-green-500 py-4 mt-8 text-center text-green-400">
        <p>© 2025 CYBERDEFAULT. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
