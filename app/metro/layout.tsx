export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Canvas must be in the page, not the layout.
    // Next.js wraps page output with internal elements that R3F can't render.
    return <div className="h-screen w-screen">{children}</div>;
}
