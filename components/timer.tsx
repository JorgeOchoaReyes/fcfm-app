import React, { useEffect, useState, memo } from "react";
import { Text, View } from "react-native";

interface ElapsedTimerProps {
  startTimestamp: number 
  textColor?: string
  textSize?: string
}

export const Timer = memo(({ 
  startTimestamp, 
  textColor = "text-black",
  textSize = "text-md"
}: ElapsedTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = now - startTimestamp;

      if (elapsed < 0) {
        setElapsedTime(prev => prev === "00:00" ? prev : "00:00");
        return;
      }

      const seconds = Math.floor((elapsed / 1000) % 60);
      const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
      const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours.toString().padStart(2, "0")}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes.toString().padStart(2, "0")}m`);
      parts.push(`${seconds.toString().padStart(2, "0")}s`);

      const newTime = parts.join(" ");
      setElapsedTime(prev => prev === newTime ? prev : newTime);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  return (
    <View className={"font-mono font-bold text-center tabular-nums"}>
      <Text className={textSize + " " + textColor + " " + "font-bold"}>{elapsedTime}</Text>
    </View>
  );
});
