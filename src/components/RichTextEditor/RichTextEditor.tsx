import React, { useRef, useState, useEffect } from "react";
import "./RichTextEditorStyles.scss";
import { htmlToPlainText } from "./helpers";
import { marked } from "marked";
// RichTextEditor.jsx
// - contentEditable-based editor with toolbar (headings, bold, italic, lists, paragraph)
// - outputs HTML or Markdown
// - basic keyboard shortcuts: Ctrl/Cmd+B, Ctrl/Cmd+I

export default function RichTextEditor({ initialHtml = "", onChange }) {
  const editorRef = useRef(null);
  const [mode, setMode] = useState("html"); // "html" or "markdown"
  const [output, setOutput] = useState("");
  const [plainText, setPlainText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml;
      syncOutput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Sync when mode changes
    syncOutput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const exec = (command, value = null) => {
    // Use execCommand for common formatting. It's still widely supported.
    document.execCommand(command, false, value);
    syncOutput();
    editorRef.current?.focus();
  };

  const handleHeading = (level) => {
    exec("formatBlock", `h${level}`);
  };

  const handleParagraph = () => exec("formatBlock", "p");
  const handleBold = () => exec("bold");
  const handleItalic = () => exec("italic");
  const handleUL = () => exec("insertUnorderedList");
  const handleOL = () => exec("insertOrderedList");

  const handlePaste = (e) => {
    // paste as plain text to avoid messy HTML
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, text);
    syncOutput();
  };

  const syncOutput = () => {
    const html = editorRef.current?.innerHTML || "";
    setOutput(html);
    setPlainText(htmlToPlainText(html));
    onChange({ html: output, plainText });
  };

  const htmlToMarkdown = (html) => {
    // Very small HTML -> Markdown converter that supports headings, p, strong/b, em/i, ul/ol/li, a
    const root = document.createElement("div");
    root.innerHTML = html;

    const walk = (node, listContext = null) => {
      if (!node) return "";
      const nodeName = node.nodeName.toLowerCase();

      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue.replace(/\s+/g, " ");
      }

      if (nodeName === "br") return "  \n"; // markdown line break

      if (nodeName.match(/^h[1-6]$/)) {
        const level = Number(nodeName[1]);
        return "\n" + "#".repeat(level) + " " + childrenToText(node).trim() + "\n\n";
      }

      if (nodeName === "p") {
        return "\n" + childrenToText(node).trim() + "\n\n";
      }

      if (nodeName === "strong" || nodeName === "b") {
        return `**${childrenToText(node).trim()}**`;
      }

      if (nodeName === "em" || nodeName === "i") {
        return `*${childrenToText(node).trim()}*`;
      }

      if (nodeName === "a") {
        const href = node.getAttribute("href") || "";
        return `[${childrenToText(node).trim()}](${href})`;
      }

      if (nodeName === "ul") {
        return (
          "\n" +
          Array.from(node.children)
            .map((li) => `- ${childrenToText(li).trim()}`)
            .join("\n") +
          "\n\n"
        );
      }

      if (nodeName === "ol") {
        return (
          "\n" +
          Array.from(node.children)
            .map((li, i) => `${i + 1}. ${childrenToText(li).trim()}`)
            .join("\n") +
          "\n\n"
        );
      }

      if (nodeName === "li") {
        return childrenToText(node).trim();
      }

      // fallback: recurse
      return childrenToText(node);
    };

    const childrenToText = (node) => {
      let out = "";
      node.childNodes.forEach((child) => {
        out += walk(child);
      });
      return out;
    };

    const md = childrenToText(root).trim();
    return md;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // small visual feedback could be implemented
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleExport = () => {
    syncOutput();
    if (mode === "html") return editorRef.current?.innerHTML || "";
    return htmlToMarkdown(editorRef.current?.innerHTML || "");
  };

  const handleKeyDown = (e) => {
    // shortcuts
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      handleBold();
    }
    if (meta && e.key.toLowerCase() === "i") {
      e.preventDefault();
      handleItalic();
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <div className='flex items-center gap-2 mb-2'>
        <div className='bg-gray-100 rounded-md p-1 flex gap-1'>
          <button onClick={() => handleHeading(2)} className='editor__format-cta'>
            Heading 2
          </button>
          <button onClick={() => handleHeading(3)} className='editor__format-cta'>
            Heading 3
          </button>
          <button onClick={() => handleParagraph()} className='editor__format-cta'>
            Normal
          </button>
          <button onClick={handleBold} className='editor__format-cta'>
            B
          </button>
          <button onClick={handleItalic} className='editor__format-cta'>
            I
          </button>
          <button onClick={handleUL} className='editor__format-cta'>
            Bullet List
          </button>
          <button onClick={handleOL} className='editor__format-cta'>
            Numbered List
          </button>
        </div>

        <div>
          {/* <select value={mode} onChange={(e) => setMode(e.target.value)} className='border rounded p-1'>
            <option value='html'>HTML</option>
            <option value='markdown'>Markdown</option>
          </select> */}

          {/* <button
            onClick={() => {
              syncOutput();
              copyToClipboard(mode === "html" ? output : output);
            }}
            className='px-2 py-1 rounded bg-blue-600 text-white'
          >
            Copy {mode === "html" ? "HTML" : "Markdown"}
          </button> */}
        </div>
      </div>
      <div className='editor__panels'>
        <div>{output && <section dangerouslySetInnerHTML={{ __html: marked(output) }} />}</div>

        <div
          className='editor'
          ref={editorRef}
          onInput={syncOutput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          contentEditable
          suppressContentEditableWarning
          style={{ whiteSpace: "pre-wrap" }}
        />
      </div>

      {/* <div className='mt-3 flex gap-2'>
        <button
          onClick={() => {
            // Provide the HTML or Markdown to caller (could be wired via props callbacks)
            const exported = handleExport();
            // For demo, copy to clipboard
            copyToClipboard(exported);
          }}
          className='px-3 py-1 bg-green-600 text-white rounded'
        >
          Export & Copy
        </button>

        <button
          onClick={() => {
            // Clear editor
            if (editorRef.current) editorRef.current.innerHTML = "";
            syncOutput();
          }}
          className=''
        >
          Clear
        </button>
      </div> */}
    </div>
  );
}
