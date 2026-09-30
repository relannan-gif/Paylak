import React from "react";
import { View, Text, Pressable, TextInput, Platform, type TextStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useStore } from "./store";
const paths: Record<string, string> = {
  home: "M3 10L12 3l9 7v10h-6v-6H9v6H3z",
  send: "M21 3L3 10l8 3 3 8z M11 13l10-10",
  add: "M12 5v14M5 12h14",
  card: "M3 8h18M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2M6 15h4",
  cash: "M12 22s8-8 8-14a8 8 0 00-16 0c0 6 8 14 8 14z M9 8a3 3 0 106 0 3 3 0 10-6 0",
  services: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  help: "M5 16v-5a7 7 0 0114 0v5M5 12H3v6h3v-6M19 12h2v6h-3v-6M18 18c0 3-3 3-6 3",
  user: "M8 7a4 4 0 108 0 4 4 0 10-8 0M4 21v-2a8 8 0 0116 0v2",
  clock: "M12 8v5l3 2M2 12a10 10 0 1020 0 10 10 0 10-20 0",
  arrow: "M12 3v18M6 15l6 6 6-6",
  check: "M5 12l4 4L20 5",
  close: "M5 5l14 14M19 5L5 19",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 106 0 3 3 0 10-6 0",
  freeze: "M12 2v20M3 7l18 10M3 17L21 7M8 4l4 4 4-4M8 20l4-4 4 4",
  phone: "M7 2h10v20H7zM10 18h4",
  globe:
    "M2 12a10 10 0 1020 0 10 10 0 10-20 0M2 12h20M12 2c-6 5-6 15 0 20 6-5 6-15 0-20",
  lock: "M5 10h14v11H5zM8 10V6a4 4 0 018 0v4",
  receipt: "M5 2h14v20l-3-2-4 2-4-2-3 2zM8 7h8M8 11h8M8 15h5",
  search: "M3 10a7 7 0 1014 0 7 7 0 10-14 0M15 15l6 6",
  bell: "M4 17h16l-2-3V9a6 6 0 00-12 0v5zM10 21h4",
  pocket: "M4 4h16v10a8 8 0 01-16 0zM8 9l4 3 4-3",
  business: "M3 8h18v13H3zM8 8V3h8v5M3 13h18",
  swap: "M3 7h17l-4-4M21 17H4l4 4",
  moon: "M20 15A9 9 0 119 3a8 8 0 0011 12",
  download: "M12 2v12M7 9l5 5 5-5M3 16v5h18v-5",
};
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const { theme } = useStore();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name] || paths.services}
        stroke={color || theme.text}
        strokeWidth={1.65}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Mark({
  size = 32,
  color = "#315DDB",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        fill={color}
        d="M10 8h30c10 0 16 7 16 17s-6 17-16 17H25V30h14c3 0 5-2 5-5s-2-5-5-5H22v36H10zM29 46h12v10H29z"
      />
    </Svg>
  );
}
export function Txt({
  children,
  size = 15,
  weight = "400",
  muted = false,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: TextStyle["fontWeight"];
  muted?: boolean;
  style?: TextStyle;
}) {
  const { theme, rtl } = useStore();
  return (
    <Text
      style={[
        {
          color: muted ? theme.muted : theme.text,
          fontSize: size,
          fontFamily: Platform.OS === "web" ? (weight === "bold" || Number(weight) >= 600 ? "PaylakBold" : "PaylakRegular") : undefined,
          fontWeight: Platform.OS === "web" ? "400" : weight,
          lineHeight: size * 1.45,
          textAlign: rtl ? "right" : "left",
          writingDirection: rtl ? "rtl" : "ltr",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const { rtl } = useStore();
  return (
    <View
      style={[
        {
          flexDirection: rtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const { theme } = useStore();
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: 20,
          padding: 20,
          gap: 14,
          borderWidth: 1,
          borderColor: theme.line,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  const { theme } = useStore();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        backgroundColor: secondary ? theme.elevated : theme.button,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      })}
    >
      <Txt
        weight="600"
        style={{
          color: secondary ? theme.text : "#FFFFFF",
          textAlign: "center",
        }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
export function Cell({
  icon,
  title,
  sub,
  right,
  onPress,
  testID,
}: {
  icon: string;
  title: string;
  sub?: string;
  right?: string;
  onPress?: () => void;
  testID?: string;
}) {
  const { theme, rtl } = useStore();
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={sub ? `${title}, ${sub}` : title}
      onPress={onPress}
      testID={testID}
      style={{
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.line,
        minHeight: 68,
      }}
    >
      <Row>
        <View
          style={{
            width: 42,
            height: 42,
            backgroundColor: theme.elevated,
            borderRadius: 13,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name={icon} size={20} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt weight="500">{title}</Txt>
          {sub && (
            <Txt size={12} muted>
              {sub}
            </Txt>
          )}
        </View>
        {right && (
          <Txt size={14} weight="600">
            {right}
          </Txt>
        )}
        {onPress && (
          <View style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}>
            <Icon name="chevron" size={16} color={theme.muted} />
          </View>
        )}
      </Row>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder = "",
  numeric = false,
  error,
  testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  error?: string;
  testID?: string;
}) {
  const { theme, rtl } = useStore();
  return (
    <View style={{ gap: 8 }}>
      <Txt size={13} weight="500">
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={numeric ? "decimal-pad" : "default"}
        autoCapitalize="none"
        style={{
          color: theme.text,
          backgroundColor: theme.surface,
          borderColor: error ? theme.danger : theme.line,
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          fontSize: numeric ? 28 : 16,
          textAlign: numeric ? "left" : rtl ? "right" : "left",
          minHeight: 54,
        }}
      />
      {error && (
        <Txt size={13} style={{ color: theme.danger }}>
          {error}
        </Txt>
      )}
    </View>
  );
}
export function Tag({ label }: { label: string }) {
  const { theme } = useStore();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: theme.soft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
      }}
    >
      <Txt size={11} weight="600" style={{ color: theme.accent }}>
        {label}
      </Txt>
    </View>
  );
}
export function CardArt() {
  const { t, frozen } = useStore();
  return (
    <View
      style={{
        backgroundColor: "#101C31",
        borderRadius: 18,
        padding: 24,
        height: 212,
        overflow: "hidden",
        borderColor: "#334969",
        borderWidth: 1,
        opacity: frozen ? 0.6 : 1,
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -20,
          top: 15,
          transform: [{ rotate: "-25deg" }],
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 160 + i * 13,
              height: 210 + i * 13,
              borderWidth: 1,
              borderColor: "#2A3D5D",
              borderRadius: 30,
              left: -i * 10,
              top: -i * 7,
            }}
          />
        ))}
      </View>
      <Row style={{ justifyContent: "space-between" }}>
        <Txt weight="700" size={20} style={{ color: "#FFF", letterSpacing: 4 }}>
          PAYLAK
        </Txt>
        <Mark size={28} color="#BBC5D2" />
      </Row>
      <Svg width={36} height={30} viewBox="0 0 36 30" style={{ marginTop: 24 }}>
        <Rect x={1} y={1} width={34} height={28} rx={6} fill="#BBC5D2" />
        <Path d="M12 1v28M24 1v28M1 10h34M1 20h34" stroke="#7E8EA7" />
      </Svg>
      <Row style={{ justifyContent: "space-between", marginTop: 23 }}>
        <Txt size={11} style={{ color: "#BBC5D2", letterSpacing: 2 }}>
          RAYAN ELANNAN
        </Txt>
        <Txt size={14} style={{ color: "#FFF", writingDirection: "ltr" }}>
          •••• 2048
        </Txt>
      </Row>
      {frozen && (
        <View
          style={{
            position: "absolute",
            top: 88,
            left: 90,
            right: 90,
            backgroundColor: "#101C31",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Txt size={12} style={{ color: "#FFF", textAlign: "center" }}>
            {t("Frozen", "مجمّدة")}
          </Txt>
        </View>
      )}
    </View>
  );
}
