import React, { useState, useEffect } from "react";
import Head from "next/head";
import MessageBoard from "../components/MessageBoard";
import styles from "../styles/globals.css"; // 導入全域樣式

export default function Home() {
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

      <header>
        <div className="nav-bar">
          <div className="logo">AI 問題服務</div>
          <div className="menu">
            <a href="#">首頁</a>
            <a href="#">關於我們</a>
            <a href="#">服務</a>
            <a href="#">聯絡我們</a>
          </div>
          <div className="auth-buttons">
            <a href="#">登入</a>
            <a href="#">註冊</a>
          </div>
        </div>
        <h1>AI 問題服務</h1>
        <p>請點選按鈕以查看分析資訊。</p>
      </header>

      <div className="container">
        <div className="left-column">
          <h2>AI 回覆</h2>
          <MessageBoard messages={messages} />
        </div>

        <div className="right-column">
          <h2>事件分析</h2>
          <div className="button-section">
            <button
              onClick={() => analyzeLogs("attack")}
              disabled={buttonStates.attack.disabled}
            >
              {buttonStates.attack.loading
                ? "載入中..."
                : buttonStates.attack.originalText}
            </button>
            <button
              onClick={() => analyzeLogs("marketing")}
              disabled={buttonStates.marketing.disabled}
            >
              {buttonStates.marketing.loading
                ? "載入中..."
                : buttonStates.marketing.originalText}
            </button>
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; 2025 AI 問題服務。版權所有。</p>
      </footer>
    </>
  );
}
