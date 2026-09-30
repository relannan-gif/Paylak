import React from "react";
import { useLocalSearchParams } from "expo-router";
import { PaylakScreen } from "../../screens";
export default function Screen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  return <PaylakScreen key={name} name={name || "home"} />;
}
