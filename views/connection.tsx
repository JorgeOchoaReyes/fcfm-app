import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Nearby from "expo-nearby-connections";
import { useStorageP2P } from "../hooks/useStorage";
import { useNearbySync } from "../hooks/useNearbySync";
import { usePriorityQueue } from "hooks/usePriority-Queue";
import { useShallow } from "zustand/react/shallow";

export default function ConnectionPicker() {
  const { 
    isHub, 
    deviceId,  
    connectedPeerId, 
    connectedPeerName,  
    setDeviceId, 
    setIsHub, 
    clearStorage 
  } = useStorageP2P(useShallow(state => ({
    isHub: state.isHub,
    deviceId: state.deviceId,
    connectedPeerId: state.connectedPeerId,
    connectedPeerName: state.connectedPeerName,
    setDeviceId: state.setDeviceId,
    setIsHub: state.setIsHub,
    clearStorage: state.clearStorage
  })));

  const { 
    discoveredPeers, 
    isSearching, 
    startP2P, 
    stopP2P, 
    disconnect, 
    clearDiscoveredPeers
  } = useNearbySync();
  const clearPriorityQueue = usePriorityQueue(state => state.clearPriorityQueue);
  const dateOfStorage = useStorageP2P(state => state.dateOfStorage);
  
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempDeviceId, setTempDeviceId] = useState(deviceId);
 
  const handleSaveDeviceId = useCallback(() => {
    setDeviceId(tempDeviceId);
    setIsEditingId(false);
    startP2P(); 
  }, [setDeviceId, tempDeviceId, startP2P]);

  const handleDisconnect = useCallback((peerId: string) => {
    disconnect(peerId);
  }, [disconnect]);

  const handleStartP2P = useCallback(() => {
    startP2P();
  }, [startP2P]);

  const handleStopP2P = useCallback(() => {
    stopP2P();
  }, [stopP2P]);

  const handleMakeHub = useCallback(() => {
    setIsHub(true);
  }, [setIsHub]);

  const handleMakeClient = useCallback(() => {
    setIsHub(false);
  }, [setIsHub]);

  const handleClearP2P = useCallback(() => {
    clearStorage();
  }, [clearStorage]);

  const handleClearPQ = useCallback(() => {
    clearPriorityQueue();
  }, [clearPriorityQueue]);

  const handleRequestConnection = useCallback(async (peerId: string) => {
    await Nearby.requestConnection(peerId);
  }, []);

  const renderPeerItem = useCallback(({ item }: { item: Nearby.BasePeer }) => { 
    const isCurrentConnected = connectedPeerId === item.peerId;

    return (
      <View style={[styles.card, isCurrentConnected && styles.connectedCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.peerIconContainer}>
            <Ionicons 
              name={isCurrentConnected ? "link" : "phone-portrait-outline"} 
              size={24} 
              color={isCurrentConnected ? "#fff" : "#4A90E2"} 
            />
          </View>
          <View style={styles.peerInfo}>
            <Text style={[styles.peerName, isCurrentConnected && styles.whiteText]}>{item.name}</Text>
            <Text style={[styles.peerId, isCurrentConnected && styles.lightText]}>{item.peerId}</Text>
          </View> 
        </View>

        <View style={styles.cardActions}>
          {isCurrentConnected ? (
            <View style={styles.statusBadgeContainer}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.statusBadgeText}>Connected</Text>
              </View>
              <TouchableOpacity 
                style={styles.disconnectButton} 
                onPress={() => {
                  handleDisconnect(item.peerId); 
                  clearDiscoveredPeers();
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.connectButton} 
              onPress={() => handleRequestConnection(item.peerId)}
            >
              <Text style={styles.connectButtonText}>Connect Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [connectedPeerId, handleDisconnect, handleRequestConnection]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>FCFM Network</Text>
          <Text style={styles.headerTitle}>Connections</Text>
          <Text style={{fontSize: 12, color: "#4A90E2"}}>Date of Storage: {dateOfStorage} </Text>
          <Text style={{fontSize: 12, color: "#4A90E2"}}>Version: 1:03 02/14/2026 </Text>
        </View>
        <TouchableOpacity style={styles.refreshCircle} onPress={handleStartP2P} disabled={isSearching}>
          {isSearching ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <Ionicons name="refresh" size={24} color="#4A90E2" />
          )}
        </TouchableOpacity>
      </View>
 
      <View style={{flexDirection: "row-reverse", justifyContent: "space-around", alignItems: "center"}} > 
        <View style={{
          flexDirection: "row", 
          alignItems: "center",
          marginBottom: 10,
          justifyContent: "flex-end",
          marginRight: 10,
        }}>
          <TouchableOpacity style={{
            backgroundColor: "#4A90E2",
            padding: 10,
            borderRadius: 10, 
            marginRight: 10,
            alignItems: "center",
          }} onPress={handleClearP2P}>
            <Text style={{...styles.sectionTitle, color: "white"}}>Clear P2P Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: "#4A90E2",
            padding: 10,
            borderRadius: 10, 
            alignItems: "center",
            marginRight: 10,
          }} onPress={handleClearPQ}>
            <Text style={{...styles.sectionTitle, color: "white"}}>Clear PQ Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: "#4A90E2",
            padding: 10,
            borderRadius: 10, 
            alignItems: "center",
          }} onPress={async () => {
            if (!connectedPeerId) {
              alert("Connect to a peer first");
              return;
            }
            try{
              await Nearby.sendText(connectedPeerId, "This a test message!");
            }catch(e){
              alert("Error sending message: " + e);
            }
          }}>
            <Text style={{...styles.sectionTitle, color: "white"}}>Test Send Payload</Text>
          </TouchableOpacity>
        </View> 

        <View>   
          <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}> 
            <TouchableOpacity style={{
              backgroundColor: "#4A90E2",
              padding: 10,
              borderRadius: 10, 
              marginRight: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }} onPress={handleMakeHub}>
              {isHub ? <FontAwesome5 name="crown" size={20} style={{marginRight: 10}} color="gold" /> : ""}
              <Text style={{...styles.sectionTitle, color: "white", }}> 
                Make Hub</Text>
            </TouchableOpacity> 
            <TouchableOpacity style={{
              backgroundColor: "#4A90E2",
              padding: 10,
              borderRadius: 10, 
              marginRight: 10,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }} onPress={handleMakeClient}>
              {!isHub ? <FontAwesome5 name="crown" size={18} style={{marginRight: 10}} color="gold" /> : ""}
              <Text style={{...styles.sectionTitle, color: "white"}}>
                Make Client
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.myDeviceSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Identity</Text>
          <TouchableOpacity onPress={() => setIsEditingId(prev => !prev)}>
            <Text style={styles.editAction}>{isEditingId ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
        
        {isEditingId ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={tempDeviceId}
              onChangeText={setTempDeviceId}
              placeholder="Enter Device Name"
              autoFocus
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDeviceId}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.idCard}>
            <Ionicons name="radio-outline" size={32} color="#4A90E2" />
            <View style={styles.idInfo}>
              <Text style={styles.idLabel}>Broadcasting as</Text>
              <Text style={styles.idValue}>{deviceId || "Unknown Device"}</Text>
            </View>
            <View style={styles.idActions}>
              <View style={[styles.pulse, isSearching && styles.pulseActive]} />
              {isSearching && (
                <TouchableOpacity style={styles.stopButton} onPress={handleStopP2P}>
                  <Ionicons name="stop-circle-outline" size={24} color="#ff4d4f" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
  
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isSearching ? "Searching for devices..." : "Available Devices"}
          </Text>
          {isSearching && <ActivityIndicator size="small" color="#999" style={{marginLeft: 10}} />}
        </View>

        <FlatList
          data={[
            {
              peerId: connectedPeerId || "",
              name: connectedPeerName || ""
            },
            ...discoveredPeers
          ].filter(p => p.peerId !== "")
          }
          keyExtractor={(item) => item.peerId}
          renderItem={renderPeerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bluetooth-outline" size={64} color="#eee" />
              <Text style={styles.emptyText}>
                {isSearching ? "Looking for nearby devices..." : "No devices found nearby."}
              </Text>
              {!isSearching && (
                <TouchableOpacity style={styles.retryButton} onPress={handleStartP2P}>
                  <Text style={styles.retryButtonText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    overflow: "scroll",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#212529",
  },
  refreshCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  myDeviceSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#495057",
  },
  editAction: {
    color: "#4A90E2",
    fontWeight: "600",
  },
  idCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  idInfo: {
    marginLeft: 16,
    flex: 1,
  },
  idLabel: {
    fontSize: 12,
    color: "#ADB5BD",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  idValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 16,
  },
  saveButton: {
    marginLeft: 12,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  connectedCard: {
    backgroundColor: "#4A90E2",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  peerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F4F9",
    justifyContent: "center",
    alignItems: "center",
  },
  peerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  peerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  peerId: {
    fontSize: 12,
    color: "#ADB5BD",
    marginTop: 2,
  },
  whiteText: {
    color: "#fff",
  },
  lightText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  starButton: {
    padding: 8,
  },
  cardActions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  connectButton: {
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  connectButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  disconnectButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  idActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  stopButton: {
    padding: 4,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ADB5BD",
    textAlign: "center",
    maxWidth: "80%",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  retryButtonText: {
    color: "#4A90E2",
    fontWeight: "700",
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ADB5BD",
    marginLeft: 8,
  },
  pulseActive: {
    backgroundColor: "#52c41a",
  },
});