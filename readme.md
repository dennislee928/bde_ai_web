## project folder:bde-ai-security-demo

```plaintext
src/app:
├── pages/ # Next.js 頁面 (路由)
│ ├── api/ # Next.js API 路由
│ │ └── analyze-logs.js # 處理日誌分析的 API 路由
│ └── index.js # 網站首頁
├── public/ # 靜態資源 (例如：圖片)
├── styles/ # 全域樣式表
│ └── globals.css
├── components/ # React 元件
│ └── MessageBoard.js # 留言板元件
├── server.js # (移除，功能移至 API 路由)
├── web.html # (移除，功能移至 index.js)
├── package.json
├── package-lock.json
└── next.config.js # Next.js 設定檔 (如果需要)
```

# demo:

- 1.請使用 run-web-ui.sh（或其中的 npm 指令）
- 2. 接著開啟：http://localhost:3000/即可預覽

# 開發：

- 1.後端發送給 llm 主要在：
  bde-ai-security-demo/src/app/pages/api/analyze-logs.js
  實作。

- 2.於 bde-ai-security-demo/src/app/pages/index.js 的 button 中，加上觸發 event 即可加上新的 fetch(對 analyze-logs.js 定義的端點做 fetch)

# tech-stack：

- **前端:**
  - React
  - Next.js
  - Tailwind CSS
- **後端:**
  - Node.js
  - ＊Express (可用於 API 路由，雖然 Next.js 提供了 API 路由功能)
  - Axios (用於 HTTP 請求)
  - CORS (用於跨域請求)
- **其他:**
  - npm (或 yarn)
  - LLM (Llama3.2:1b) - 透過 API 呼叫
