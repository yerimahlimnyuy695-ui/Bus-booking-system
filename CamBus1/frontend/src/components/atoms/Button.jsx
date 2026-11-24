export default function Button({ children, variant='primary', className='', ...props }) {
  const styles = variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : variant === 'outline' ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300';
  return <button className={`rounded-lg px-4 py-2 font-semibold transition ${styles} ${className}`} {...props}>{children}</button>;
}
