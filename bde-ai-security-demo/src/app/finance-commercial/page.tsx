/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import MessageBoard from "../components/MessageBoard";
import Navbar from "../components/ui/navbar";
//

//fetch_twse_SecurityLogs
// Define the message type
interface Message {
  author: string;
  content: string;
}
// 定義資料的介面
interface SecurityLog {
  ip: string;
  country: string;
  method: string;
  path: string;
  timestamp: string;
  userAgent: string;
  status: number;
}
// 定義 API 回應的介面
interface ApiResponse {
  requests: SecurityLog[];
  needsUpdate: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]); // Fixed type annotation
  const [isLoading, setIsLoading] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]); // 新增狀態變數，儲存安全日誌
  //
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
  const showMessage = (author: string, content: string) => {
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
  const analyzeLogs = async (type: "attack" | "marketing") => {
    setButtonStates((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        loading: true,
        disabled: true,
        originalText: prevState[type].originalText,
      },
    }));

    showMessage("系統", "載入中...");

    try {
      const filePath =
        type === "attack"
          ? "src/app/api/analyze-logs/test_data/attack.json" // Updated path
          : "src/app/api/analyze-logs/test_data/marketing.json"; // Updated path
      const aiRole =
        type === "attack"
          ? "你是一個資安分析攻擊的專家，幫我分析這些Log，順便整理歸納LOG內的資料，並簡單說明有發生的資安事件，用中文回答我。"
          : "你是一個網頁產品分析專家，幫我分析這些Log，給我一些銷售建議，用中文回答我。";

      const response = await fetch("/api/analyze-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath, aiRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "分析失敗");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = "";
      if (!reader) {
        console.error("response.body is null");
        return;
      }
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        result += chunk;
        showMessage(
          type === "attack" ? "惡意攻擊分析" : "網站點擊率分析",
          chunk
        );
      }

      showMessage(
        type === "attack" ? "惡意攻擊分析" : "網站點擊率分析",
        "分析完成"
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        showMessage("錯誤", `無法連接到伺服器: ${error.message}`);
      } else {
        showMessage("錯誤", "發生未知錯誤");
      }
    } finally {
      setButtonStates((prevState) => ({
        ...prevState,
        [type]: {
          ...prevState[type],
          loading: false, // Fixed: Reset to false
          disabled: false, // Fixed: Reset to false
          originalText: prevState[type].originalText,
        },
      }));
    }
  }; //
  // 使用 useCallback 改善 get_twister5_data 函數
  const get_twse_data = useCallback(async () => {
    setIsLoading(true);
    showMessage("原始資料", "載入中...");

    try {
      const response = await fetch("/api/get-twse-si-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "獲取資料失敗");
      }

      const data: ApiResponse = await response.json(); // 使用 ApiResponse 介面
      console.log("Received data from /api/get-twister5-si-data:", data);

      // 假設 data 包含 requests 屬性
      if (data && data.requests && Array.isArray(data.requests)) {
        setSecurityLogs(data.requests); // 將資料儲存在 securityLogs 狀態中
        showMessage("原始資料", "載入成功");
      } else {
        // 處理 data 或 data.requests 為 null 或 undefined 的情況
        setSecurityLogs([]); // 清空 securityLogs
        showMessage("錯誤", "獲取資安日誌失敗或資料格式不正確");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showMessage("錯誤", `無法連接到raw data: ${error.message}`);
      } else {
        showMessage("錯誤", "發生未知錯誤");
      }
    } finally {
      setIsLoading(false);
      setButtonStates((prevState) => ({
        ...prevState,
        attack: {
          ...prevState.attack,
          loading: false,
          disabled: false,
        },
        marketing: {
          ...prevState.marketing,
          loading: false,
          disabled: false,
        },
      }));
    }
  }, []); // 空的依賴陣列表示 get_twister5_data 函數不依賴任何外部變數
  //emega
  // 使用 useCallback 改善 get_twister5_data 函數
  const get_emega_data = useCallback(async () => {
    setIsLoading(true);
    showMessage("原始資料", "載入中...");

    try {
      const response = await fetch("/api/get-emega-si-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "獲取資料失敗");
      }

      const data: ApiResponse = await response.json(); // 使用 ApiResponse 介面
      console.log("Received data from /api/get-twister5-si-data:", data);

      // 假設 data 包含 requests 屬性
      if (data && data.requests && Array.isArray(data.requests)) {
        setSecurityLogs(data.requests); // 將資料儲存在 securityLogs 狀態中
        showMessage("原始資料", "載入成功");
      } else {
        // 處理 data 或 data.requests 為 null 或 undefined 的情況
        setSecurityLogs([]); // 清空 securityLogs
        showMessage("錯誤", "獲取資安日誌失敗或資料格式不正確");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        showMessage("錯誤", `無法連接到raw data: ${error.message}`);
      } else {
        showMessage("錯誤", "發生未知錯誤");
      }
    } finally {
      setIsLoading(false);
      setButtonStates((prevState) => ({
        ...prevState,
        attack: {
          ...prevState.attack,
          loading: false,
          disabled: false,
        },
        marketing: {
          ...prevState.marketing,
          loading: false,
          disabled: false,
        },
      }));
    }
  }, []); // 空的依賴陣列表示 get_twister5_data 函數不依賴任何外部變數

  //
  useEffect(() => {
    get_twse_data();
  }, []);
  //

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b border-green-500 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-2xl text-black font-bold">
            Twister5-BDE.AI:finance and commerical
          </div>
        </div>
      </header>
      <Navbar />

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
              Explore CyberDefault — a cutting edge solution for digital
              security challenges, seamlessly integrating main stream LLM Models
              with cybersecurity-inspired cloudflare architecture design, only
              issued by Twister5.com.tw.
            </p>

            <Button
              // onClick={() => analyzeLogs("attack")}
              disabled={buttonStates.marketing.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {buttonStates.marketing.loading
                ? "ANALYZING..."
                : "[ attack-Demo-test:啟動 ollama S1.2 34S 分析 ]"}
            </Button>
            <br />
            <br />
            <Button
              onClick={() => get_twse_data()}
              disabled={buttonStates.attack.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isLoading ? "ANALYZING..." : "[ twse raw data fetch ]"}
            </Button>
            <br />
            <br />
            <Button
              onClick={() => get_emega_data()}
              disabled={buttonStates.attack.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isLoading ? "ANALYZING..." : "[ emega raw data fetch ]"}
            </Button>
            <br />
            <br />
            <Button
              //  onClick={() => analyzeLogs("attack")}
              disabled={buttonStates.attack.disabled}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {buttonStates.attack.loading ? "ANALYZING..." : "[ 其他情境 ]"}
            </Button>
          </div>
          <div className="relative">
            <img
              src="/assets/images/cp-1.jpg"
              alt="Cyber VR Headset"
              className="w-full h-auto object-cover cyber-vr-headset"
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
            <CardContent>
              <h2>證交所 cloudflare 資料表</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-green-400">
                  <thead className="text-xs uppercase bg-green-900/20">
                    <tr>
                      <th className="px-2 py-2">IP</th>
                      <th className="px-2 py-2">國家</th>
                      <th className="px-2 py-2">方法</th>
                      <th className="px-2 py-2">路徑</th>
                      <th className="px-2 py-2">時間</th>
                      <th className="px-2 py-2">狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log, index) => (
                      <tr key={index} className="border-b border-green-500/20">
                        <td className="px-2 py-2">{log.ip}</td>
                        <td className="px-2 py-2">{log.country}</td>
                        <td className="px-2 py-2">{log.method}</td>
                        <td className="px-2 py-2">{log.path}</td>
                        <td className="px-2 py-2">
                          {new Date(log.timestamp).toLocaleString("zh-TW")}
                        </td>
                        <td className="px-2 py-2">{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
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
            盡情享受 Twister5BDE.AI — 先進的數位設計解決方案，cloudflare
            和ollama based 的網路安全設計系統。
          </p>
          <Button
            onClick={() => analyzeLogs("marketing")}
            disabled={buttonStates.marketing.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {buttonStates.marketing.loading
              ? "ANALYZING..."
              : "[ 啟動 ollama S1.2 34S 商業分析 ]"}
          </Button>
          <br />
          <br />
          <Button
            onClick={() => analyzeLogs("attack")}
            disabled={buttonStates.attack.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {buttonStates.attack.loading
              ? "ANALYZING..."
              : "[ 啟動 ollama S1.2 34S 資安分析 ]"}
          </Button>
          <br />
          <br />
          <Button
            onClick={() => analyzeLogs("attack")}
            disabled={buttonStates.attack.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {buttonStates.attack.loading ? "ANALYZING..." : "[ 其他情境 ]"}
          </Button>
        </div>
      </div>
      <footer className="border-t border-green-500 py-4 mt-8 text-center text-green-400">
        <p>
          © 2025 Twister5.com.tw. ALL RIGHTS RESERVED. contact:
          pcleegood@gmail.com / dennis.lee@twister5.com.tw
        </p>
      </footer>
    </div>
  );
}
