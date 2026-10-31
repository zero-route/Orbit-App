import type { ReactNode } from "react";
import { ImageBackground, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  radius: number;
  border?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export default function GradientBox({ radius, border = 1.5, style, children }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/spectrum.png")}
      resizeMode="stretch"
      style={[{ borderRadius: radius, padding: border, overflow: "hidden" }, style]}
    >
      {children}
    </ImageBackground>
  );
}
