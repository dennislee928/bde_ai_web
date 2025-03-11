/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs").promises;
const axios = require("axios");

const defaultLogFilePath =
  ".bde-ai-security-demo/src/app/pages/api/test_data/attack.json";
const defaultAiRole =
  "你是一個資安分析攻擊的專家，幫我分析這些Log，順便整理歸納LOG內的資料，並簡單說明有發生的資安事件，用中文回答我。";

export default async function handler(req, res) {
  console.log("收到請求:", req.method, req.url); // 記錄收到的請求
  if (req.method === "POST") {
    console.log("是 POST 請求");
    try {
      console.log("嘗試解析請求體...");
      const { filePath, aiRole } = req.body;
      console.log("請求體解析成功:", { filePath, aiRole });
      const actualFilePath = filePath || defaultLogFilePath;
      const actualAiRole = aiRole || defaultAiRole;
      console.log("使用檔案路徑:", actualFilePath);
      console.log("使用 AI 角色:", actualAiRole);

      console.log("嘗試讀取檔案:", actualFilePath);
      const fileContent = await fs.readFile(actualFilePath, "utf8");
      console.log("檔案讀取成功，前 100 行...");
      const lines = fileContent.split("\n").slice(0, 100);
      console.log("分割後的行數:", lines.length);
      const processedContent = lines
        .map((line) => {
          const replacedLine = line.replace(/\r/g, "").replace(/"/g, '\\"');
          return replacedLine;
        })
        .join("\n");
      console.log(
        "處理後的內容，前 100 字元:",
        processedContent.substring(0, 100)
      );

      console.log("嘗試呼叫外部 API: http://localhost:11434/api/chat");
      const axiosConfig = {
        method: "post",
        url: "http://localhost:11434/api/chat",
        data: {
          model: "llama3.2:1b",
          messages: [
            {
              role: "system",
              content: `'${actualAiRole}'`,
            },
            {
              role: "user",
              content: `'${processedContent}'`,
            },
          ],
          stream: false,
        },
        headers: {
          "Content-Type": "application/json",
        },
      };
      console.log("axios config:", axiosConfig);
      const response = await axios(axiosConfig);
      console.log("外部 API 呼叫成功，狀態碼:", response.status);
      console.log("外部 API 回應資料:", response.data);

      res.status(200).json({
        message: "日誌分析完成",
        analysis: response.data,
      });
    } catch (error) {
      console.error("分析失敗:", error); // 記錄錯誤到伺服器端
      console.error("錯誤類型:", typeof error);
      console.error("錯誤名稱:", error.name);
      console.error("錯誤訊息:", error.message);
      console.error("錯誤堆疊:", error.stack);
      console.error("axios error response:", error.response?.data); // 記錄 axios 的回應
      res.status(500).json({
        message: "分析失敗",
        error: error.message,
        axiosError: error.response?.data,
      });
    }
  } else {
    console.log("不是 POST 請求，返回 405");
    res.status(405).json({ message: "方法不允許" }); // 處理非 POST 請求
    res.status(404).json({ message: "檢查ollama" }); // 處理ollama 請求
  }
}
