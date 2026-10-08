/**
 * KhabarIcon — React component for the Khabar Chakra UI icon set.
 * Generated. Do not edit by hand; edit tools/kc_ui.py and regenerate.
 *
 *   <KhabarIcon name="cook" size={24} />
 *   <KhabarIcon name="verified" size={20} color="#0B5B4E" />
 *
 * Needs khabar-chakra-icons.js alongside it.
 */
import React from "react";
import { KC_ICONS } from "./khabar-chakra-icons";

export default function KhabarIcon({
  name, size = 24, color = "currentColor", title, className, style, ...rest
}) {
  const body = KC_ICONS[name];
  if (!body) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[KhabarIcon] unknown icon "${name}"`);
    }
    return null;
  }
  const label = title || name.replace(/-/g, " ");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      className={className}
      style={style}
      {...rest}
    >
      <title>{label}</title>
      <g
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </svg>
  );
}

export const KhabarIconNames = Object.keys(KC_ICONS);
