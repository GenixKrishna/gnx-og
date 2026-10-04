"use client"

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs"

export function AuthControls() {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-md border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e701]">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-md bg-[#00e701] px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-[#20ff20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            Get started
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/80 py-1 pl-2 pr-1">
          <span className="hidden max-w-32 truncate text-xs text-slate-200 sm:block">
            {user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account"}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </Show>
    </div>
  )
}

export function SignedOutWelcome() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1b3342] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-600/70 bg-[#213743] p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#00e701] text-xl font-black text-slate-950 shadow-lg shadow-[#00e701]/20">
          G
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#00e701]">Genix</p>
        <h1 className="text-2xl font-semibold text-white">Your workspace starts here</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in to access the Mines Predictor and keep your activation linked to your account.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <SignInButton mode="modal">
            <button className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e701]">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-lg bg-[#00e701] px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#20ff20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Create account
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  )
}

export function AuthLoading() {
  return <div className="min-h-screen bg-[#1b3342]" aria-label="Loading authentication" />
}
