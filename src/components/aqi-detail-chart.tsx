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

type Period = "hourly" | "daily" | "weekly";

interface AQIDetailChartProps {
  period: Period;
  loading?: boolean;
  aqiData: AQI | null;
}

export function AQIDetailChart({
  period,
  loading = false,
  aqiData,
}: AQIDetailChartProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (period === "hourly") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (period === "daily") {
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getTimeAgo = (value: number, unit: string) => {
    if (value === 0) return unit === "hour" ? "Now" : "Today";
    if (value === 1) return `1 ${unit} ago`;
    return `${value} ${unit}s ago`;
  };

  const getChartData = () => {
    if (!aqiData) return [];

    switch (period) {
      case "hourly": {
        const allData = [
          { aqi: aqiData.aqi, timestamp: aqiData.lastUpdated },
          ...(aqiData.hourlyHistory || []),
        ];

        return allData
          .slice(0, 24)
          .map((entry, index) => ({
            time: entry.timestamp
              ? formatTime(entry.timestamp)
              : getTimeAgo(23 - index, "hour"),
            aqi: entry.aqi,
          }))
          .reverse();
      }

      case "daily": {
        const allData = [
          { aqi: aqiData.aqi, timestamp: aqiData.lastUpdated },
          ...(aqiData.dailyHistory || []),
        ];

        return allData
          .slice(0, 7)
          .map((entry, index) => ({
            time: entry.timestamp
              ? formatTime(entry.timestamp)
              : getTimeAgo(6 - index, "day"),
            aqi: entry.aqi,
          }))
          .reverse();
      }

      case "weekly": {
        const allData = [
          { aqi: aqiData.aqi, timestamp: aqiData.lastUpdated },
          ...(aqiData.weeklyHistory || []),
        ];

        return allData
          .slice(0, 4)
          .map((entry, index) => ({
            time: entry.timestamp
              ? formatTime(entry.timestamp)
              : `Week ${4 - index}`,
            aqi: entry.aqi,
          }))
          .reverse();
      }

      default:
        return [];
    }
  };

  const data = getChartData();

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
            interval={period === "hourly" ? 2 : 0}
            angle={-45}
            textAnchor="end"
            height={60}
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
