# GraphQL 查詢說明

此為一個 GraphQL 查詢，旨在從 Cloudflare 的 API 獲取安全採樣日誌，特別是針對由 Cloudflare 的自適應安全功能處理的 HTTP 請求。 以下為詳細說明：

1.  操作名稱

    operationName: "GetSecuritySampledLogs"
    此將查詢命名為 "GetSecuritySampledLogs"，這對於在日誌中進行除錯或識別查詢很有用。

2.  變數

    variables: 這些是傳遞給查詢的動態輸入。
    zoneTag: "15e2496da3b1ecfdb51f3ff011634cb2"
    特定 Cloudflare 區域（例如，網域或網站）的唯一標識符。
    accountTag: "e1ab85903e4701fa311b5270c16665f6"
    Cloudflare 帳戶的唯一標識符。
    filter: 定義用於縮小返回日誌範圍的條件。
    AND: 組合多個必須全部為真的條件。
    第一個條件：
    datetime_geq: 開始時間（大於或等於）。
    datetime_leq: 結束時間（小於或等於）。
    requestSource: "eyeball": 篩選來自最終用戶的請求（非內部或機器人驅動的來源）。
    第二個條件：
    botScore_geq: 50: 篩選機器人評分等於或高於 50 的請求（Cloudflare 將機器人評分從 0-100 分配，其中較高的分數表示更像機器人的行為）。

3.  查詢

    query 欄位定義了要檢索的資料以及如何構造它：
    viewer: Cloudflare 的 GraphQL 模式中的根物件，代表已驗證使用者或 API 金鑰的視圖。
    scope: zones(filter: {zoneTag: $zoneTag}): 篩選到由 zoneTag 標識的特定區域。
    httpRequestsAdaptive: 檢索自適應 HTTP 請求日誌（安全採樣日誌）。
    filter: $filter: 應用在變數中定義的篩選器。
    limit: 1000: 將響應限制為 1000 條記錄。
    orderBy: \["datetime_DESC"]: 按時間戳降序排序結果（最新在前）。
    請求的欄位：
    clientIP: 提出請求的客戶端的 IP 位址。
    clientCountryName: 客戶端的國家/地區（基於 IP 地理位置）。
    clientRequestHTTPMethodName: HTTP 方法（例如，GET、POST）。
    clientRequestPath: 請求的 URL 路徑。
    datetime: 請求的時間戳。
    userAgent: 來自客戶端的 User-Agent 字串（例如，瀏覽器或機器人標識符）。
    botScore: Cloudflare 對請求的機器人評分。
    \_\_typename: GraphQL 內省欄位，指示返回的物件的類型（例如，"ZoneHttpRequestsAdaptive"）。
    \_\_typename 在各個層級：用於除錯或模式驗證。

總結目的

此查詢檢索來自特定 Cloudflare 區域的最多 1000 個最近的 HTTP 請求，並篩選為：

- 發生在 startTime 和 endTime 之間。
- 來自最終用戶（eyeball）。
- 機器人評分等於或高於 50（表示潛在的機器人活動）。

---

Explanation of the GraphQL Query

This is a GraphQL query designed to fetch security-sampled logs from Cloudflare's API, specifically for HTTP requests processed by Cloudflare's adaptive security features. Here's a detailed explanation:

1. Operation Name

   operationName: "GetSecuritySampledLogs"
   This names the query as "GetSecuritySampledLogs," which is useful for debugging or identifying the query in logs.

2. Variables

   variables: These are dynamic inputs passed to the query.
   zoneTag: "15e2496da3b1ecfdb51f3ff011634cb2"
   A unique identifier for a specific Cloudflare zone (e.g., a domain or website).
   accountTag: "e1ab85903e4701fa311b5270c16665f6"
   A unique identifier for the Cloudflare account.
   filter: Defines conditions to narrow down the logs returned.
   AND: Combines multiple conditions that must all be true.
   First condition:
   datetime_geq: Start time (greater than or equal to).
   datetime_leq: End time (less than or equal to).
   requestSource: "eyeball": Filters for requests from end-users (not internal or bot-driven sources).
   Second condition:
   botScore_geq: 50: Filters for requests with a bot score of 50 or higher (Cloudflare assigns bot scores from 0-100, where higher scores indicate more bot-like behavior).

3. Query

   The query field defines what data to retrieve and how to structure it:
   viewer: The root object in Cloudflare's GraphQL schema, representing the authenticated user or API key's view.
   scope: zones(filter: {zoneTag: $zoneTag}): Filters to the specific zone identified by zoneTag.
   httpRequestsAdaptive: Retrieves adaptive HTTP request logs (security-sampled logs).
   filter: $filter: Applies the filter defined in variables.
   limit: 1000: Limits the response to 1000 records.
   orderBy: ["datetime_DESC"]: Sorts results by timestamp in descending order (newest first).
   Fields Requested:
   clientIP: The IP address of the client making the request.
   clientCountryName: The country of the client (based on IP geolocation).
   clientRequestHTTPMethodName: The HTTP method (e.g., GET, POST).
   clientRequestPath: The URL path requested.
   datetime: The timestamp of the request.
   userAgent: The User-Agent string from the client (e.g., browser or bot identifier).
   botScore: Cloudflare's bot score for the request.
   **typename: A GraphQL introspection field indicating the type of object returned (e.g., "ZoneHttpRequestsAdaptive").
   **typename at various levels: Used for debugging or schema validation.

Summary of Purpose

This query retrieves up to 1000 recent HTTP requests from a specific Cloudflare zone, filtered to:

    Occur between startTime and endTime.
    Originate from end-users (eyeball).
    Have a bot score of 50 or higher (indicating potential bot activity).
