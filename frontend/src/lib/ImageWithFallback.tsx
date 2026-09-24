import { useState } from "react";

const categoryStyle: Record<string, { background: string; accent: string }> = {
  "Shawarma - Non-Veg": { background: "#ffe2cb", accent: "#a8421e" },
  "Shawarma - Veg": { background: "#ffead9", accent: "#9f4028" },
  Lassi: { background: "#ffe0d5", accent: "#bd3150" },
  Juice: { background: "#ffebd0", accent: "#ad481d" },
  Coffee: { background: "#ead7cf", accent: "#6b3528" },
  Lemonades: { background: "#ffeadc", accent: "#b74d25" },
  Mojito: { background: "#f9dbd4", accent: "#9f3b30" },
  "Ice Cream": { background: "#ffe5df", accent: "#b62d4b" },
  "Summer Slam": { background: "#ffdccd", accent: "#ad3d26" },
  "Modern Twist": { background: "#f9d8dd", accent: "#a92849" },
  "Ice Tea": { background: "#ffe8d6", accent: "#a94825" },
  International: { background: "#e9d9d4", accent: "#713638" },
  "Thick Shake": { background: "#f7dadb", accent: "#a8334d" },
};

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & { src?: string; category?: string };

function categoryFallback(category?: string) {
  const style = categoryStyle[category || ""] || { background: "#f3ded4", accent: "#713b38" };
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
