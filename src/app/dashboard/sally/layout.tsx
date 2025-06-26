export default function SallyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative h-screen overflow-hidden">{children}</div>;
}
