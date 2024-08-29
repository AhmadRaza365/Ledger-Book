import "./loader.css";

type props = {
  width: number;
  borderWidth: number;
  color: "primary" | "secondary";
};

function Loader({ width, borderWidth, color }: props) {
  return (
    <div
      className="loader"
      style={{
        width: `${width}px`,
        borderWidth: `${borderWidth}px`,
        borderColor: color === "secondary" ? "hsl(var(--secondary))" : "hsl(var(--primary))",
      }}
    ></div>
  );
}

export default Loader;
