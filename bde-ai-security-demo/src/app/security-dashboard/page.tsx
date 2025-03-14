/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import VisualizationComponent from "../components/ui/chart/VisualizationComponent";
import ChartComponent from "../components/ui/chart/chartjs";
import Navbar from "../components/ui/navbar";

interface Message {
  author: string;
  content: string;
}

interface SecurityLog {
  ip: string;
  country: string;
  method: string;
  path: string;
  timestamp: string;
  userAgent: string;
  status: number;
}

interface ApiResponse {
  requests: SecurityLog[];
  needsUpdate: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
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

  const showMessage = useCallback((author: string, content: string) => {
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
  }, []);

  const get_twister5_data = useCallback(async () => {
    try {
      setIsLoading(true);
      showMessage("原始資料", "載入中...");

      const response = await fetch("/api/get-waf-data"); // 呼叫 API 路由
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log("Received data from API:", data);

      const requests = Array.isArray(data)
        ? data
        : Array.isArray(data.requests)
        ? data.requests
        : null;

      if (requests && requests.length > 0) {
        setSecurityLogs(requests);
        showMessage("原始資料", "載入成功");
      } else {
        throw new Error("獲取資安日誌失敗: requests 屬性無效或為空");
      }
    } catch (error) {
      console.error("get_twister5_data 錯誤:", error);
      showMessage(
        "錯誤",
        error instanceof Error ? error.message : "發生未知錯誤"
      );
      setSecurityLogs([]);
    } finally {
      setIsLoading(false);
      setButtonStates((prevState) => ({
        ...prevState,
        attack: { ...prevState.attack, loading: false, disabled: false },
        marketing: { ...prevState.marketing, loading: false, disabled: false },
      }));
    }
  }, [showMessage]);

  useEffect(() => {
    get_twister5_data(); // 初始呼叫
    const intervalId = setInterval(() => {
      get_twister5_data(); // 每30秒呼叫
    }, 60000);
    return () => clearInterval(intervalId); // 清除 interval，避免記憶體洩漏
  }, [get_twister5_data]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 place-items-center">
        {" "}
        {/* 修改這裡 */}
        {securityLogs && <VisualizationComponent jsonData={securityLogs} />}
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1  gap-8 text-black">
          <div>
          
            <h1 className="text-5xl font-bold mb-4"> Twister5-BDE.AI: security dashboard-WAF資料視覺化。</h1>
         
     
            <br/>
            <p className="mb-5 ">模型含義及快速解讀方法：</p>
            <p className="mb-5"> - 點： 程式碼使用 PointsVisualization 組件來渲染點。 這些點代表了安全日誌中的每個客戶端請求。</p>
            <p className="mb-5"> - 點的位置： 點的位置是根據 IP 地址的經緯度計算的。 </p>
            <p className="mb-5">   - 程式碼使用經緯度（country code），並被放置在球體的表面上，模擬地球上的位置。</p>
            <p className="mb-5"> - 點的顏色： 點的顏色是根據請求的狀態碼 (request.status) 決定的。 例如：</p>
            <br/>
            <p className="mb-3 text-red"> 狀態碼 >= 500：紅色（伺服器錯誤）</p>
            <p className="mb-3 text-orange"> 狀態碼 >= 400：橙色（客戶端錯誤）</p>
            <p className="mb-3 text-yellow"> 狀態碼 >= 300：黃色（重定向）</p>
            <p className="mb-3 text-green"> 狀態碼 >= 200：綠色（成功）</p>
            <p className="mb-3 text-gray"> 其他：白色（資訊或未知）</p>
          </div>
          <Button
            onClick={() => get_twister5_data()}
            disabled={buttonStates.attack.disabled}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? "ANALYZING..." : "[ raw data fetch ]"}
          </Button>
          <br />
          <br />
          <div></div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"></div>
          </div>
        </div>
      </main>
     
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 place-items-center bg-white">
      <div> <ChartComponent jsonData={securityLogs} chartType="country" /></div>
      <div>
        <ChartComponent jsonData={securityLogs} chartType="status" /></div>
      
        <div>  <ChartComponent jsonData={securityLogs} chartType="method" /></div>
   
        <div> <ChartComponent jsonData={securityLogs} chartType="hourly" /></div>
  
       
      </div>
      <div className="r bg-white">
        <p>.</p>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
       
        <br />
        <p>.</p>
       
        <br />
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
