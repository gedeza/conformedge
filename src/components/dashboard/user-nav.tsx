"use client"

import { UserButton } from "@clerk/nextjs"

export function UserNav() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
      afterSignOutUrl="/"
    />
  )
}
