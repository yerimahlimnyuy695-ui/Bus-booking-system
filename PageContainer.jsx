export default function PageContainer({ children, width='max-w-6xl' }) { return <main className={`mx-auto ${width} px-4 py-10`}>{children}</main>; }
