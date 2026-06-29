import React from "react";
// @ts-ignore
import logoImg from "../assets/images/camelon_logo_1782287538907.jpg";

interface CamelonLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: "white" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  onlyEmblem?: boolean;
}

export const CamelonLogo: React.FC<CamelonLogoProps> = ({
  className = "",
  showText = true,
  textColor = "white",
  size = "md",
  onlyEmblem = false,
}) => {
  // Sizing definitions
  const containerDimensions = {
    sm: onlyEmblem ? "w-10 h-10" : "w-12 h-12",
    md: onlyEmblem ? "w-20 h-20" : "w-24 h-24",
    lg: onlyEmblem ? "w-32 h-32" : "w-40 h-40",
    xl: onlyEmblem ? "w-48 h-48" : "w-64 h-64",
  }[size];

  // If onlyEmblem is true, or if showText is false, we crop the image to show only the top C-Camel emblem
  const cropEmblem = onlyEmblem || !showText;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {cropEmblem ? (
        // Crop to show only the top circular 'C' emblem
        <div className={`${containerDimensions} overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm relative shrink-0`}>
          <img
            src={logoImg}
            alt="Camelon Emblem"
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-[175%] object-cover object-top p-1"
          />
        </div>
      ) : (
        // Render the full logo exactly as sent
        <div className={`${containerDimensions} bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 shrink-0`}>
          <img
            src={logoImg}
            alt="Camelon Full Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};
