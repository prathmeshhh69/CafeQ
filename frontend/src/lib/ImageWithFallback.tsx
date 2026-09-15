import { useState } from "react";

const categoryStyle: Record<string, { background: string; accent: string }> = {
  "Shawarma - Non-Veg": { background: "#f8e4c0", accent: "#e67b28" },
  "Shawarma - Veg": { background: "#e4efd7", accent: "#6c8b42" },
  Lassi: { background: "#f5d9e7", accent: "#ca6f98" },
  Juice: { background: "#fae4b9", accent: "#e89a2d" },
  Coffee: { background: "#eadbcb", accent: "#95603b" },
  Lemonades: { background: "#eef0bd", accent: "#9a9d32" },
  Mojito: { background: "#d8ece9", accent: "#3b8c85" },
  "Ice Cream": { background: "#e8dff2", accent: "#8d72aa" },
  "Summer Slam": { background: "#d9edf2", accent: "#4e91a7" },
  "Modern Twist": { background: "#f4d6df", accent: "#be6380" },
  "Ice Tea": { background: "#f2e2bb", accent: "#b27f30" },
  International: { background: "#e5e0d7", accent: "#766f62" },
  "Thick Shake": { background: "#ead7e6", accent: "#a46092" },
};

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string; category?: string };

function categoryFallback(category?: string) {
  const style = categoryStyle[category || ""] || { background: "#efe7d3", accent: "#6f6a5f" };
  const label = (category || "CafeQ").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  }[character] || character));
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
      <rect width='400' height='300' fill='${style.background}'/>
      <circle cx='200' cy='128' r='54' fill='${style.accent}' opacity='.18'/>
      <path d='M145 135h110v48a55 55 0 0 1-110 0z' fill='${style.accent}' opacity='.75'/>
      <path d='M255 146h25a25 25 0 0 1 0 50h-25' fill='none' stroke='${style.accent}' stroke-width='12' opacity='.75'/>
      <text x='200' y='250' font-family='sans-serif' font-size='18' font-weight='700' fill='${style.accent}' text-anchor='middle'>${label}</text>
    </svg>`,
  );
}

export function ImageWithFallback({ src, alt, category, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored || !src ? categoryFallback(category) : src}
      alt={alt}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}

export default ImageWithFallback;
