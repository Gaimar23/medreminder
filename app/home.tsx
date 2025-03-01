import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { Link } from "expo-router";

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

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Daily Progress</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
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
          <CircularProgress progress={50} totalDoses={10} completeDoses={5} />
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
      <View>
        <View>
          <Text>Today's schedule</Text>
          <Link href={"/calendar"}>
            <Text>See All</Text>
          </Link>
        </View>
        {true ? (
          <View>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text>No Medications scheduled for today</Text>
            <Link href="/medications/add">
              <TouchableOpacity>
                <Text>Add Medication</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View>
            <Text>Medications scheduled</Text>
            {medicationList.map((medication) => {
              // const taken =""
              return (
                <View>
                  <View>
                    <Ionicons name="medical" size={24} />
                  </View>
                  <View>
                    <View>
                      <Text>name</Text>
                      <Text>Dosage</Text>
                    </View>
                    <View>
                      <Ionicons name="time-outline" size={16} />
                      <Text>time</Text>
                    </View>
                  </View>
                  {true ? (
                    <TouchableOpacity>
                      <Ionicons name="checkmark-circle-outline" size={16} />
                      <Text>Taken</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity>
                      <Ionicons name="close-circle-outline" size={16} />
                      <Text>Take</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1a8e2d",
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
});
