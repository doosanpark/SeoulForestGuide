import { ImageResponse } from "next/og";
import { BrandMark } from "./icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(<BrandMark inset={64} />, { ...size });
}
