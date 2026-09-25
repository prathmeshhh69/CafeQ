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

// CafeQ counter mascot, drawn as a scalable illustration so it stays crisp at every size.
export function CafeBaristaDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 390" role="img" aria-label="CafeQ barista carrying a fresh coffee and takeaway bag" className={className} xmlns="http://www.w3.org/2000/svg">
      <g stroke="#291b14" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* bag behind the barista */}
        <path fill="#8d482c" d="M216 198h70l7 112h-84z" />
        <path fill="#c27a45" d="M216 210h70v24h-70z" />
        <path fill="none" d="M235 198c0-24 33-24 33 0" />
        <path fill="#f4e7cf" stroke="none" d="M224 246h54v22h-54z" />
        <text x="251" y="263" textAnchor="middle" fill="#74452d" stroke="none" fontSize="17" fontWeight="700" fontFamily="Georgia,serif">CafeQ</text>
        <path fill="#edc988" d="M226 280h17v20h-17zm22-2h18v22h-18z" />
        {/* legs */}
        <path fill="#60402f" d="M112 292h36l-5 73h-42zm39 0h37l16 73h-43z" />
        <path fill="#30221b" d="M102 356h42l-2 16H88c1-10 6-15 14-16zm57 0h42c10 2 15 8 17 16h-54z" />
        {/* coffee arm, sleeve, forearm and hand */}
        <path fill="#e8ae78" d="M110 211c-18 5-27 18-34 35l-15 31c-4 9 8 18 16 10l24-29 25-21z" />
        <path fill="#f3e7ce" d="M99 205c-13 3-23 15-29 30l20 13 23-28z" />
        <path fill="#e8ae78" d="M64 275c-9-7-20-4-22 3-2 6 4 10 12 10-7 4-5 11 2 12 7 1 12-5 14-12z" />
        {/* arm reaching to the bag */}
        <path fill="#e8ae78" d="M187 210c16-3 28 5 39 19l18 20c7 8-3 19-12 13l-27-18-25-2z" />
        <path fill="#f3e7ce" d="M183 205c16-5 28 2 39 15l-17 20-26-17z" />
        <path fill="#e8ae78" d="M237 245c7-8 18-8 22-2 3 5-1 10-8 13 8 1 9 9 3 13-6 4-14 0-17-7z" />
        {/* jacket and torso */}
        <path fill="#f3e7ce" d="M105 194c11-13 25-19 42-19s33 7 44 20l15 104H92z" />
        <path fill="#5b3526" d="M112 210c10 11 20 16 35 16s27-6 38-17l12 79H101z" />
        <path fill="none" d="M145 218v28m4-23h4" />
        <path fill="#ead7b5" d="M133 191h29l10 23c-12 14-35 14-48 0z" />
        <path fill="none" d="M122 211v27m49-27v27" />
        <text x="151" y="270" textAnchor="middle" fill="#f2dfbd" stroke="none" fontSize="12" fontFamily="Georgia,serif">CafeQ</text>
        {/* neck and face */}
        <path fill="#d99b68" d="M132 157h33v42c-9 10-24 10-33 0z" />
        <path fill="#edb47f" d="M104 97c0-29 18-47 44-47s45 19 45 48v40c0 27-18 43-45 43s-44-17-44-44z" />
        <path fill="#291b14" d="M103 117c-10-13-8-37 3-51 9-13 25-21 46-21 24 0 41 10 49 29 5 12 5 27 0 39l-11-13c-9-6-17-15-21-25-16 13-40 18-66 16z" />
        {/* ears */}
        <path fill="#edb47f" d="M103 111c-14-7-19 2-14 15 3 7 9 10 16 8m87-23c14-7 19 2 14 15-3 7-9 10-16 8" />
        {/* chef cap */}
        <path fill="#f1e2c6" d="M88 58c2-11 10-18 20-19 4-18 19-28 39-28 19 0 34 10 39 27 14 1 22 9 23 20z" />
        <path fill="#b75b32" d="M86 55h126v17H86z" />
        <path fill="#f7e8ca" stroke="none" d="M126 34h47v18h-47z" />
        <text x="150" y="48" textAnchor="middle" fill="#75452c" stroke="none" fontSize="14" fontWeight="700" fontFamily="Georgia,serif">CafeQ</text>
        {/* face */}
        <path fill="none" d="M119 112c8-5 16-5 23-1m17 0c7-4 15-4 22 1" />
        <ellipse cx="132" cy="119" rx="2.8" ry="4" fill="#291b14" stroke="none" /><ellipse cx="171" cy="119" rx="2.8" ry="4" fill="#291b14" stroke="none" />
        <path fill="none" d="M151 120c-1 7-4 13-2 15 2 2 5 2 8 1m-18 14c8 7 19 7 27-1" />
        <path fill="#d77b70" stroke="none" d="M113 139c-8-4-12 2-7 7 4 3 10 2 14-1m62-6c8-4 12 2 7 7-4 3-10 2-14-1" />
        {/* takeaway cup held in the left hand */}
        <path fill="#d87918" d="M33 251h34l-4 48c-1 7-24 7-25 0z" />
        <path fill="#f4e8d1" d="M30 245h40v12H30z" />
        <path fill="none" d="M43 240c-5-8 6-9 2-17m12 17c-5-8 6-9 2-17" />
        <path fill="#f3dfb9" stroke="none" d="M39 269h23v13H39z" />
        <text x="50" y="279" textAnchor="middle" fill="#74452d" stroke="none" fontSize="9" fontWeight="700" fontFamily="Georgia,serif">CafeQ</text>
      </g>
    </svg>
  );
}

export function BottleDoodle({ className }: { className?: string }) {
  return <svg viewBox="0 0 64 100" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M25 5h14v17l8 10v51c0 7-6 12-15 12S17 90 17 83V32l8-10z"/><path d="M25 15h14M18 42h28M18 74h28"/><path d="M23 55c5-4 13 4 18 0"/></svg>;
}

export function SkewerDoodle({ className }: { className?: string }) {
  return <svg viewBox="0 0 100 30" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 23 88 6l5 2L8 26z"/><path d="m27 20 8-13 10 2 1 11m8-3-2-12 11-2 7 12m6-2-1-8 10-3"/></svg>;
}

export function CoffeeBeanDoodle({ className }: { className?: string }) {
  return <svg viewBox="0 0 52 38" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="25" cy="19" rx="19" ry="12" transform="rotate(-24 25 19)"/><path d="M14 27c9-3 11-14 22-18"/><path d="M21 30c-2-4-1-8 2-12"/></svg>;
}

export function PepperDoodle({ className }: { className?: string }) {
  return <svg viewBox="0 0 58 76" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M24 5h11l2 10 9 9 4 38c-9 8-31 8-40 0l4-38 9-9z"/><path d="M22 15h15m-20 22h31m-32 16h33"/><circle cx="24" cy="45" r="1" fill="currentColor"/><circle cx="32" cy="46" r="1" fill="currentColor"/><circle cx="39" cy="44" r="1" fill="currentColor"/></svg>;
}

// A scattered doodle field for hero corners / celebration
export function DoodleField({ className }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden text-ink " + (className ?? "")}>
      <div className="absolute inset-y-0 left-0 w-[14%] sm:w-[11%]">
        <BottleDoodle className="absolute left-2 top-[9%] w-9 -rotate-[24deg] sm:left-8 sm:w-12" />
        <SkewerDoodle className="absolute -left-2 top-[27%] w-[4.5rem] -rotate-[24deg] sm:left-6 sm:w-24" />
        <PepperDoodle className="absolute -left-3 top-[40%] w-12 -rotate-[17deg] sm:left-5 sm:w-14" />
        <PotDoodle className="absolute -left-7 top-[57%] w-20 -rotate-[18deg] sm:left-1 sm:w-24" />
        <PlateDoodle className="absolute bottom-[7%] left-3 w-14 rotate-[10deg] sm:left-10 sm:w-20" />
        <CoffeeBeanDoodle className="absolute left-[65%] top-[18%] w-8 rotate-[17deg] sm:w-10" />
        <Star className="absolute left-[70%] top-[48%] text-xl" />
      </div>
      <div className="absolute inset-y-0 right-0 w-[14%] sm:w-[11%]">
        <SkewerDoodle className="absolute right-1 top-[10%] w-20 rotate-[22deg] sm:right-6 sm:w-28" />
        <PepperDoodle className="absolute -right-2 top-[28%] w-12 rotate-[17deg] sm:right-5 sm:w-14" />
        <BottleDoodle className="absolute -right-3 top-[46%] w-10 rotate-[18deg] sm:right-8 sm:w-14" />
        <PotDoodle className="absolute -right-8 top-[62%] w-20 rotate-[16deg] sm:right-1 sm:w-24" />
        <CoffeeBeanDoodle className="absolute right-[65%] bottom-[13%] w-8 -rotate-[12deg] sm:w-10" />
        <Sparkle className="absolute right-[72%] top-[40%] text-xl" />
      </div>
      <Heart className="absolute right-[18%] bottom-[17%] hidden rotate-[12deg] text-xl sm:block" />
      <Sparkle className="absolute left-[47%] top-[7%] hidden text-lg sm:block" />
    </div>
  );
}
