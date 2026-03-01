import { APP_NAME } from "@/lib/constants"

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">{APP_NAME}</h1>
            <p className="text-xs text-muted-foreground">Shared Compliance View</p>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ISU Technologies. Powered by {APP_NAME}.
        </div>
      </footer>
    </div>
  )
}
