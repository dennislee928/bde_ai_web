// utils.js
import * as THREE from "three";

export function convertDataToPoints(jsonData, geoLookup = {}) {
  const points = [];

  if (!jsonData || !jsonData.requests || jsonData.requests.length === 0)
    return points; // 新增

  jsonData.requests.forEach((request) => {
    const geoInfo = geoLookup[request.ip] || {};

    const latitude = geoInfo.latitude || Math.random() * 180 - 90;
    const longitude = geoInfo.longitude || Math.random() * 360 - 180;

    const phi = ((90 - latitude) * Math.PI) / 180;
    const theta = ((longitude + 180) * Math.PI) / 180;
    const radius = 5;

    const position = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const color =
      request.status >= 500
        ? "#ff0000"
        : request.status >= 400
        ? "#ffa500"
        : request.status >= 300
        ? "#ffff00"
        : request.status >= 200
        ? "#00ff00"
        : "#ffffff";

    points.push({
      position,
      color,
      metadata: {
        ip: request.ip,
        country: request.country,
        method: request.method,
        status: request.status,
        timestamp: request.timestamp,
        userAgent: request.userAgent,
      },
    });
  });

  return points;
}
