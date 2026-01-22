import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";

export default function ConnectionPicker() {
  const [discoveredPeers, setDiscoveredPeers] = useState<{id: string, name: string}[]>([]);
  const { preferredPeerId, setPreferredPeer } = useStorageP2P();

  useEffect(() => {
    const foundSub = Nearby.onPeerFound((event) => {
      setDiscoveredPeers(prev => {
        if (prev.find(p => p.id === event.peerId)) return prev;
        return [...prev, { id: event.peerId, name: event.name }];
      });
 
      if (event.peerId === preferredPeerId) {
        Nearby.acceptConnection(event.peerId);
      }
    });

    const lostSub = Nearby.onPeerLost((event) => {
      setDiscoveredPeers(prev => prev.filter(p => p.id !== event.peerId));
    });

    return () => {
      foundSub();
      lostSub();
    };
  }, [preferredPeerId]);

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
        <Text style={styles.title}>Nearby Devices</Text>
        <TouchableOpacity onPress={() => setDiscoveredPeers([])}>
          <Ionicons name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={discoveredPeers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.peerItem}>
            <View style={styles.peerInfo}> 
              <Ionicons name="bluetooth" size={20} color="#1890ff" />
              <Text style={styles.peerName}>{item.name}</Text>
              {preferredPeerId === item.id && <Text style={styles.trustedLabel}>(Trusted)</Text>}
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={() => togglePermanent(item.id)}
              >
                <Ionicons name="star" size={24} color={preferredPeerId === item.id ? "#fadb14" : "#d9d9d9"} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.connectBtn} 
                onPress={() => Nearby.acceptConnection(item.id)}
              >
                <Ionicons name="link" size={18} color="#fff" />
                <Text style={styles.btnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Scanning for devices...</Text>}
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