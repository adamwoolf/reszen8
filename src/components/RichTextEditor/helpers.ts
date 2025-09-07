/**
 * Convert HTML string into clean plain text for TTS.
 *
 * - Strips all HTML tags
 * - Converts <br> and <p> into newlines
 * - Converts <li> into bullet-like lines
 * - Collapses multiple spaces/newlines
 */
export function htmlToPlainText(html) {
  console.log(html);
  if (!html) return "";

  // Replace line-breaking tags with \n
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  // Convert <li> to "- " prefix
  text = text.replace(/<li[^>]*>/gi, "- ");

  // Strip all other tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities (e.g. &amp; → &)
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  text = textarea.value;

  // Normalize whitespace
  text = text.replace(/\n\s*\n\s*/g, "\n\n"); // collapse multiple blank lines
  text = text.replace(/[ \t]+/g, " "); // collapse spaces/tabs
  text = text.trim();
  console.log(text);
  return text;
}
