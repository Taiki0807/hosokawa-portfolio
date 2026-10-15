export type MigrationJournal = { entries: { tag: string; when: number }[] }

/** drizzle の __drizzle_migrations.created_at は journal の when と同じ値になる */
export function findMissingMigrations(journal: MigrationJournal, appliedCreatedAt: number[]) {
  const applied = new Set(appliedCreatedAt.map(Number))
  return journal.entries.filter((e) => !applied.has(e.when)).map((e) => e.tag)
}
