"use client";

import { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";

const DEFAULT_APK_PATH = "/downloads/app-release.apk";

const subscribe = () => () => {};

type ApkDownloadQrProps = {
  /** Absolute URL override. Falls back to NEXT_PUBLIC_APK_DOWNLOAD_URL, then <origin>/downloads/app-release.apk */
  url?: string;
  size?: number;
  className?: string;
};

export default function ApkDownloadQr({ url, size = 168, className }: ApkDownloadQrProps) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => null,
  );

  const envUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL;
  const downloadUrl = url ?? (envUrl && envUrl.length > 0 ? envUrl : origin ? `${origin}${DEFAULT_APK_PATH}` : null);

  return (
    <div className={className} style={{ width: size, minHeight: size }}>
      {downloadUrl ? (
        <QRCodeSVG
          value={downloadUrl}
          size={size}
          level="M"
          marginSize={4}
          title="Download Film Photo Android app"
          fgColor="#171715"
          bgColor="#ffffff"
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-[#e8e3d7]" aria-hidden />
      )}
    </div>
  );
}
