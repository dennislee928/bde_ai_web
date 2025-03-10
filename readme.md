api-server/
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
