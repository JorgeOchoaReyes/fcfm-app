import React from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native"; 
import { useStorageP2P } from "hooks/useStorage";

const NearbyStatusBadge = () => {
  const { connectedPeerId } = useStorageP2P(); 

  const getStatusColor = () => {
    if (connectedPeerId) return "#52c41a"; 
    return "#ff4d4f"; 
  }; 

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.badge, { borderColor: getStatusColor() }]}  
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: getStatusColor()}
            ]} 
          />  
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50, 
    right: 16,
    zIndex: 9999, 
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
