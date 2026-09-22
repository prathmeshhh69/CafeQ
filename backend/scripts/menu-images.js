const fs = require("fs");
const path = require("path");

const imageListPath = path.resolve(__dirname, "../../url.txt");

function loadMenuImages({ required = true } = {}) {
  const images = new Map();
  if (!fs.existsSync(imageListPath)) {
    if (required) throw new Error(`Image list not found: ${imageListPath}`);
    return images;
  }
  const lines = fs.readFileSync(imageListPath, "utf8").split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;

    const separator = line.indexOf(": ");
    if (separator < 1) throw new Error(`Invalid image entry on line ${index + 1} of url.txt.`);

    const name = line.slice(0, separator).trim();
    const image = line.slice(separator + 2).trim();
    if (!name || !/^(https?:\/\/|data:image\/[^;]+;base64,)/.test(image)) {
      throw new Error(`Invalid image entry on line ${index + 1} of url.txt.`);
    }
    if (images.has(name)) throw new Error(`Duplicate image entry for ${name} in url.txt.`);

    images.set(name, image);
  }

  return images;
}

module.exports = { loadMenuImages };
