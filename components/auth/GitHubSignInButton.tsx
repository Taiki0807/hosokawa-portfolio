import { signIn } from '@/lib/auth/config'
import { GitHubIcon } from '@/components/ui/icons'

type Props = { label: string; redirectTo: string }

export default function GitHubSignInButton({ label, redirectTo }: Props) {
  return (
    <form
      action={async () => {
        'use server'
        await signIn('github', { redirectTo })
      }}
    >
      <button
        type="submit"
        className="bg-surface-950 text-ink-inverse-50 focus-visible:outline-brand-500 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold tracking-[0.02em] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <GitHubIcon />
        {label}
      </button>
    </form>
  )
}
