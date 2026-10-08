import React from "react";

export type IconName =
  | "buy"
  | "track"
  | "store"
  | "consume"
  | "cook"
  | "share"
  | "donate"
  | "reuse"
  | "recycle"
  | "dispose"
  | "ingredient"
  | "recipe"
  | "meal"
  | "portion"
  | "leftover"
  | "fresh"
  | "expiring"
  | "expired"
  | "fridge"
  | "freezer"
  | "pantry"
  | "shopping-list"
  | "scan"
  | "market"
  | "veg-marker"
  | "nonveg-marker"
  | "allergen"
  | "plant-based"
  | "no-onion-garlic"
  | "spice"
  | "household"
  | "family"
  | "neighbour"
  | "volunteer"
  | "ngo"
  | "verified"
  | "caterer"
  | "event-host"
  | "community"
  | "pickup"
  | "delivery"
  | "route"
  | "claim-surplus"
  | "meals-saved"
  | "kg-rescued"
  | "co2-avoided"
  | "water-saved"
  | "streak"
  | "badge"
  | "leaderboard"
  | "certificate"
  | "tier"
  | "goal"
  | "search"
  | "filter"
  | "map"
  | "location"
  | "calendar"
  | "schedule"
  | "bell"
  | "message"
  | "invite"
  | "share-arrow"
  | "qr"
  | "profile"
  | "sliders"
  | "help"
  | "star-rating"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "empty"
  | "offline"
  | "sync"
  | "loading"
  | "locked"
  | "hidden";

interface KhabarIconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}

export function KhabarIcon({
  name,
  size = 24,
  className = "",
  title,
  ...props
}: KhabarIconProps) {
  const label = title || name.replace(/-/g, " ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-label={label}
      role="img"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <use href={`/icons/ui/khabar-chakra-icons.svg#kc-${name}`} />
    </svg>
  );
}
