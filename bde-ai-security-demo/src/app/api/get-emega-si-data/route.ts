/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// securityLogs.ts
import { promises as fs } from "fs";
import path from "path";

const CF_AUTH_MAIL: string = "cloudflare.admin@twister5.com.tw";
const CF_AUTH_KEY: string = "daf08ebac1a4805ecb820fa699ca0d8b0b9e2";

// 定義返回數據的接口
interface SecurityLog {
  ip: string;
  country: string;
  method: string;
  path: string;
  timestamp: string;
  userAgent: string;
  status: number;
}

interface FetchResult {
  requests: SecurityLog[];
  needsUpdate: boolean;
}

// Cloudflare API 響應的類型（簡化版）
interface CloudflareResponse {
  data?: {
    viewer?: {
      scope?: Array<{
        httpRequestsAdaptive?: Array<{
          clientIP: string;
          clientCountryName: string;
          clientRequestHTTPMethodName: string;
          clientRequestPath: string;
          datetime: string;
          userAgent: string;
          edgeResponseStatus: number;
        }>;
      }>;
    };
  };
  errors?: any[];
}

async function fetch_emega_SecurityLogs(): Promise<FetchResult> {
  const endTime: Date = new Date();
  const allRequests: SecurityLog[] = [];
  let needsUpdate = false;

  // 迴圈，每月查詢一次
  for (let i = 0; i < 12; i++) {
    const startTime: Date = new Date(
      endTime.getFullYear() - 1,
      endTime.getMonth() - i,
      1,
      0,
      0,
      0
    ); // 每月的第一天
    const nextMonth = new Date(
      endTime.getFullYear() - 1,
      endTime.getMonth() - i + 1,
      1,
      0,
      0,
      0
    );
    const currentEndTime = i === 11 ? new Date() : nextMonth; // 處理最後一個月

    const graphqlQuery = {
      operationName: "GetSecuritySampledLogs",
      variables: {
        zoneTag: "57444f939576661a446ef2aba6d8bed1",
        accountTag: "faa2c7e72a9d4573e6525c94b7a66209",
        filter: {
          datetime_geq: startTime.toISOString(),
          datetime_leq: currentEndTime.toISOString(),
        },
      },
      query: `query GetSecuritySampledLogs($zoneTag: String, $filter: ZoneHttpRequestsAdaptiveFilter_InputObject) {
                  viewer {
                      scope: zones(filter: {zoneTag: $zoneTag}) {
                          httpRequestsAdaptive(
                              filter: $filter,
                              limit: 1000,
                              orderBy: ["datetime_DESC"]
                          ) {
                              clientIP
                              clientCountryName
                              clientRequestHTTPMethodName
                              clientRequestPath
                              datetime
                              userAgent
                              edgeResponseStatus
                              __typename
                          }
                          __typename
                      }
                      __typename
                  }
              }`,
    };

    try {
      const response = await fetch(
        "https://api.cloudflare.com/client/v4/graphql",
        {
          method: "POST",
          headers: {
            "X-Auth-Email": CF_AUTH_MAIL,
            "X-Auth-Key": CF_AUTH_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphqlQuery),
        }
      );

      const data: CloudflareResponse = await response.json();

      console.log("Cloudflare API Response:", JSON.stringify(data, null, 2)); // 添加這行
      if (data.errors) {
        console.error("GraphQL Errors:", data.errors);
        // 處理錯誤，例如跳過這個月或拋出錯誤
        continue; // 跳過這個月
      }

      const requests =
        data?.data?.viewer?.scope?.[0]?.httpRequestsAdaptive || [];
      const enrichedData: SecurityLog[] = requests.map((request) => ({
        ip: request.clientIP,
        country: request.clientCountryName,
        method: request.clientRequestHTTPMethodName,
        path: request.clientRequestPath,
        timestamp: request.datetime,
        userAgent: request.userAgent,
        status: request.edgeResponseStatus,
      }));

      allRequests.push(...enrichedData);
      if (enrichedData.length > 0) {
        needsUpdate = true;
      }
    } catch (error: any) {
      console.error("Error fetching security logs:", error.message);
      console.error("Error details:", error.stack);
      await fs.appendFile(
        "error.log",
        `[${new Date().toISOString()}] Error: ${error.message}\n${
          error.stack
        }\n`
      );
      // 處理錯誤，例如跳過這個月或拋出錯誤
    }
  }

  console.log("Enriched Data (first 5):", allRequests.slice(0, 5));

  const timestamp: string = new Date().toISOString().replace(/[:.]/g, "-");
  const filename: string = `waf_second_parameter_${timestamp}.json`;
  const filepath: string = path.join(
    __dirname,
    "waf_second_parameter",
    filename
  );

  //  await fs.writeFile(
  //  filepath,
  // JSON.stringify({ requests: enrichedData }, null, 2)
  //);
  // console.log(`Data saved to ${filepath}`);

  return { requests: allRequests, needsUpdate: needsUpdate };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const result: FetchResult = await fetch_emega_SecurityLogs();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error processing POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

// 初始調用和定時執行
fetch_emega_SecurityLogs().then((result: FetchResult) =>
  console.log("Final Result:", result)
);

// 每5分鐘執行一次
setInterval(() => {
  console.log("Running fetch_Second_SecurityLogs() every 5 minutes...");
  fetch_emega_SecurityLogs().then((result: FetchResult) =>
    console.log("Result:", result)
  );
}, 5 * 60 * 1000);

console.log(
  "Script started. fetch_Second_SecurityLogs() will run every 5 minutes."
);
