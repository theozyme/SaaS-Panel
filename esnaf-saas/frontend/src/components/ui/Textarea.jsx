export default function Textarea({ className="", ...props }) {
  return <textarea className={`input ${className}`} {...props} />;
}
