"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart";
import { AQI } from "@/interfaces/aqi";

interface PollutantChartProps {
  aqiData: AQI | null;
  loading?: boolean;
}

const WHO_LIMITS = {
  pm25: 25,
  pm10: 50,
  no2: 40,
  o3: 100,
  so2: 20,
  co: 4,
};

export function PollutantChart({
  aqiData,
  loading = false,
}: PollutantChartProps) {
  const data = aqiData
    ? [
        { name: "PM2.5", value: aqiData.pm25 || 0, limit: WHO_LIMITS.pm25 },
        { name: "PM10", value: aqiData.pm10 || 0, limit: WHO_LIMITS.pm10 },
        { name: "NO2", value: aqiData.no2 || 0, limit: WHO_LIMITS.no2 },
        { name: "O3", value: aqiData.o3 || 0, limit: WHO_LIMITS.o3 },
        { name: "SO2", value: aqiData.so2 || 0, limit: WHO_LIMITS.so2 },
        { name: "CO", value: aqiData.co || 0, limit: WHO_LIMITS.co },
      ]
    : [];

  return (
    <div className={`h-64 w-full ${loading ? "opacity-50" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
            formatter={(value: number, _, props) => {
              const item = data.find((d) => d.name === props.payload.name);
              const percentage = item
                ? Math.round((item.value / item.limit) * 100)
                : 0;
              return [`${value} (${percentage}% of limit)`, props.payload.name];
            }}
          />
          <Bar dataKey="value" fill="#000000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
