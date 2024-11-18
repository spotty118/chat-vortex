import { useEffect, useState } from "react";
import { LatencyStats as LatencyStatsType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface LatencyStatsProps {
  providerId: string;
}

export const LatencyStats = ({ providerId }: LatencyStatsProps) => {
  const [stats, setStats] = useState<LatencyStatsType>({
    current: 0,
    average: 0,
    tps: 0,
  });

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats({
        current: Math.random() * 300 + 100,
        average: Math.random() * 250 + 150,
        tps: Math.random() * 15 + 5,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [providerId]);

  const getLatencyColor = (latency: number) => {
    if (latency < 200) return "text-emerald";
    if (latency < 400) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="glass-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Latency Stats
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Current</p>
          <p className={`text-xl font-bold ${getLatencyColor(stats.current)}`}>
            {stats.current.toFixed(0)}ms
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Average</p>
          <p className={`text-xl font-bold ${getLatencyColor(stats.average)}`}>
            {stats.average.toFixed(0)}ms
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">TPS</p>
          <p className="text-xl font-bold text-electric">
            {stats.tps.toFixed(1)}
          </p>
        </div>
      </div>
    </Card>
  );
};