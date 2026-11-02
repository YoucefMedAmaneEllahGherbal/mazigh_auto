"use client";

import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({
  href = "/",
  className = "",
  size = "md",
}: LogoProps) {
  const heights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
  };

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        onError={(e) => {
          if (!e.currentTarget.src.endsWith("/logo.svg")) {
            e.currentTarget.src = "/logo.svg";
          }
        }}
        alt="MAZIGH AUTO"
        className={`${heights[size]} w-auto object-contain transition-transform duration-200 hover:scale-105`}
        loading="eager"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="MAZIGH AUTO - Showroom Kecherid Auto" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
