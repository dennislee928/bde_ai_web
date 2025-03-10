const fs = require("fs").promises;
const axios = require("axios");

const defaultLogFilePath = "./test_data/attack.json";
const defaultAiRole =
  "你是一個資安分析攻擊的專家，幫我分析這些Log，順便整理歸納LOG內的資料，並簡單說明有發生的資安事件，用中文回答我。";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { filePath, aiRole } = req.body;
      const actualFilePath = filePath || defaultLogFilePath;
      const actualAiRole = aiRole || defaultAiRole;

      const fileContent = await fs.readFile(actualFilePath, "utf8");
      const lines = fileContent.split("\n").slice(0, 100);
      const processedContent = lines
        .map((line) => line.replace(/\r/g, "").replace(/"/g, '\\"'))
        .join("\n");

      const response = await axios.post("http://localhost:11434/api/chat", {
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
      });

      res.status(200).json({
        message: "日誌分析完成",
        analysis: response.data,
      });
    } catch (error) {
      console.error("分析失敗:", error); // 記錄錯誤到伺服器端
      res.status(500).json({ message: "分析失敗", error: error.message });
    }
  } else {
    res.status(405).json({ message: "方法不允許" }); // 處理非 POST 請求
  }
}
