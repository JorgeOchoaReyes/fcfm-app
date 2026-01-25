import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNearbySync } from "../hooks/useNearbySync";

const NearbyStatusBadge = () => {
  const { connectedPeer, isSearching, startP2P } = useNearbySync();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSearching) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSearching, pulseAnim]);

  const getStatusColor = () => {
    if (connectedPeer) return "#52c41a"; // Success green
    if (isSearching) return "#1890ff"; // Primary blue
    return "#ff4d4f"; // Error red
  };

  const getStatusText = () => {
    if (connectedPeer) return "Connected";
    if (isSearching) return "Searching...";
    return "Disconnected";
  };

  const getHealthStatus = () => {
    if (connectedPeer) return "Healthy";
    return "Unknown";
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.badge, { borderColor: getStatusColor() }]} 
        onPress={() => startP2P()}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: getStatusColor(), opacity: pulseAnim }
            ]} 
          />
          <View>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            {connectedPeer && (
              <Text style={styles.healthText}>{getHealthStatus()}</Text>
            )}
          </View>
          <Ionicons 
            name="refresh-circle" 
            size={20} 
            color="#999" 
            style={styles.refreshIcon} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50, // Below potential status bar or header top
    right: 16,
    zIndex: 9999, // Ensure it's above everything
    elevation: 5,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
  },
  healthText: {
    fontSize: 8,
    color: "#52c41a",
    marginTop: -2,
  },
  refreshIcon: {
    marginLeft: 8,
  },
});

export default NearbyStatusBadge;
