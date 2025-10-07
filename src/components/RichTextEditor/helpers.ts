/**
 * Convert HTML string into clean plain text for TTS.
 *
 * - Strips all HTML tags
 * - Converts <br> and <p> into newlines
 * - Converts <li> into bullet-like lines
 * - Collapses multiple spaces/newlines
 */
export function htmlToPlainText(html, keepBreaks = true) {
  if (!html) return "";

  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n");

  text = text.replace(/<li[^>]*>/gi, "- ");

  // Step: Remove <break> tags if keepBreaks is false
  if (!keepBreaks) {
    text = text.replace(/<break\b[^>]*\/?>/gi, ""); // safely remove <break> or <break .../>
  }

  // Strip all other tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  text = textarea.value;

  // Normalize whitespace
  text = text.replace(/\n\s*\n\s*/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();

  return text;
}
