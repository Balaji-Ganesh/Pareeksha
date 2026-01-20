import MarkdownRenderer from "./MarkdownRenderer";

export default function QuestionOption({
  index,
  text,
  type,
  checked,
  onChange,
}) {
  return (
    <label className="option-container">
      <input
        type={type === "MSQ" ? "checkbox" : "radio"}
        checked={checked}
        onChange={onChange}
      />

      <span className="option-text">
        <b>{String.fromCharCode(65 + index)}.</b>{" "}
        <MarkdownRenderer text={text} />
      </span>
    </label>
  );
}
