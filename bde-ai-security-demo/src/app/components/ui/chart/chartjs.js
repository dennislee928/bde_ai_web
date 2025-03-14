/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";

function ChartComponent({ jsonData, chartType = "country" }) {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    console.log("ChartComponent useEffect - jsonData:", jsonData);

    // Check if jsonData is valid
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      console.log("ChartComponent useEffect - No valid data");
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
      return;
    }

    let newChartData;

    switch (chartType) {
      case "status": {
        // Count requests by status code
        const statusCounts = {};
        jsonData.forEach((request) => {
          const status = request.status;
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusLabels = Object.keys(statusCounts);
        const statusData = Object.values(statusCounts);

        newChartData = {
          labels: statusLabels,
          datasets: [
            {
              label: "Requests by Status Code",
              data: statusData,
              backgroundColor: statusLabels.map((status) => {
                if (status >= 500) return "rgba(255, 0, 0, 0.5)"; // Server errors
                if (status >= 400) return "rgba(255, 165, 0, 0.5)"; // Client errors
                if (status >= 300) return "rgba(255, 255, 0, 0.5)"; // Redirects
                if (status >= 200) return "rgba(0, 255, 0, 0.5)"; // Success
                return "rgba(255, 255, 255, 0.5)"; // Other
              }),
              borderColor: "rgba(0, 0, 0, 1)",
              borderWidth: 1,
            },
          ],
        };
        break;
      }

      case "method": {
        // Count requests by method
        const methodCounts = {};
        jsonData.forEach((request) => {
          const method = request.method || "Unknown";
          methodCounts[method] = (methodCounts[method] || 0) + 1;
        });

        const methodLabels = Object.keys(methodCounts);
        const methodData = Object.values(methodCounts);

        newChartData = {
          labels: methodLabels,
          datasets: [
            {
              label: "Requests by Method",
              data: methodData,
              backgroundColor: [
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ].slice(0, methodLabels.length), // Ensure colors match data length
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        };
        break;
      }

      case "hourly": {
        // Count requests by hour
        const hourlyCounts = {};
        jsonData.forEach((request) => {
          const timestamp = new Date(request.timestamp);
          const hour = timestamp.getHours();
          hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        });

        const hourlyLabels = Object.keys(hourlyCounts).map(
          (hour) => `${hour}:00`
        );
        const hourlyData = Object.values(hourlyCounts);

        newChartData = {
          labels: hourlyLabels,
          datasets: [
            {
              label: "Requests by Hour",
              data: hourlyData,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        };
        break;
      }

      case "country":
      default: {
        // Count requests by country
        const countryCounts = {};
        jsonData.forEach((request) => {
          const country = request.country || "Unknown";
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        });

        const countryLabels = Object.keys(countryCounts);
        const countryData = Object.values(countryCounts);

        newChartData = {
          labels: countryLabels,
          datasets: [
            {
              label: "Requests by Country",
              data: countryData,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ].slice(0, countryLabels.length), // Ensure colors match data length
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ].slice(0, countryLabels.length),
              borderWidth: 1,
            },
          ],
        };
        break;
      }
    }

    console.log("ChartComponent useEffect - chartData:", newChartData);
    setChartData(newChartData);
  }, [jsonData, chartType, chartInstance]); // Added chartType and chartInstance

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    // Destroy old chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create new chart instance
    const newChartInstance = new Chart(chartRef.current, {
      type: "bar", // You can make this dynamic too if needed
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  }, [chartData, chartInstance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, [chartInstance]);

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        display: "flex",
        justifyContent: "center", // Center horizontally
      }}
    >
      <canvas ref={chartRef} style={{ maxWidth: "600px" }} />
    </div>
  );
}

export default ChartComponent;
