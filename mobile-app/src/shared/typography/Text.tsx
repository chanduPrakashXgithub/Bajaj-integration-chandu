import React, { ReactNode } from "react";
import { Text as RNText, TextProps } from "react-native";
import { colors, fontSize } from "../../theme/theme";

const FONT_FAMILY = "Manrope_400Regular";
const FONT_SEMIBOLD = "Manrope_600SemiBold";
const FONT_EXTRABOLD = "Manrope_800ExtraBold";

interface TypographyProps extends TextProps {
  children: ReactNode;
}

// Heading: extrabold, large size, tight letter-spacing
export function Heading({
  style,
  children,
  ...props
}: TypographyProps & { size?: "lg" | "xl" }) {
  return (
    <RNText
      style={[
        {
          fontFamily: FONT_EXTRABOLD,
          fontSize: fontSize["4xl"],
          color: colors.slate900,
          letterSpacing: -0.5,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Subheading: semibold, md-lg size
export function Subheading({ style, children, ...props }: TypographyProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: FONT_SEMIBOLD,
          fontSize: fontSize.lg,
          color: colors.slate900,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Body: regular weight, base size
export function Body({ style, children, ...props }: TypographyProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: FONT_FAMILY,
          fontSize: fontSize.base,
          color: colors.text,
          lineHeight: 20,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Label: semibold, uppercase, tracking-wide, small
export function Label({ style, children, ...props }: TypographyProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: FONT_SEMIBOLD,
          fontSize: fontSize.xs,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Caption: regular, extra small
export function Caption({ style, children, ...props }: TypographyProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: FONT_FAMILY,
          fontSize: fontSize.xs,
          color: colors.textSecondary,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
