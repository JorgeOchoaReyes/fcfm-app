import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";
import { useNearbySync } from "../hooks/useNearbySync";

export default function ConnectionPicker() {
  const { preferredPeerId, setPreferredPeer, deviceId, setDeviceId } = useStorageP2P();
  const { discoveredPeers, isSearching, startP2P, } = useNearbySync();

  const togglePermanent = (id: string) => {
    if (preferredPeerId === id) {
      setPreferredPeer(null);  
    } else {
      setPreferredPeer(id);
      Nearby.acceptConnection(id); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Searching for Devices</Text>
        <TouchableOpacity onPress={startP2P}>
          <Ionicons name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text>Device ID: {deviceId}</Text>
      <Text>Preferred Peer ID: {preferredPeerId}</Text>

      <View>
        <TextInput
          placeholder="Device ID to broadcast"
          value={deviceId}
          onChangeText={setDeviceId}
        />
      </View>
      <TouchableOpacity onPress={() => setDeviceId(deviceId)}>
        <Text>Set Device ID</Text>
      </TouchableOpacity>

      <FlatList
        data={discoveredPeers}
        keyExtractor={(item) => item.peerId}
        renderItem={({ item }) => (
          <View style={styles.peerItem}>
            <View style={styles.peerInfo}> 
              <Ionicons name="bluetooth" size={20} color="#1890ff" />
              <Text style={styles.peerName}>{item.name}</Text>
              {preferredPeerId === item.peerId && <Text style={styles.trustedLabel}>(Trusted)</Text>}
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={() => togglePermanent(item.peerId)}
              >
                <Ionicons name="star" size={24} color={preferredPeerId === item.peerId ? "#fadb14" : "#d9d9d9"} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.connectBtn} 
                onPress={() => Nearby.acceptConnection(item.peerId)}
              >
                <Ionicons name="link" size={18} color="#fff" />
                <Text style={styles.btnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{isSearching ? "Scanning for devices..." : "No devices found."}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  peerItem: { 
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 15, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" 
  },
  peerInfo: { flexDirection: "row", alignItems: "center" },
  peerName: { marginLeft: 10, fontSize: 16, fontWeight: "500" },
  trustedLabel: { marginLeft: 8, fontSize: 10, color: "#52c41a", fontStyle: "italic" },
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: 10 },
  connectBtn: { 
    flexDirection: "row", alignItems: "center", backgroundColor: "#1890ff", 
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 10 
  },
  btnText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});