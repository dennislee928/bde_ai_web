/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import MessageBoard from "../components/MessageBoard";

export default function CyberDefault() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //version 1 js script

  const [buttonStates, setButtonStates] = useState({
    attack: {
      loading: false,
      disabled: false,
      originalText: "檢查、分析惡意攻擊",
    },
    marketing: {
      loading: false,
      disabled: false,
      originalText: "分析網站商品點擊率",
    },
  });

  // 顯示訊息到留言板
  const showMessage = (author, content) => {
    const currentTime = new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setMessages((prevMessages) => [
      ...prevMessages,
      { author: `${author} (${currentTime})`, content },
    ]);
  };

  // 呼叫 API 並處理 Loading 效果
  const analyzeLogs = async (type) => {
    setButtonStates((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        loading: true,
        disabled: true,
        originalText: prevState[type].originalText,
      },
    }));

    showMessage("系統", "載入中..."); // 顯示載入中訊息

    try {
      const filePath =
        type === "attack"
          ? "./test_data/attack.json"
          : "./test_data/marketing.json";
      const aiRole =
        type === "attack"
          ? "你是一個資安分析攻擊的專家，幫我分析這些Log，順便整理歸納LOG內的資料，並簡單說明有發生的資安事件，用中文回答我。"
          : "你是一個網頁產品分析專家，幫我分析這些Log，給我一些銷售建議，用中文回答我。";

      const response = await fetch("/api/analyze-logs", {
        // 使用相對路徑
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath, aiRole }),
      });

      const data = await response.json();

      if (response.ok) {
        const analysis = data.analysis?.message || "分析完成";
        showMessage(
          type === "attack" ? "惡意攻擊分析" : "網站點擊率分析",
          analysis.content
        );
      } else {
        showMessage("錯誤", data.message || "分析失敗");
      }
    } catch (error) {
      showMessage("錯誤", `無法連接到伺服器: ${error.message}`);
    } finally {
      setButtonStates((prevState) => ({
        ...prevState,
        [type]: { ...prevState[type], loading: false, disabled: false },
      }));
    }
  };

  //

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b border-green-500 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-2xl text-black font-bold">Twister5-BDE.AI</div>
          <nav>
            <ul className="flex space-x-6">
              {["SIGN IN", "MENU"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-green-300 transition-colors text-black"
                  >
                    {item}
                  </a>
                </li>
              ))}
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
              onClick={() => analyzeLogs("marketing")}
              disabled={buttonStates.marketing.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isLoading ? "ANALYZING..." : "[ 啟動 ollama S1.2 34S 商業分析 ]"}
            </Button>
            <br />
            <br />
            <Button
              onClick={() => analyzeLogs("attack")}
              disabled={buttonStates.attack.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isLoading ? "ANALYZING..." : "[ 啟動 ollama S1.2 34S 資安分析 ]"}
            </Button>
          </div>
          <div className="relative">
            <img
              src="/assets/images/cp-1.jpg"
              alt="Cyber VR Headset"
              className="w-full h-auto object-cover"
              style={{
                transform: "scale(2) translateY(60px) translateX(-50px)",
                zIndex: 0,
                position: "relative",
                clipPath: "inset(0 0 0 150px)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"></div>
          </div>
        </div>
      </main>
      <div className="grid grid-cols-2 gap-4">
        <Card className="mt-2 bg-black border border-green-500">
          <CardHeader>
            <CardTitle className="text-green-400">Analysis Results</CardTitle>
            <MessageBoard messages={messages} />
          </CardHeader>
          <CardContent>
            {messages.map((message, index) => (
              <p key={index} className="mb-2">
                {message.type}: {message.content}
              </p>
            ))}
          </CardContent>
        </Card>

        <div>
          <br />
          <h1 className="text-5xl font-bold mb-4">
            拓展
            <br />
            你的
            <br />
            網路安全
            <br />
            到<br />
            無邊界的人工智慧疆域
          </h1>
          <p className="mb-8">
            盡情享受 Twister5BDE.AI — 先進的數位設計解決方案， cloudflare
            和ollama based 的網路安全設計系統。
          </p>
          <Button
            onClick={() => analyzeLogs("marketing")}
            disabled={buttonStates.marketing.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? "ANALYZING..." : "[ 啟動 ollama S1.2 34S 商業分析 ]"}
          </Button>
          <br />
          <br />
          <Button
            onClick={() => analyzeLogs("attack")}
            disabled={buttonStates.attack.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? "ANALYZING..." : "[ 啟動 ollama S1.2 34S 資安分析 ]"}
          </Button>
        </div>
      </div>
      <footer className="border-t border-green-500 py-4 mt-8 text-center text-green-400">
        <p>© 2025 CYBERDEFAULT. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
