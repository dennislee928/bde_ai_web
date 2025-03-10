/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import MessageBoard from "../components/MessageBoard";
import "../globals.css"; // 確保路徑正確

export default function Index() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <>
      <Head>
        <title>AI 問題服務</title>
        <meta name="description" content="AI 問題服務" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-green-600 py-4 shadow-md w-full">
        <div>
          <div className="container mx-auto px-4 flex items-center justify-between ">
            <div className="text-black text-2xl font-bold">AI 問題服務</div>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <a href="#" className="text-black hover:text-gray-200">
                    首頁
                  </a>
                </li>
                <li>
                  <a href="#" className="text-black hover:text-gray-200">
                    關於我們
                  </a>
                </li>
                <li>
                  <a href="#" className="text-black hover:text-gray-200">
                    服務
                  </a>
                </li>
                <li>
                  <a href="#" className="text-black hover:text-gray-200">
                    聯絡我們
                  </a>
                </li>
              </ul>
            </nav>
            <div className="auth-buttons space-x-4">
              <a
                href="#"
                className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100"
              >
                登入
              </a>
              <a
                href="#"
                className="bg-white text-green-500 px-4 py-2 rounded hover:bg-gray-100"
              >
                註冊
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            AI 問題服務:
          </h1>
          <p className="text-gray-700 text-center mb-8">
            請點選按鈕以查看分析資訊。
          </p>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              AI 回覆
            </h2>
            <MessageBoard messages={messages} />
          </div>
        </div>

        <br />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              事件分析
            </h2>
            <div className="button-section flex flex-col space-y-4">
              <button
                onClick={() => analyzeLogs("attack")}
                disabled={buttonStates.attack.disabled}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {buttonStates.attack.loading
                  ? "載入中..."
                  : buttonStates.attack.originalText}
              </button>
              <button
                onClick={() => analyzeLogs("marketing")}
                disabled={buttonStates.marketing.disabled}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {buttonStates.marketing.loading
                  ? "載入中..."
                  : buttonStates.marketing.originalText}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-4 mt-8 text-center text-gray-600">
        <p>&copy; 2025 AI 問題服務。版權所有。</p>
      </footer>
    </>
  );
}
