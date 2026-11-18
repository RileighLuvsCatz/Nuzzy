import { serializeRunLibrary } from "./storage";

export function downloadRunLibrary(): void {
  const blob = new Blob([serializeRunLibrary()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = `nuzzy-runs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    // Give the browser time to begin consuming the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
