export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center px-6 py-16 sm:px-10 lg:px-20">
      <main className="w-full max-w-[720px]">{children}</main>
    </div>
  )
}
