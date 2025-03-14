/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// securityLogs.ts

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

async function fetch_Second_SecurityLogs(): Promise<FetchResult> {
  const endTime: Date = new Date();
  const startTime: Date = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  const graphqlQuery = {
    operationName: "GetSecuritySampledLogs",
    variables: {
      zoneTag: "12f7a8527aeb960166452bd1815be6e0",
      accountTag: "355785b9b9eb290114c3b386a09ccdc5",
      filter: {
        datetime_geq: startTime.toISOString(),
        datetime_leq: endTime.toISOString(),
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
    console.log("Full Cloudflare Response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return { requests: [], needsUpdate: false };
    }

    const requests = data?.data?.viewer?.scope?.[0]?.httpRequestsAdaptive || [];
    const enrichedData: SecurityLog[] = requests.map((request) => ({
      ip: request.clientIP,
      country: request.clientCountryName,
      method: request.clientRequestHTTPMethodName,
      path: request.clientRequestPath,
      timestamp: request.datetime,
      userAgent: request.userAgent,
      status: request.edgeResponseStatus,
    }));

    console.log("Enriched Data (first 5):", enrichedData.slice(0, 5));

    const timestamp: string = new Date().toISOString().replace(/[:.]/g, "-");
    const filename: string = `waf_second_parameter_${timestamp}.json`;
    // const filepath: string = path.join(
    // __dirname,
    //"waf_second_parameter",
    //filename
    //);

    //  await fs.writeFile(
    //  filepath,
    // JSON.stringify({ requests: enrichedData }, null, 2)
    //);
    // console.log(`Data saved to ${filepath}`);

    return { requests: enrichedData, needsUpdate: enrichedData.length > 0 };
  } catch (error: any) {
    console.error("Error fetching security logs:", error.message);
    console.error("Error details:", error.stack);
    //  await fs.appendFile(
    //  "error.log",
    // `[${new Date().toISOString()}] Error: ${error.message}\n${error.stack}\n`
    //);
    return { requests: [], needsUpdate: false };
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const result: FetchResult = await fetch_Second_SecurityLogs();
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
fetch_Second_SecurityLogs().then((result: FetchResult) =>
  console.log("Final Result:", result)
);

// 每5分鐘執行一次
setInterval(() => {
  console.log("Running fetch_Second_SecurityLogs() every 5 minutes...");
  fetch_Second_SecurityLogs().then((result: FetchResult) =>
    console.log("Result:", result)
  );
}, 5 * 60 * 1000);

console.log(
  "Script started. fetch_Second_SecurityLogs() will run every 5 minutes."
);
