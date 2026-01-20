export default function Layout({ title, children }) {
  return (
    <div className="container">
      <h2 style={{ textAlign: "center" }}>{title}</h2>
      {children}
    </div>
  );
}
