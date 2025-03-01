import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // const { width } = Dimensions.get("window");

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(hasHardware && isEnrolled);
  };

  const authenticate = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      // HandleSupported types
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage:
          hasHardware && isEnrolled ? "Use face ID/TouchID" : "Enter your PIN",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (auth.success) {
        router.replace("/home");
      } else {
        setError("Authentication failed, please try again");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <LinearGradient colors={["#4CAF50", "#2E7032"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={80} color="white" />
        </View>
        <Text style={styles.title}>MedRminder</Text>
        <Text style={styles.subtitle}>Your personal Medication Assistant</Text>
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.intructionText}>
            {hasBiometrics
              ? "Use face ID/TouchID or PIN to access your App"
              : "Enter your to access your Medication"}
          </Text>
          <TouchableOpacity
            style={[styles.button, isAuthenticating && styles.buttonDisabled]}
            onPress={authenticate}
            disabled={isAuthenticating}
          >
            <Ionicons
              name={hasBiometrics ? "finger-print-outline" : "keypad-outline"}
              size={24}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isAuthenticating
                ? "Verifying..."
                : hasBiometrics
                ? "Authenticate"
                : "Enter PIN"}
            </Text>
          </TouchableOpacity>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="white" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 60,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  subtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 40,
    textAlign: "center",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    width: width - 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  intructionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  errorText: {
    color: "#ffebee",
    marginLeft: 8,
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 10,
  },
});
