import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

type LEDProps = {
  state?: "on" | "off";
  color?: "red" | "green" | "blue" | "yellow" | "orange" | "purple";
  size?: "sm" | "md" | "lg";
  label?: string;
  onClick?: () => void;
  pulse?: boolean;
};

const sizeMap = {
  sm: 12,
  md: 20,
  lg: 32,
};

const colorMap = {
  red: { off: "#3f3f3f", on: "#ef4444", glow: "rgba(239,68,68,0.6)" },
  green: { off: "#3f3f3f", on: "#22c55e", glow: "rgba(34,197,94,0.6)" },
  blue: { off: "#3f3f3f", on: "#3b82f6", glow: "rgba(59,130,246,0.6)" },
  yellow: { off: "#3f3f3f", on: "#eab308", glow: "rgba(234,179,8,0.6)" },
  orange: { off: "#3f3f3f", on: "#f97316", glow: "rgba(249,115,22,0.6)" },
  purple: { off: "#3f3f3f", on: "#a855f7", glow: "rgba(168,85,247,0.6)" },
};

export const LED: React.FC<LEDProps> = ({
  state = "off",
  color = "red",
  size = "md",
  label,
  onClick,
  pulse = true,
}) => {
  const isOn = state === "on";
  const diameter = sizeMap[size];
  const { off, on, glow } = colorMap[color];

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  //   useEffect(() => {
  //     if (isOn && pulse) {
  //       Animated.loop(
  //         Animated.sequence([
  //           Animated.parallel([
  //             Animated.timing(opacity, {
  //               toValue: 0.7,
  //               duration: 1000,
  //               useNativeDriver: true,
  //             }),
  //             Animated.timing(scale, {
  //               toValue: 0.9,
  //               duration: 1000,
  //               useNativeDriver: true,
  //             }),
  //           ]),
  //           Animated.parallel([
  //             Animated.timing(opacity, {
  //               toValue: 1,
  //               duration: 1000,
  //               useNativeDriver: true,
  //             }),
  //             Animated.timing(scale, {
  //               toValue: 1,
  //               duration: 1000,
  //               useNativeDriver: true,
  //             }),
  //           ]),
  //         ])
  //       ).start();
  //     } else {
  //       opacity.setValue(1);
  //       scale.setValue(1);
  //     }
  //   }, [isOn, pulse]);

  const Wrapper = onClick ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onClick}
      style={styles.container}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor: isOn ? on : off,
            borderWidth: 2,
            borderColor: isOn ? on : "#2f2f2f",
            opacity,
            transform: [{ scale }],
            shadowColor: isOn ? glow : "#000",
            shadowOpacity: isOn ? 0.9 : 0.3,
            shadowRadius: isOn ? diameter : 2,
            shadowOffset: { width: 0, height: 0 },
            elevation: isOn ? 8 : 2,
          },
        ]}
      />
      {label && <Text style={styles.label}>{label}</Text>}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
});

export default LED;
