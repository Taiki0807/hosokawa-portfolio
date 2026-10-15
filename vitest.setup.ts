import { vi } from 'vitest'

// "server-only" は React Server 環境以外で import すると例外を投げるため、テストでは空にする
vi.mock('server-only', () => ({}))
