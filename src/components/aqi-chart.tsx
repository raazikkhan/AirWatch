"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart";
import { AQI } from "@/interfaces/aqi";

interface AQIChartProps {
  aqiData: AQI | null;
  loading?: boolean;
  mode?: "recent" | "24h";
}

export function AQIChart({
  aqiData,
  loading = false,
  mode = "recent",
}: AQIChartProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTimeAgo = (hours: number) => {
    if (hours === 0) return "Now";
    if (hours === 1) return "1h ago";
    return `${hours}h ago`;
  };

  const get24HourData = () => {
    if (!aqiData?.hourlyHistory) return [];

    const allData = [
      { aqi: aqiData.aqi, timestamp: aqiData.lastUpdated },
      ...aqiData.hourlyHistory,
    ];

    return allData
      .slice(0, 24)
      .map((entry, index) => ({
        time: entry.timestamp
          ? formatTime(entry.timestamp)
          : getTimeAgo(23 - index),
        aqi: entry.aqi,
      }))
      .reverse();
  };

  const getRecentData = () => {
    if (!aqiData?.hourlyHistory) return [];

    const recentEntries = aqiData.hourlyHistory.slice(1, 4);
    return [
      {
        time: "Now",
        aqi: aqiData.aqi,
      },
      ...recentEntries.map((entry, index) => ({
        time: entry.timestamp
          ? formatTime(entry.timestamp)
          : getTimeAgo(3 - index),
        aqi: entry.aqi,
      })),
    ];
  };

  const data = mode === "24h" ? get24HourData() : getRecentData();

  return (
    <div className={`h-64 w-full ${loading ? "opacity-50" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval={mode === "24h" ? 2 : 0}
            angle={mode === "24h" ? -45 : 0}
            textAnchor={mode === "24h" ? "end" : "middle"}
            height={mode === "24h" ? 60 : 30}
          />
          <YAxis
            domain={[
              (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.8)),
              (dataMax: number) => Math.ceil(dataMax * 1.2),
            ]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
            formatter={(value: number) => [`AQI: ${value}`, ""]}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#000000"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
