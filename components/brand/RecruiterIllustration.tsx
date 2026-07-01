/** Lightweight inline SVG illustration for the login hero (no external asset). */
export function RecruiterIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Recruiter reviewing candidates"
    >
      {/* backdrop card */}
      <rect x="60" y="40" width="280" height="200" rx="16" fill="#ffffff" opacity="0.12" />
      <rect x="60" y="40" width="280" height="200" rx="16" stroke="#ffffff" strokeOpacity="0.25" />

      {/* candidate list rows */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(84, ${72 + i * 46})`}>
          <circle cx="14" cy="14" r="14" fill="#ffffff" opacity="0.85" />
          <rect x="40" y="4" width="130" height="9" rx="4.5" fill="#ffffff" opacity="0.75" />
          <rect x="40" y="20" width="90" height="7" rx="3.5" fill="#ffffff" opacity="0.4" />
          <rect x="212" y="6" width="40" height="18" rx="9" fill="#ffffff" opacity="0.9" />
        </g>
      ))}

      {/* magnifying glass */}
      <g transform="translate(250, 200)">
        <circle cx="40" cy="40" r="34" fill="#ffffff" opacity="0.9" />
        <circle cx="40" cy="40" r="34" stroke="#1d4ed8" strokeWidth="4" opacity="0.25" />
        <circle cx="40" cy="40" r="20" stroke="#1d4ed8" strokeWidth="5" opacity="0.5" />
        <rect
          x="62"
          y="62"
          width="34"
          height="10"
          rx="5"
          transform="rotate(45 62 62)"
          fill="#ffffff"
        />
      </g>

      {/* check badge */}
      <g transform="translate(70, 210)">
        <circle cx="26" cy="26" r="26" fill="#22c55e" />
        <path
          d="M16 27l7 7 13-14"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
