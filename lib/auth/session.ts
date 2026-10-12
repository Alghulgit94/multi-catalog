import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./server"
import { asc, eq } from "drizzle-orm"
import { getDb, schema } from "../db"
import { storeDb, type StoreDb } from "../data/store-db"
import type { MemberRole, StoreRow } from "../store-types"

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session.user
}

export async function requireSuperadmin() {
  const user = await requireUser()
  if (!(user as { isSuperadmin?: boolean }).isSuperadmin) redirect("/panel")
  return user
}

export interface StoreContext {
  user: { id: string; email: string; name: string; emailVerified: boolean }
  store: StoreRow
  role: MemberRole
  /** Acceso a datos ya limitado a la tienda del usuario. */
  db: StoreDb
}

/**
 * Tienda activa del usuario logueado. Hoy es su primera membresía; cuando un
 * usuario tenga varias tiendas se elige acá (cookie/selector), en un solo lugar.
 */
export const getStoreContext = cache(async (): Promise<StoreContext | null> => {
  const session = await getSession()
  if (!session) return null

  const membership = await getDb().query.store_members.findFirst({
    where: eq(schema.store_members.user_id, session.user.id),
    columns: { role: true },
    with: { stores: true },
    orderBy: asc(schema.store_members.created_at),
  })
  if (!membership?.stores) return null

  return {
    user: session.user,
    store: membership.stores,
    role: membership.role,
    db: storeDb(membership.stores.id),
  }
})

/** Para páginas y server actions del panel: exige sesión y tienda. */
export async function requireStoreContext(): Promise<StoreContext> {
  await requireUser()
  const ctx = await getStoreContext()
  if (!ctx) redirect("/registro")
  return ctx
}
