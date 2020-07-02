import React, { useContext } from "react";
import { ThemeContext } from "styled-components";

interface LeaveIconProps {
  title: string;
  selected: boolean;
}

export const LeaveIcon = ({ title, selected }: LeaveIconProps) => {
  const theme = useContext(ThemeContext);
  return (
    <svg width={20} height={16}>
      <title>{title}</title>
      <g fill={theme.colors.onPrimary} fillRule="evenodd">
        <path d="M10.647 4.854L12.793 7H.5a.499.499 0 100 1h12.293l-2.146 2.145a.5.5 0 00.707.707l3-3a.497.497 0 000-.708l-3-3a.5.5 0 10-.707.71z" />
        <path d="M19.001 1.5v12c0 .827-.673 1.5-1.5 1.5h-10c-.827 0-1.5-.673-1.5-1.5v-4a.5.5 0 011 0v4a.5.5 0 00.5.5h10a.5.5 0 00.5-.5v-12a.5.5 0 00-.5-.5h-10a.5.5 0 00-.5.5v4a.5.5 0 01-1 0v-4c0-.827.673-1.5 1.5-1.5h10c.827 0 1.5.673 1.5 1.5" />
      </g>
    </svg>
  );
};
