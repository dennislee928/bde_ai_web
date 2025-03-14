/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
var CF_AUTH_MAIL = "cloudflare.admin@twister5.com.tw";
var CF_AUTH_KEY = "daf08ebac1a4805ecb820fa699ca0d8b0b9e2";
var ZONE_ID = "15e2496da3b1ecfdb51f3ff011634cb2";
var RULESET_ID = "92c8e0851be6450c9b09dbdcbbefd38e";
var RULE_ID = "ee5369e5c6a248b7b755e75c31c7ef60";
var RULE_2_ID = "53f5ec24326648549d91674ce9b4b089";

const fs = require("fs").promises; // 使用 fs.promises 進行非同步檔案操作
const path = require("path"); // 引入 path 模組

async function fetchSecurityLogs() {
  const endTime = /* @__PURE__ */ new Date();
  const startTime = new Date(endTime - 30 * 60 * 1000); // 改為最近30分鐘
  const graphqlQuery = {
    operationName: "GetSecuritySampledLogs",
    variables: {
      zoneTag: "15e2496da3b1ecfdb51f3ff011634cb2",
      accountTag: "e1ab85903e4701fa311b5270c16665f6",
      filter: {
        AND: [
          {
            datetime_geq: startTime.toISOString(),
            datetime_leq: endTime.toISOString(),
            requestSource: "eyeball",
          },
          {
            botScore_leq: 60,
          },
        ],
      },
    },
    query: `query GetSecuritySampledLogs($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveFilter_InputObject) {
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
                              botScore
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
    const data = await response.json();
    const ips = /* @__PURE__ */ new Set();
    if (data?.data?.viewer?.scope?.[0]?.httpRequestsAdaptive) {
      data.data.viewer.scope[0].httpRequestsAdaptive.forEach((request) => {
        if (request.clientIP && request.botScore <= 60) {
          ips.add(request.clientIP);
        }
      });
    }
    const ipArray = Array.from(ips);
    console.log("Extracted IPs:", ipArray);

    // 創建時間戳作為文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `waf_IPs_${timestamp}.json`;
    const filepath = path.join(__dirname, "waf_IPs", filename); // 使用 path.join 構建路徑

    // 將 IP 地址寫入 JSON 文件
    await fs.writeFile(filepath, JSON.stringify({ ips: ipArray }, null, 2));
    console.log(`IPs saved to ${filepath}`);

    return { ips: ipArray, needsUpdate: ipArray.length > 0 };
  } catch (error) {
    console.error("Error fetching security logs:", error);
    console.error("Error details:", error.stack); // 打印堆疊追蹤
    // 也可以將錯誤寫入日誌文件
    fs.appendFile(
      "error.log",
      `[${new Date().toISOString()}] Error: ${error.message}\n${error.stack}\n`
    );
    return { ips: [], needsUpdate: false };
  }
}

fetchSecurityLogs();
