import type { ImgHTMLAttributes } from "react";

type AppImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  alt: string;
  priority?: boolean;
};

export default function AppImage({
  alt,
  priority: _priority,
  loading,
  ...props
}: AppImageProps) {
  return <img alt={alt} loading={loading ?? "lazy"} {...props} />;
}
