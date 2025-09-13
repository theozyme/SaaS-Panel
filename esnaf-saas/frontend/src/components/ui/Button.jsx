export default function Button({ variant="primary", className="", ...props }) {
  const map = {
    primary: "btn btn-primary",
    ghost: "btn btn-ghost",
    danger: "btn btn-danger",
  };
  return <button className={`${map[variant]} ${className}`} {...props} />;
}
