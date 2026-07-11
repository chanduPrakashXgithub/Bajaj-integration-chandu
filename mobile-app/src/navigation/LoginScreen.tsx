import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Building2, User, KeyRound } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { apiClient } from "../services/api/client";
import { colors, spacing, borderRadius, fontSize, shadows } from "../theme/theme";

export function LoginScreen() {
  const { login, loading } = useApp();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [resetErrorMessage, setResetErrorMessage] = useState("");

  const testUsers = [
    { label: "Regional Manager (RM)", email: "ravi@gmail.com", password: "ravi123", role: "RM" },
    { label: "Branch Manager (BAM)", email: "pachari@gmail.com", password: "am123", role: "BAM" },
    { label: "Admin Assistant (AA)", email: "g.teja@gmail.com", password: "aa123", role: "AA" },
    { label: "Local Coordinator (LC)", email: "lc.addanki@gmail.com", password: "lc123", role: "LC" },
  ];

  const handleQuickInject = (testEmail: string, testPassword?: string) => {
    setEmail(testEmail);
    setPassword(testPassword || "");
    setEmailError("");
    setPasswordError("");
  };

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 5) {
      setPasswordError("Password must be at least 5 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    await login(email, password);
  };

  const handleResetPassword = async () => {
    let isValid = true;

    setResetEmailError("");
    setVerificationCodeError("");
    setNewPasswordError("");
    setResetSuccessMessage("");
    setResetErrorMessage("");

    if (!resetEmail) {
      setResetEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!verificationCode) {
      setVerificationCodeError("Verification code is required");
      isValid = false;
    } else if (verificationCode.trim() !== "656565") {
      setVerificationCodeError("Invalid code. Access code is 656565");
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      isValid = false;
    } else if (newPassword.length < 5) {
      setNewPasswordError("Password must be at least 5 characters");
      isValid = false;
    }

    if (!isValid) return;

    setResetLoading(true);
    try {
      const response = await apiClient.post("/auth/reset-password", {
        email: resetEmail.toLowerCase().trim(),
        code: verificationCode.trim(),
        newPassword: newPassword
      });

      setResetSuccessMessage(response.data.message || "Password reset successful!");
      setTimeout(() => {
        setIsForgotMode(false);
        setEmail(resetEmail);
        setPassword("");
        setResetEmail("");
        setVerificationCode("");
        setNewPassword("");
        setResetSuccessMessage("");
      }, 2500);
    } catch (error: any) {
      console.error("Reset password failed: ", error);
      const msg = error.response?.data?.message || "Failed to reset password. Please try again.";
      setResetErrorMessage(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background gradients */}
      <LinearGradient
        colors={["#003D7A", "#005BAC", "#008DD2"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "transparent"]}
        locations={[0, 0.4]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isTablet && styles.tabletScroll]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.loginCard, isTablet && styles.tabletCard]}>
            {/* Header / Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <Building2 size={30} color={colors.brand} strokeWidth={2.2} />
              </View>
              <Text style={styles.appTitle}>Bajaj Operations</Text>
              <Text style={styles.appSubtitle}>Facilities, Attendance & Budget Control</Text>
            </View>

            {!isForgotMode ? (
              <>
                {/* Input Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Corporate Email</Text>
                  <View style={[styles.inputWrapper, emailError ? styles.wrapperError : null]}>
                    <Mail size={16} color={colors.slate400} style={styles.inputIcon} />
                    <TextInput
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="name@gmail.com"
                      placeholderTextColor={colors.slate400}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                  {emailError ? (
                    <View style={styles.errorContainer}>
                      <ShieldAlert size={12} color={colors.error} />
                      <Text style={styles.errorText}>{emailError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Input Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Security Password</Text>
                  <View style={[styles.inputWrapper, passwordError ? styles.wrapperError : null]}>
                    <Lock size={16} color={colors.slate400} style={styles.inputIcon} />
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="•••••••••"
                      placeholderTextColor={colors.slate400}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                      activeOpacity={0.7}
                    >
                      {showPassword ? (
                        <EyeOff size={16} color={colors.slate500} />
                      ) : (
                        <Eye size={16} color={colors.slate500} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <View style={styles.errorContainer}>
                      <ShieldAlert size={12} color={colors.error} />
                      <Text style={styles.errorText}>{passwordError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={() => {
                    setIsForgotMode(true);
                    setResetEmail(email);
                    setResetErrorMessage("");
                    setResetSuccessMessage("");
                  }}
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSignIn}
                  style={[styles.btnSignIn, loading && styles.btnDisabled]}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.btnSignInText}>Sign In to Console</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Testing Accounts</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Quick inject tags */}
                <Text style={styles.quickLabel}>Tap below to quick-fill credentials:</Text>
                <View style={styles.quickUsersGrid}>
                  {testUsers.map((user) => (
                    <TouchableOpacity
                      key={user.email}
                      onPress={() => handleQuickInject(user.email, user.password)}
                      style={styles.quickUserPill}
                      activeOpacity={0.7}
                    >
                      <User size={10} color={colors.brand} strokeWidth={2.5} />
                      <Text style={styles.quickUserPillText}>{user.role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.formSectionTitle}>Reset Security Password</Text>
                <Text style={styles.formSectionSubtitle}>Enter your corporate email and verification code to reset your password.</Text>

                {resetSuccessMessage ? (
                  <View style={styles.successContainer}>
                    <Text style={styles.successText}>{resetSuccessMessage}</Text>
                  </View>
                ) : null}

                {resetErrorMessage ? (
                  <View style={styles.errorBanner}>
                    <ShieldAlert size={16} color={colors.error} />
                    <Text style={styles.errorBannerText}>{resetErrorMessage}</Text>
                  </View>
                ) : null}

                {/* Reset Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Corporate Email</Text>
                  <View style={[styles.inputWrapper, resetEmailError ? styles.wrapperError : null]}>
                    <Mail size={16} color={colors.slate400} style={styles.inputIcon} />
                    <TextInput
                      value={resetEmail}
                      onChangeText={(text) => {
                        setResetEmail(text);
                        if (resetEmailError) setResetEmailError("");
                      }}
                      placeholder="name@gmail.com"
                      placeholderTextColor={colors.slate400}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                  {resetEmailError ? (
                    <View style={styles.errorContainer}>
                      <ShieldAlert size={12} color={colors.error} />
                      <Text style={styles.errorText}>{resetEmailError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Verification Code Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code (656565)</Text>
                  <View style={[styles.inputWrapper, verificationCodeError ? styles.wrapperError : null]}>
                    <KeyRound size={16} color={colors.slate400} style={styles.inputIcon} />
                    <TextInput
                      value={verificationCode}
                      onChangeText={(text) => {
                        setVerificationCode(text);
                        if (verificationCodeError) setVerificationCodeError("");
                      }}
                      placeholder="Enter verification code"
                      placeholderTextColor={colors.slate400}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                  {verificationCodeError ? (
                    <View style={styles.errorContainer}>
                      <ShieldAlert size={12} color={colors.error} />
                      <Text style={styles.errorText}>{verificationCodeError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* New Security Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Security Password</Text>
                  <View style={[styles.inputWrapper, newPasswordError ? styles.wrapperError : null]}>
                    <Lock size={16} color={colors.slate400} style={styles.inputIcon} />
                    <TextInput
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (newPasswordError) setNewPasswordError("");
                      }}
                      placeholder="•••••••••"
                      placeholderTextColor={colors.slate400}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.passwordToggle}
                      activeOpacity={0.7}
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} color={colors.slate500} />
                      ) : (
                        <Eye size={16} color={colors.slate500} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {newPasswordError ? (
                    <View style={styles.errorContainer}>
                      <ShieldAlert size={12} color={colors.error} />
                      <Text style={styles.errorText}>{newPasswordError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Submit Reset Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={[styles.btnSignIn, resetLoading && styles.btnDisabled]}
                  activeOpacity={0.8}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.btnSignInText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Login link */}
                <TouchableOpacity
                  onPress={() => {
                    setIsForgotMode(false);
                    setResetErrorMessage("");
                    setResetSuccessMessage("");
                  }}
                  style={styles.backToLoginButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToLoginText}>← Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#003D7A",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  tabletScroll: {
    alignItems: "center",
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: borderRadius["4xl"],
    padding: spacing["3xl"],
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  tabletCard: {
    maxWidth: 460,
    marginTop: spacing["5xl"],
    marginBottom: spacing["5xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  appTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: fontSize["4xl"],
    color: colors.slate900,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: fontSize.xs,
    color: colors.slate500,
    marginTop: spacing.xs,
    fontWeight: "600",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.slate700,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: borderRadius.xl,
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  wrapperError: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.02)",
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.slate800,
    fontWeight: "500",
    height: "100%",
  },
  passwordToggle: {
    padding: spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    fontWeight: "600",
  },
  btnSignIn: {
    backgroundColor: colors.brand,
    borderRadius: borderRadius.xl,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: colors.slate400,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnSignInText: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing["2xl"],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.slate200,
  },
  dividerText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.slate400,
    marginHorizontal: spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.slate500,
    marginBottom: spacing.md,
  },
  quickUsersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quickUserPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: "rgba(0, 91, 172, 0.12)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  quickUserPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.brand,
    textDecorationLine: "underline",
  },
  formSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  formSectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.slate500,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 16,
  },
  successContainer: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  successText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: "700",
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  errorBannerText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.error,
    fontWeight: "700",
  },
  backToLoginButton: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  backToLoginText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.slate500,
  },
});
