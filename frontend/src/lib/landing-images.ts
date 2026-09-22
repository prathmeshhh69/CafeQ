import imageList from "../../../url.txt?raw";

export const landingImages = imageList.split(/\r?\n/).flatMap((line) => {
  const separator = line.indexOf(": ");
  if (separator < 1) return [];

  const name = line.slice(0, separator).trim();
  const src = line.slice(separator + 2).trim();
  return name && src ? [{ name, src }] : [];
});
