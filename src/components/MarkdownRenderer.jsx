import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownRenderer({ text }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || "");

          if (match) {
            return (
              <SyntaxHighlighter style={dracula} language={match[1]}>
                {String(children)}
              </SyntaxHighlighter>
            );
          }

          return <code className="inline-code">{children}</code>;
        },
        p({ children }) {
          return <span>{children}</span>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
