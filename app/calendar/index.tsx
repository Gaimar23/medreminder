import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  DosageHistory,
  getDoseHistory,
  getMedications,
  Medication,
  recordDose,
} from "@/utilis/storage";
import { useFocusEffect } from "@react-navigation/native";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DosageHistory[]>([]);

  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [meds, history] = await Promise.all([
        getMedications(),
        getDoseHistory(),
      ]);

      setMedications(meds);
      setDoseHistory(history);
    } catch (error) {
      console.log("Error while loading data");
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(selectedDate);

  const renderCalendar = () => {
    const calendar: JSX.Element[] = [];
    let week: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth()
      );

      const isToday = new Date().toDateString() === date.toDateString();
      const hasDoses = doseHistory.some(
        (dose) =>
          new Date(dose.timestamp).toDateString() === date.toDateString()
      );

      week.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.today,
            hasDoses && styles.hasEvents,
          ]}
        >
          <Text style={[styles.dayText, isToday && styles.todayText]}>
            {day}
          </Text>
          {hasDoses && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        calendar.push(
          <View key={day} style={styles.calendarWeek}>
            {week}
          </View>
        );
        week = [];
      }
    }

    return calendar;
  };

  const renderMedicationsForDate = () => {
    const dateStr = selectedDate.toDateString();
    const dayDoses = doseHistory.filter(
      (dose) => new Date(dose.timestamp).toDateString() === dateStr
    );

    return medications.map((med) => {
      const taken = dayDoses.some(
        (dose) => dose.medicationId === med.id && dose.taken
      );
      return (
        <View>
          <View />
          <View>
            <Text style={styles.medicationName}>{med.name}</Text>
            <Text style={styles.medicationDosage}>{med.dosage}</Text>
            <Text style={styles.medicationTime}>{med.times[0]}</Text>
          </View>
          {taken ? (
            <View style={styles.takenBadge}>
              <Ionicons name={"checkmark-circle"} size={20} color="#4CAF50" />
              <Text style={styles.takenText}>Taken</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={async () => {
                await recordDose(med.id, true, new Date().toDateString());
                loadData();
              }}
            >
              <Text style={styles.takeDoseText}>Take</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a8e2d", "#146922"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      ></LinearGradient>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name={"chevron-back"} size={26} color="#1A8E2D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
      </View>
      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() - 1,
                  1
                )
              )
            }
          >
            <Ionicons name={"chevron-back"} size={24} color="#1A8E2D" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setSelectedDate(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                  1
                )
              )
            }
          >
            <Ionicons name={"chevron-forward"} size={24} color="#1A8E2D" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekDaysHeader}>
          {WEEKDAYS.map((day) => {
            return (
              <Text key={day} style={styles.weekDaysText}>
                {day}
              </Text>
            );
          })}
        </View>
        {/* Render the calendar */}
        {renderCalendar()}
      </View>
      <View>
        <Text>
          {selectedDate.toLocaleString("default", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <ScrollView>{/* render medications for the given day */}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerGradient: {
    position: "absolute",
    left: 0,
    top: 0,
    height: Platform.OS === "ios" ? 140 : 120,
    right: 0,
  },
  content: {
    // flex: 1,
    paddingTop: Platform.OS === "ios" ? 45 : 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginLeft: 15,
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  weekDaysHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekDaysText: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  calendarWeek: {
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "flex-start",
    gap: 2,
  },
  calendarDay: {
    // flex: 1,
    // aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    // backgroundColor: "red",
    width: 40,
    height: 40,
  },
  today: {
    backgroundColor: "#1A8E2D15",
  },
  todayText: {
    color: "#1A8E2D",
    fontWeight: "600",
  },
  hasEvents: {
    position: "relative",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1A8E2D",
    position: "absolute",
    bottom: "15%",
  },
});
