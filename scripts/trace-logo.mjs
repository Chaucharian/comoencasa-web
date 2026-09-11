import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import potrace from "potrace";

const src =
  "/Users/agustinsalinas/.cursor/projects/Users-agustinsalinas-Documents-projects-money-ui/assets/Screenshot_2026-09-11_at_2.50.01_PM-4e1be9ef-33f7-438c-8ce3-b9abd8d6ef69.png";
const mask = "/tmp/cisne-logo-mask.png";
const publicPng =
  "/Users/agustinsalinas/Documents/projects/cisne-web/public/brand/cisne-elocuente.png";
const tsOut =
  "/Users/agustinsalinas/Documents/projects/cisne-web/src/components/site/band-logo-paths.ts";

const py = `
from PIL import Image, ImageFilter

src = ${JSON.stringify(src)}
public_png = ${JSON.stringify(publicPng)}
mask_path = ${JSON.stringify(mask)}

rgb = Image.open(src).convert("RGB")
w, h = rgb.size
red = Image.new("L", (w, h), 0)
px = rgb.load()
rp = red.load()

for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        # cracked red only — skip black outline and the dark field
        if r >= 90 and r > g + 28 and r > b + 18:
            rp[x, y] = 255
        elif r >= 70 and g < 40 and b < 50 and r > g + 22:
            rp[x, y] = 255

# fill crackle pinholes, then grow a ring for the black outline
red = red.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
outlined = red.filter(ImageFilter.MaxFilter(15))
bbox = outlined.getbbox()
pad = 18
box = (
    max(0, bbox[0] - pad),
    max(0, bbox[1] - pad),
    min(w, bbox[2] + pad),
    min(h, bbox[3] + pad),
)
cropped = rgb.crop(box)
shape = red.crop(box)
ring = outlined.crop(box)

rgba = cropped.convert("RGBA")
src_px = rgba.load()
sh = shape.load()
rk = ring.load()
cw, ch = rgba.size
for y in range(ch):
    for x in range(cw):
        r, g, b, _ = src_px[x, y]
        if sh[x, y] >= 8:
            src_px[x, y] = (r, g, b, 255)
        elif rk[x, y] >= 8:
            src_px[x, y] = (8, 8, 8, 255)
        else:
            src_px[x, y] = (0, 0, 0, 0)

rgba.save(public_png)

trace = Image.new("L", ring.size, 255)
trace.paste(0, mask=ring)
trace.save(mask_path)
print(rgba.size[0], rgba.size[1])
`;

const result = spawnSync("/usr/bin/python3", ["-c", py], { encoding: "utf8" });
if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(1);
}
const [width, height] = result.stdout.trim().split(" ").map(Number);

potrace.trace(
  mask,
  {
    color: "#d1121a",
    background: "transparent",
    threshold: 128,
    optTolerance: 0.24,
    turdSize: 20,
    alphaMax: 1,
  },
  (err, svg) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const match = svg.match(/<path d="([^"]+)"/);
    if (!match) process.exit(1);

    const d = match[1].replace(/\s+/g, " ").trim();
    const file = `export const BAND_LOGO_VIEWBOX = { width: ${width}, height: ${height} } as const;

export const BAND_LOGO_PATH = "${d.replace(/"/g, '\\"')}";
`;

    writeFileSync(tsOut, file);
    console.log("path chars", d.length, "viewBox", width, height);
  },
);
