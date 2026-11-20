"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const GITHUB_LATEST_RELEASE_API =
  "https://api.github.com/repos/LeQuangVinh11022004/film-photo-platform-mobile/releases/latest";

const DEFAULT_LATEST_APK_URL =
  "https://github.com/LeQuangVinh11022004/film-photo-platform-mobile/releases/latest/download/app-release.apk";

type GitHubReleaseAsset = {
  name?: string;
  browser_download_url?: string;
};

type GitHubLatestRelease = {
  tag_name?: string;
  assets?: GitHubReleaseAsset[];
};

type ApkDownloadQrProps = {
  /** Absolute URL override. Falls back to latest GitHub release APK, then NEXT_PUBLIC_APK_DOWNLOAD_URL */
  url?: string;
  size?: number;
  className?: string;
};

export default function ApkDownloadQr({
  url,
  size = 168,
  className,
}: ApkDownloadQrProps) {
  const envUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL?.trim();
  const fallbackUrl =
    url ?? (envUrl && envUrl.length > 0 ? envUrl : DEFAULT_LATEST_APK_URL);

  const [latestApkUrl, setLatestApkUrl] = useState<string>(fallbackUrl);
  const [releaseTag, setReleaseTag] = useState<string | null>(null);

  useEffect(() => {
    if (url) return;
    let cancelled = false;

    fetch(GITHUB_LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? (res.json() as Promise<GitHubLatestRelease>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        const apkAsset = data.assets?.find(
          (asset) =>
            typeof asset.name === "string" &&
            asset.name.toLowerCase().endsWith(".apk") &&
            typeof asset.browser_download_url === "string",
        );
        if (apkAsset?.browser_download_url) {
          setLatestApkUrl(apkAsset.browser_download_url);
        }
        if (data.tag_name) {
          setReleaseTag(data.tag_name);
        }
      })
      .catch(() => {
        // Fallback URL already points to releases/latest/download/app-release.apk
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center">
      <div className={className} style={{ width: size, minHeight: size }}>
        <QRCodeSVG
          value={latestApkUrl}
          size={size}
          level="M"
          marginSize={4}
          title="Download Film Photo Android app"
          fgColor="#171715"
          bgColor="#ffffff"
        />
      </div>
      <a
        href={latestApkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#171715] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2d2c29]"
      >
        <span>Download APK</span>
        {releaseTag ? (
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">
            {releaseTag}
          </span>
        ) : null}
      </a>
    </div>
  );
}
