import type React from "react";
import Image from "@/components/AppImage";

interface LogoProps {
  height?: number;
  width?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ height = 40, width = 40, className }) => {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority // ensures logo loads fast
    />
  );
};

export default Logo;
