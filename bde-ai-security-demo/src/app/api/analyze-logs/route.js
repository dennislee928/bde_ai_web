import { promises as fs } from "fs";
import axios from "axios";
import { NextResponse } from "next/server";

// Define default file path relative to project root
const defaultLogFilePath = "src/app/api/analyze-logs/test_data/attack.json";
const defaultAiRole =
  process.env.DEFAULT_AI_ROLE ||
  "你是一個資安分析攻擊的專家，幫我分析這些Log，順便整理歸納LOG內的資料，並簡單說明有發生的資安事件，用中文回答我。";
const apiGenerateUrl =
  process.env.API_CHAT_URL || "http://localhost:11434/api/chat"; // Updated to /api/chat

async function processLogs(filePath, aiRole) {
  console.log("ollama-apiURL=" + apiGenerateUrl);
  try {
    console.log("Current working directory:", process.cwd());
    console.log("Attempting to read file at:", filePath);

    const fileContent = await fs.readFile(filePath, "utf8");
    const lines = fileContent.split("\n").slice(0, 100);
    const processedContent = lines
      .map((line) => line.replace(/\r/g, "").replace(/"/g, '\\"'))
      .join("\n");

    // 改用 messages 格式，適應 /api/chat endpoint
    const messages = [
      { role: "system", content: aiRole }, // system 角色設定 AI 的角色
      { role: "user", content: `以下是Log內容：\n${processedContent}` }, // user 角色提供 log 內容
    ];

    const response = await axios.post(
      apiGenerateUrl,
      {
        model: "llama3.2:1b",
        messages: messages, // 改為 messages 格式
        stream: true,
      },
      {
        responseType: "stream",
      }
    );

    // Buffer to hold all response chunks
    let fullResponse = "";

    // Return a promise that resolves with the complete response
    return new Promise((resolve, reject) => {
      response.data.on("data", (chunk) => {
        const chunkStr = chunk.toString();
        chunkStr.split("\n").forEach((line) => {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              if (json.message && json.message.content) {
                fullResponse += json.message.content; // /api/chat 的回應格式中，內容在 message.content
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        });
      });

      response.data.on("end", () => {
        // Once the stream ends, create an SSE-formatted stream with the full response
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(`data: ${fullResponse}\n\n`);
            controller.close();
          },
        });
        resolve(stream);
      });

      response.data.on("error", (err) => {
        console.error("Stream error:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("API 請求失敗:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    const { filePath, aiRole } = await req.json();
    const actualFilePath = filePath || defaultLogFilePath;
    const actualAiRole = aiRole || defaultAiRole;

    if (typeof actualFilePath !== "string" || actualFilePath.trim() === "") {
      return NextResponse.json({ message: "檔案路徑無效" }, { status: 400 });
    }
    if (typeof actualAiRole !== "string" || actualAiRole.trim() === "") {
      return NextResponse.json({ message: "AI 角色設定無效" }, { status: 400 });
    }

    const analysisResult = await processLogs(actualFilePath, actualAiRole);

    return new Response(analysisResult, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("分析失敗:", error);
    let errorMessage = "分析失敗";
    if (error.code === "ENOENT") {
      errorMessage = "找不到檔案";
    } else if (error.response?.status === 400) {
      errorMessage = "API 請求錯誤: 400";
    } else if (error.response?.status === 500) {
      errorMessage = "API 伺服器錯誤: 500";
    } else {
      errorMessage = error.message || "未知錯誤";
    }
    return NextResponse.json(
      { message: `分析失敗: ${errorMessage}`, error: error.message },
      { status: 500 }
    );
  }
}

console.log("ollama-apiURL=" + apiGenerateUrl);
