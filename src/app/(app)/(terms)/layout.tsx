import Image from "next/image"

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/images/logo-icon.png"
            alt="ConformEdge"
            width={48}
            height={48}
            priority
          />
          <h1 className="text-xl font-bold tracking-tight">ConformEdge</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
