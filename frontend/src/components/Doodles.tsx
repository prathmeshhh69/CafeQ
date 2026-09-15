// Sparse hand-drawn doodles — used to add personality without clutter.
type D = { className?: string; style?: React.CSSProperties };

const stroke = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function Star({ className, style }: D) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} width="1em" height="1em">
      <path d="M12 3l2 5.5L20 9l-4.2 3.7L17 19l-5-3-5 3 1.2-6.3L4 9l6-.5z"
        stroke="currentColor" strokeWidth="1.6" {...stroke} />
    </svg>
  );
}

export function Sparkle({ className, style }: D) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} width="1em" height="1em">
      <path d="M12 3c.5 4 1.5 6 6 6-4.5 0-5.5 2-6 6-.5-4-1.5-6-6-6 4.5 0 5.5-2 6-6z"
        stroke="currentColor" strokeWidth="1.5" {...stroke} />
    </svg>
  );
}

export function Heart({ className, style }: D) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} width="1em" height="1em">
      <path d="M12 20s-7-4.4-7-9.3C5 7.7 7 6 9 6c1.5 0 2.5.9 3 1.8C12.5 6.9 13.5 6 15 6c2 0 4 1.7 4 4.7 0 4.9-7 9.3-7 9.3z"
        stroke="currentColor" strokeWidth="1.6" {...stroke} />
    </svg>
  );
}

export function Arrow({ className, style }: D) {
  return (
    <svg viewBox="0 0 40 24" className={className} style={style} width="1.6em" height="1em">
      <path d="M2 14c8 4 20 3 30-6" stroke="currentColor" strokeWidth="1.8" {...stroke} />
      <path d="M26 3l6 -1 -2 6" stroke="currentColor" strokeWidth="1.8" {...stroke} />
    </svg>
  );
}

export function Squiggle({ className, style }: D) {
  return (
    <svg viewBox="0 0 60 12" className={className} style={style} width="3em" height="0.6em">
      <path d="M2 8c6-8 10 4 15-2s10 6 15 0 10 4 15-2" stroke="currentColor" strokeWidth="2" {...stroke} />
    </svg>
  );
}

export function CupDoodle({ className, style }: D) {
  return (
    <svg viewBox="0 0 64 72" className={className} style={style} width="1em" height="1.1em">
      <g className="animate-steam" style={{ transformOrigin: "center" }}>
        <path d="M26 8c-2 3 2 5 0 9" stroke="currentColor" strokeWidth="1.6" {...stroke} />
        <path d="M34 6c-2 3 2 5 0 9" stroke="currentColor" strokeWidth="1.6" {...stroke} />
      </g>
      <path d="M14 26h30v14a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" stroke="currentColor" strokeWidth="2.2" {...stroke} />
      <path d="M44 30h5a5 5 0 0 1 0 10h-5" stroke="currentColor" strokeWidth="2.2" {...stroke} />
      <circle cx="24" cy="38" r="1.6" fill="currentColor" />
      <circle cx="33" cy="38" r="1.6" fill="currentColor" />
      <path d="M25 44c2 2.5 6 2.5 8 0" stroke="currentColor" strokeWidth="1.8" {...stroke} />
    </svg>
  );
}

export function PlateDoodle({ className, style }: D) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} width="1em" height="1em">
      <ellipse cx="60" cy="66" rx="46" ry="14" stroke="currentColor" strokeWidth="2.4" fill="none" />
      <ellipse cx="60" cy="60" rx="34" ry="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M20 50c-6-2-8-8-4-14" stroke="currentColor" strokeWidth="2" {...stroke} />
      <path d="M28 44c-4-2-5-8 0-12" stroke="currentColor" strokeWidth="2" {...stroke} />
      <path d="M100 52c8-2 10-16-2-20 0 0 2 10-4 12" stroke="currentColor" strokeWidth="2" {...stroke} />
    </svg>
  );
}

export function PotDoodle({ className, style }: D) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} width="1em" height="1em">
      <g className="animate-steam" style={{ transformOrigin: "center" }}>
        <path d="M48 20c-3 5 3 8 0 14" stroke="currentColor" strokeWidth="2" {...stroke} />
        <path d="M62 16c-3 5 3 8 0 14" stroke="currentColor" strokeWidth="2" {...stroke} />
        <path d="M76 20c-3 5 3 8 0 14" stroke="currentColor" strokeWidth="2" {...stroke} />
      </g>
      <path d="M26 52h68l-4 34a12 12 0 0 1-12 11H42a12 12 0 0 1-12-11z" stroke="currentColor" strokeWidth="2.6" {...stroke} />
      <path d="M20 52h80" stroke="currentColor" strokeWidth="2.6" {...stroke} />
      <path d="M14 60c-4 2-4 8 4 8M106 60c4 2 4 8-4 8" stroke="currentColor" strokeWidth="2.4" {...stroke} />
      <circle cx="50" cy="72" r="2.2" fill="currentColor" />
      <circle cx="70" cy="72" r="2.2" fill="currentColor" />
      <path d="M52 82c4 4 12 4 16 0" stroke="currentColor" strokeWidth="2.4" {...stroke} />
    </svg>
  );
}

// A scattered doodle field for hero corners / celebration
export function DoodleField({ className }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden text-ink " + (className ?? "")}>
      <Star className="absolute left-[8%] top-[14%] text-[22px] text-orange rotate-[-8deg]" />
      <Sparkle className="absolute right-[12%] top-[10%] text-[26px] text-lime-deep" />
      <Heart className="absolute right-[22%] bottom-[18%] text-[20px] text-red rotate-[12deg]" />
      <Star className="absolute left-[16%] bottom-[12%] text-[16px] text-ink rotate-[16deg]" />
      <Sparkle className="absolute left-[46%] top-[6%] text-[16px] text-orange" />
    </div>
  );
}
