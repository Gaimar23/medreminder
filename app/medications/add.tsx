import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const FREQUENCIES = [
  {
    id: "1",
    label: "Once daily",
    icon: "sunny-outline" as const,
    times: ["09:00"],
  },
  {
    id: "2",
    label: "Twice daily",
    icon: "time-outline" as const,
    times: ["09:00", "21:00"],
  },
  {
    id: "3",
    label: "Three times daily",
    icon: "sunny-outline" as const,
    times: ["09:00", "15:00", "21:00"],
  },
  {
    id: "4",
    label: "Four times daily",
    icon: "repeat-outline" as const,
    times: ["09:00", "13:00", "17:00", "21:00"],
  },
];

const DURATIONS = [
  { id: "1", label: "7 days", value: 7 },
  { id: "2", label: "14 days", value: 14 },
  { id: "3", label: "30 days", value: 30 },
  { id: "4", label: "90 days", value: 90 },
  { id: "5", label: "Ongoing", value: -1 },
];

const { width } = Dimensions.get("window");

export default function AddMedicationScreen() {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: new Date(),
    times: ["09:00"],
    notes: "",
    reminderEnable: true,
    refillReminder: false,
    currentSupply: "",
    refillAt: "",
  });

  const [errors, setErrors] = useState<{ [Key: string]: string }>({});
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const renderFrequencyOptions = () => {
    return (
      <View style={styles.optionsGrid}>
        {FREQUENCIES.map((freq) => {
          return (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.optionsCard,
                selectedFrequency === freq.label && styles.selectedOptionCard,
              ]}
              onPress={() => setSelectedFrequency(freq.label)}
            >
              <View
                style={[
                  styles.optionIcon,
                  selectedFrequency === freq.label &&
                    styles.selectiedOptionIcon,
                ]}
              >
                <Ionicons
                  name={freq.icon}
                  size={24}
                  color={selectedFrequency === freq.label ? "white" : "#666"}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    selectedFrequency === freq.label &&
                      styles.selectedOptionLabel,
                  ]}
                >
                  {freq.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDurationOptions = () => {
    return (
      <View style={styles.optionsGrid}>
        {DURATIONS.map((duration) => {
          return (
            <TouchableOpacity
              key={duration.id}
              style={[
                styles.optionsCard,
                selectedDuration === duration.label &&
                  styles.selectedOptionCard,
              ]}
            >
              <Text
                style={[
                  styles.durationNumber,
                  selectedDuration === duration.label &&
                    styles.selectedDurationNumber,
                ]}
              >
                {duration.value > 0 ? duration.value : "∞"}
              </Text>
              <Text
                style={[
                  styles.optionLabel,
                  selectedDuration === duration.label &&
                    styles.selectedOptionLabel,
                ]}
              >
                {duration.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) {
      newErrors.name = "Medication name is required";
    }
    if (!form.dosage.trim()) {
      newErrors.dosage = "Medication dosage is required";
    }
    if (!form.frequency.trim()) {
      newErrors.frequency = "Medication frequency is required";
    }
    if (!form.duration.trim()) {
      newErrors.duration = "Medication duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A8E2D", "#146922"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      ></LinearGradient>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#1A8E2D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Medication</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={styles.formContentContainer}
        >
          <View style={styles.section}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Medication name"
                placeholderTextColor={"#A999"}
                style={[styles.mainInput, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(value) => {
                  setForm({ ...form, name: value });
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Dosage ex: 500mg"
                placeholderTextColor={"#A999"}
                style={[styles.mainInput, errors.dosage && styles.inputError]}
                value={form.dosage}
                onChangeText={(value) => {
                  setForm({ ...form, dosage: value });
                  if (errors.dosage) {
                    setErrors({ ...errors, dosage: "" });
                  }
                }}
              />
              {errors.dosage && (
                <Text style={styles.errorText}>{errors.dosage}</Text>
              )}
            </View>

            {/* Schedule */}

            <View style={styles.container}>
              <Text style={styles.sectionTitle}>How often ?</Text>
              {errors.frequency && (
                <Text style={styles.errorText}>{errors.frequency}</Text>
              )}

              {renderFrequencyOptions()}

              <Text style={styles.sectionTitle}>For how long ?</Text>
              {errors.duration && (
                <Text style={styles.errorText}>{errors.duration}</Text>
              )}
              {renderDurationOptions()}

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar" size={20} color="#1A8E2D" />
                </View>
                <Text style={styles.dateButtonText}>
                  Starts: {form.startDate.toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={form.startDate}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setForm({ ...form, startDate: date });
                  }}
                />
              )}

              {form.frequency && form.frequency !== "As needed" && (
                <View style={styles.timesContainer}>
                  <Text style={styles.timesTitle}>Medication times</Text>
                  {form.times.map((time: string, index: number) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setShowTimePicker(true)}
                        style={styles.timeButton}
                      >
                        <View style={styles.timeIconContainer}>
                          <Ionicons
                            name="time-outline"
                            size={20}
                            color="#1A8E2D"
                          />
                        </View>
                        <Text style={styles.timeButtonText}>{time}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {showTimePicker && (
                <DateTimePicker
                  mode="time"
                  value={(() => {
                    const [hours, minutes] = form.times[0]
                      .split(":")
                      .map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    return date;
                  })()}
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) {
                      const newTime = date.toLocaleTimeString("default", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });
                      setForm((prev) => ({
                        ...prev,
                        times: prev.times.map((t, i) =>
                          i === 0 ? newTime : t
                        ),
                      }));
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <View style={styles.IconContainer}>
                    <Ionicons name="notifications" size={24} color="#1A8E2D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>Reminders</Text>
                    <Text style={styles.switchSubLabel}>
                      Get notified when it's time to take your drug
                    </Text>
                  </View>
                </View>
                <Switch
                  value={form.reminderEnable}
                  thumbColor={"white"}
                  trackColor={{ false: "#ddd", true: "#1A8E2D" }}
                  onValueChange={(value) => {
                    setForm({ ...form, reminderEnable: value });
                  }}
                  style={{ position: "absolute", top: -10, right: 0 }}
                />
              </View>
            </View>
          </View>

          {/* Refill Tracking */}

          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.textAreaContainer}>
              <TextInput
                placeholder="Add notes"
                placeholderTextColor={"#999"}
                style={styles.textArea}
                value={form.notes}
                onChangeText={(value) => setForm({ ...form, notes: value })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={["#1A8E2D", "#146922"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Adding..." : "Add Medication"}{" "}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            disabled={isSubmitting}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
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

  formContentContainer: {
    padding: 20,
  },

  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 15,
    marginTop: 10,
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mainInput: {
    fontSize: 20,
    color: "#333",
    padding: 15,
  },
  inputError: { borderColor: "#FF5252" },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  optionsCard: {
    width: (width - 60) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    backgroundColor: "#1A8E2D",
    borderColor: "#1A8E2D",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectiedOptionIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    width: 100,
  },
  selectedOptionLabel: {
    color: "white",
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A8E2D",
    marginBottom: 5,
  },
  selectedDurationNumber: {
    color: "white",
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  timesContainer: {
    marginTop: 20,
  },
  timesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  timeButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  IconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchSubLabel: {
    fontSize: 13,
    marginTop: 2,
    color: "#666",
  },
  textAreaContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c0c0c0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 100,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#c0c0c0",
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c0c0c0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
