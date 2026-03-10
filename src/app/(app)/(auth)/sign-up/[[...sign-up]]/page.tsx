import { SignUp } from "@clerk/nextjs"

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-background to-muted/30">
      <SignUp />
      <p className="text-xs text-muted-foreground/60">
        Developed by{" "}
        <a
          href="https://isutech.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground transition-colors"
        >
          iSu Technologies
        </a>
      </p>
    </div>
  )
}
