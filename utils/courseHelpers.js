import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COURSES_DIR = path.join(__dirname, "..", "content", "courses");
export const CATALOG_PATH = path.join(__dirname, "..", "content", "courses_catalog.json");

// Helper to match track directory case-insensitively
export const findTrackDir = (trackParam) => {
  if (!trackParam || !fs.existsSync(COURSES_DIR)) return null;
  const dirs = fs.readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const target = trackParam.toLowerCase().replace(/[-_ ]/g, "");
  const matched = dirs.find((d) => d.toLowerCase().replace(/[-_ ]/g, "") === target);
  return matched
    ? { dirName: matched, fullPath: path.join(COURSES_DIR, matched) }
    : null;
};

// Helper to recursively find a chapter .md file
export const findChapterFile = (trackDir, phaseId = "") => {
  if (!trackDir || !fs.existsSync(trackDir)) return null;
  const searchClean = (phaseId || "").replace(/\.md$/, "").trim().toLowerCase();

  const allMdFiles = [];
  const searchRecursive = (dir, prefix = "") => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const rel = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.isDirectory()) {
        searchRecursive(fullPath, rel);
      } else if (item.name.endsWith(".md")) {
        allMdFiles.push({ fullPath, relPath: rel, fileName: item.name });
      }
    }
  };

  searchRecursive(trackDir);
  if (allMdFiles.length === 0) return null;

  // If no phaseId specified or generic "readme" requested, return README if exists, otherwise first file
  if (!searchClean || searchClean === "readme" || searchClean === "default" || searchClean === "index") {
    const readme = allMdFiles.find((f) => {
      const base = f.fileName.replace(/\.md$/, "").toLowerCase();
      return base === "readme" || base === "00-readme";
    });
    if (readme) return readme;
    return allMdFiles[0];
  }

  // 1. Exact relative or base match
  const exact = allMdFiles.find((f) => {
    const relNoExt = f.relPath.replace(/\.md$/, "").toLowerCase();
    const baseNoExt = f.fileName.replace(/\.md$/, "").toLowerCase();
    return (
      relNoExt === searchClean ||
      baseNoExt === searchClean ||
      relNoExt.endsWith(`/${searchClean}`)
    );
  });
  if (exact) return exact;

  // 2. Exact match on normalized alphanumeric string
  const normSearch = searchClean.replace(/[^a-z0-9]/g, "");
  const normExact = allMdFiles.find((f) => {
    const relNorm = f.relPath.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const baseNorm = f.fileName.replace(/\.md$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return relNorm === normSearch || baseNorm === normSearch;
  });
  if (normExact) return normExact;

  // 3. Prefix match with clear delimiter (hyphen, underscore, space, slash)
  const prefixMatch = allMdFiles.find((f) => {
    const baseNoExt = f.fileName.replace(/\.md$/, "").toLowerCase();
    return (
      baseNoExt.startsWith(`${searchClean}-`) ||
      baseNoExt.startsWith(`${searchClean}_`) ||
      baseNoExt.startsWith(`${searchClean} `)
    );
  });
  if (prefixMatch) return prefixMatch;

  return null;
};

// Strict whitelist & regex for free demo phases
export const isFreeDemo = (phaseId, fileName = "", relPath = "") => {
  const norm = (s) => (s || "").toLowerCase().replace(/\.md$/, "").trim();
  const file = norm(fileName);
  const phase = norm(phaseId);
  const rel = norm(relPath);

  // 1. Overview READMEs are free demos
  if (file === "readme" || file === "00-readme" || phase === "readme" || phase === "00-readme") {
    return true;
  }

  // 2. Explicit legitimate demo files for courses
  const explicitDemos = [
    "phase-01-how-the-browser-works",
    "phase-01-how-the-internet-works",
    "phase-01-what-is-system-design",
    "javascript_comprehensive_guide_part1",
    "js_engine_deep_dive/readme",
    "01-introduction-to-databases",
    "phase-1/01-introduction-to-databases",
    "01-mongodb-basics",
    "phase_1_foundation/01-mongodb-basics",
    "typescript_backend_guide",
    "phase-1-getting-started",
    "01-css-basics",
    "01-html-basics",
  ];

  if (
    explicitDemos.some(
      (d) => file === d || phase === d || rel === d || file.endsWith(`/${d}`) || rel.endsWith(`/${d}`)
    )
  ) {
    return true;
  }

  // 3. Reject any Phase 10 through Phase 19 right away
  const isPhaseTeens = (s) => /phase[-_]?1[0-9]/i.test(s) || /[-_]1[0-9][-_]/i.test(s);
  if (isPhaseTeens(file) || isPhaseTeens(phase) || isPhaseTeens(rel)) {
    return false;
  }

  // 4. Strict regex: ONLY matches Phase 1 / Chapter 1 / Part 1
  const isStrictPhase1 = (s) =>
    /^(phase[-_]?0?1|0?1|part[-_]?0?1)([-_ ]|$)/i.test(s) ||
    /\/(0?1|phase[-_]?0?1)([-_ ]|$)/i.test(s);

  if (isStrictPhase1(file) || isStrictPhase1(phase)) {
    return true;
  }

  return false;
};

// Access control helper for course tracks
export const hasAccessToTrack = (userTiers, trackName) => {
  if (!userTiers || !Array.isArray(userTiers)) return false;
  const tiers = userTiers.map((t) => t.toLowerCase().replace(/[-_ ]/g, ""));
  const cleanTrack = trackName.toLowerCase().replace(/[-_ ]/g, "");

  // Super tiers unlock everything
  if (tiers.includes("pro") || tiers.includes("mentorship") || tiers.includes("fullstack")) {
    return true;
  }

  // Frontend bundle includes HTML, CSS, Tailwind, JavaScript, Frontend
  if (tiers.includes("frontendbundle")) {
    if (["frontend", "html", "css", "tailwind", "javascript"].includes(cleanTrack)) {
      return true;
    }
  }

  // Backend bundle includes SQL, MongoDB, System Design, TypeScript, Backend
  if (tiers.includes("backendbundle")) {
    if (["backend", "sql", "mongodb", "systemdesign", "typescript"].includes(cleanTrack)) {
      return true;
    }
  }

  // Exact track match (e.g. single course purchase like "frontend", "javascript", "sql")
  return tiers.includes(cleanTrack);
};
