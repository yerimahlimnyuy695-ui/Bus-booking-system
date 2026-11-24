import FieldLabel from '../atoms/FieldLabel.jsx';
export default function FormField({ label, children, ...props }) { return <div {...props}><FieldLabel>{label}</FieldLabel>{children}</div>; }
