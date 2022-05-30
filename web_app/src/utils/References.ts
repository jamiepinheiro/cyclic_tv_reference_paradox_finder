import { Reference } from "../types/Reference";

export function CleanupReference(r: Reference) {
  // Remove any XML from text
  const div = document.createElement("div");
  div.innerHTML = r.text;
  r.text = div.textContent || div.innerText || "";

  // Pretty print the time
  r.start_time = r.start_time
    ?.split(",")[0]
    .split(":")
    .map(n =>
      parseInt(n).toLocaleString("en-US", {
        minimumIntegerDigits: 2
      })
    )
    .reduce((prev, curr) => prev + (prev !== "" ? ":" : "") + curr, "");
}
