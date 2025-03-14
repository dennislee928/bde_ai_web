import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// 定義一個全域變數來儲存資料
let cachedData: object | null = null;
let lastFetchTime: number | null = null;

async function fetchData() {
  try {
    const directoryPath = path.join(
      process.cwd(),
      "src/app/api/get-twister5-si-data/waf_second_parameter"
    );
    let files = fs.readdirSync(directoryPath);

    files = files.filter((file: string) => file.endsWith(".json"));

    if (files.length === 0) {
      console.warn("No JSON files found in the directory.");
      return null;
    }

    // 隨機選擇一個檔案
    const randomIndex = Math.floor(Math.random() * files.length);
    const selectedFile = files[randomIndex];
    const filePath = path.join(directoryPath, selectedFile);
    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    return data;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  const tenSeconds = 10 * 1000; // 修改為 10 秒

  // 檢查是否需要重新獲取資料
  if (!cachedData || !lastFetchTime || now - lastFetchTime > tenSeconds) {
    cachedData = await fetchData();
    lastFetchTime = now;
  }

  if (!cachedData) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }

  return NextResponse.json(cachedData);
}
