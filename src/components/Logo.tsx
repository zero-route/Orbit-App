import { Image } from "react-native";

export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/logo.png")}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
