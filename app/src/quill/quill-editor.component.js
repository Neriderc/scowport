import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Delta } from "quill";

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "link"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote"],
  ["clean"]
];

export default function QuillEditor(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );
    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: props.placeholder,
      modules: {
        toolbar: toolbarOptions
      }
    });
    if (props.editorRef) props.editorRef(quill);

    if (props.defaultValue) {
      try {
        quill.setContents(JSON.parse(props.defaultValue).delta);
      } catch {
        quill.setText(props.defaultValue);
      }
    }

    if (props.quoteReply) {
      const data = JSON.parse(props.quoteReply.data.text);

      const quoteDelta = new Delta(data.delta);

      quoteDelta.ops.forEach(op => {
        if (typeof op.insert === "string" && op.insert.includes("\n")) {
          op.attributes = {
            ...op.attributes,
            blockquote: true
          };
        }
      });

      quoteDelta.insert("\n");

      quill.setContents(quoteDelta);
      quill.setSelection(quill.getLength(), 0);
    }

    // I cannot work out how to prevent the image being added into the editor
    // on paste, so this will delete any images if found since the image
    // should be attached to the message not be part of the text content
    quill.on("text-change", (delta, oldDelta, source) => {
      const contents = quill.getContents();
      let index = 0;

      contents.ops.forEach(op => {
        if (op.insert && op.insert.image) {
          quill.deleteText(index, 1, "silent");
        } else if (typeof op.insert === "string") {
          index += op.insert.length;
        } else {
          index += 1;
        }
      });

      props.genPreview(quill.getText(), quill.getContents());
    });

    return () => {
      props.editorRef.current = null;
      container.innerHTML = "";
    };
  }, []);

  return <div class="quill-container" ref={containerRef}></div>;
}