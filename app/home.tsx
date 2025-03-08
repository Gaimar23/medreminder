import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { Link, useRouter } from "expo-router";
import {
  DosageHistory,
  getMedications,
  getTodaysDoses,
  Medication,
  recordDose,
} from "@/utilis/storage";
import {
  registerForPushNotificationsAsync,
  scheduleMedicationReminder,
} from "@/utilis/notifications";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface CircularProgressProps {
  progress: number;
  totalDoses: number;
  completeDoses: number;
}

const QUICK_ACTIONS = [
  {
    icon: "add-circle-outline" as const,
    label: "Add\nMedication",
    route: "/medications/add" as const,
    color: "#2E7D32",
    gradient: ["#4CAF50", "#2E7D32"] as [string, string],
  },
  {
    icon: "calendar-outline" as const,
    label: "Calendar\nView",
    route: "/calendar" as const,
    color: "#1976D2",
    gradient: ["#2196F3", "#1976D2"] as [string, string],
  },
  {
    icon: "time-outline" as const,
    label: "History\nLog",
    route: "/history" as const,
    color: "#C2185B",
    gradient: ["#E91E63", "#C2185B"] as [string, string],
  },
  {
    icon: "medical-outline" as const,
    label: "Refill\nTracker",
    route: "/refills" as const,
    color: "#E64A19",
    gradient: ["#FF5722", "#E64A19"] as [string, string],
  },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularProgress({
  progress,
  totalDoses,
  completeDoses,
}: CircularProgressProps) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.55;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffSet = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progessPercentage}>{Math.round(progress)}%</Text>
        <Text style={styles.progressLabel}>
          {completeDoses} of {totalDoses} doses
        </Text>
      </View>
      <Svg width={size} height={size} style={styles.progressRing}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={"rgba(255,255,255,0.2)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={"rgba(255, 255, 255, 0.85)"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffSet}
          strokeLinecap={"round"}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const [medicationList, setmedicationList] = useState();
  const [todaysMedications, setTodaysMedications] = useState<Medication[]>([]);
  const [completedDoses, setCompletedDoses] = useState(0);
  const [doseHistory, setDoseHistory] = useState<DosageHistory[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();

  const loadMedications = useCallback(async () => {
    try {
      const [allMedications, todaysDoses] = await Promise.all([
        getMedications(),
        getTodaysDoses(),
      ]);

      setDoseHistory(todaysDoses);
      setMedications(allMedications);

      const today = new Date();

      const todayMeds = allMedications.filter((med) => {
        const startDate = new Date(med.startDate);
        const durationsDays = parseInt(med.duration.split(" ")[0]);

        if (
          durationsDays === -1 ||
          (today >= startDate &&
            today <=
              new Date(
                startDate.getTime() + durationsDays * 24 * 60 * 60 * 1000
              ))
        ) {
          return true;
        } else {
          return false;
        }
      });

      setTodaysMedications(todayMeds);

      const completed = todaysDoses.filter((dose) => dose.taken).length;

      setCompletedDoses(completed);
    } catch (error) {
      console.log("Error while loading data", error);
    }
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.log("Failed to get push notifications token");
        return;
      }

      // schedule reminders for all medications
      const medications = await getMedications();
      for (const medication of medications) {
        if (medication.reminderEnable) {
          await scheduleMedicationReminder(medication);
        }
      }
    } catch (error) {
      console.log("Error while scheduling reminders for all notifications");
    }
  };

  useEffect(() => {
    loadMedications();
    setupNotifications();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        loadMedications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = () => {
        // Clean up if necessary
      };

      loadMedications();

      return () => {
        unsubscribe();
      };
    }, [loadMedications])
  );

  const handleTakeDose = async (medication: Medication) => {
    try {
      await recordDose(medication.id, true, new Date().toISOString());
      await loadMedications();
    } catch (error) {
      console.log("Error recording dose", error);
      Alert.alert("Error", "Failed to record dose. Please try again");
    }
  };

  const isDoseTaken = (medicationId: string) => {
    return doseHistory.some(
      (dose) => dose.medicationId === medicationId && !dose.taken
    );
  };

  const progress =
    todaysMedications.length > 0
      ? completedDoses / (todaysMedications.length * 2)
      : 0;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Daily Progress</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons
                name={"notifications-outline"}
                size={24}
                color="white"
              />
              {
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}></Text>
                </View>
              }
            </TouchableOpacity>
          </View>
          {/* Circular progress */}
          <CircularProgress
            progress={progress}
            totalDoses={todaysMedications.length * 2}
            completeDoses={completedDoses}
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => {
              return (
                <Link href={action.route} key={action.label} asChild>
                  <TouchableOpacity style={styles.actionButton}>
                    <LinearGradient colors={action.gradient}>
                      <View style={styles.actionGradient}>
                        <View style={styles.actionIcon}>
                          <Ionicons
                            name={action.icon}
                            size={24}
                            color="white"
                          />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </View>
      </View>

      {/* Today's medication */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's schedule</Text>
          <Link href={"/calendar"} asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {todaysMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text
              style={{ marginVertical: 10, color: "#666", marginBottom: 20 }}
            >
              No Medications scheduled for today
            </Text>
            <Link href="/medications/add">
              <TouchableOpacity style={styles.addMedicationButton}>
                <Text style={styles.addMedicationButtonText}>
                  Add Medication
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View>
            <Text>Medications scheduled</Text>
            {todaysMedications.map((medication) => {
              const taken = isDoseTaken(medication.id);
              return (
                <View style={styles.doseCard} key={medication.id}>
                  <View
                    style={[
                      styles.doseBadge,
                      { backgroundColor: `${medication.color}15` },
                    ]}
                  >
                    <Ionicons name="medical" size={24} />
                  </View>
                  <View style={styles.doseInfo}>
                    <View>
                      <Text style={styles.medicineName}>{medication.name}</Text>
                      <Text style={styles.dosageInfo}>{medication.dosage}</Text>
                    </View>
                    <View style={styles.doseTime}>
                      <Ionicons name="time-outline" size={16} />
                      <Text style={styles.timeText}>{medication.times[0]}</Text>
                    </View>
                  </View>
                  {taken ? (
                    <TouchableOpacity
                      style={[
                        styles.takeDoseButton,
                        { backgroundColor: medication.color },
                      ]}
                      onPress={() => handleTakeDose(medication)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} />
                      <Text style={styles.takeDoseText}>Taken</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.takeDoseButton}>
                      {/* <Ionicons name="close-circle-outline" size={16} /> */}
                      <Text style={styles.takeDoseText}>Take</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal or pop up */}

      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
          >
            <Text style={styles.modalTItle}>Notification</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNotifications(false)}
            >
              <Ionicons name="close" size={24} color={"#333"} />
            </TouchableOpacity>
          </View>
          {todaysMedications.map((medication) => {
            return (
              <View style={styles.notificationItem} key={medication.id}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="medical" size={24} color={"#333"} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {medication.name}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {medication.dosage}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {medication.times[0]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginLeft: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff5252",
    borderRadius: 10,
    padding: 4,
    height: 20,
    minWidth: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#146922",
  },
  notificationCount: {
    fontSize: 11,
    color: "white",
    fontWeight: "bold",
  },
  progressDetail: {
    fontSize: 11,
    color: "white",
    fontWeight: "bold",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressTextContainer: {
    position: "absolute",
    // zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progessPercentage: {
    fontSize: 36,
    color: "rgb(255, 255, 255)",
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "bold",
  },
  progressRing: {
    transform: [{ rotate: "-90deg" }],
  },

  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 5,
  },
  actionButton: {
    width: (width - 52) / 2,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionGradient: {
    // flex: 1,
    padding: 15,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
    color: "white",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  seeAllButton: {
    color: "#2E7D32",
    fontWeight: "600",
  },

  emptyState: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },

  addMedicationButton: {
    backgroundColor: "#1A8E2D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMedicationButtonText: {
    color: "white",
    fontWeight: "600",
  },
  doseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  doseBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  doseInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dosageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  doseTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  takeDoseButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  takeDoseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // styling the modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTItle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: { padding: 5 },
  notificationItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
});
