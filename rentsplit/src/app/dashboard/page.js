'use client';
import { getUserSession } from "@/core/session";

export default async function dashboard() {
  const user = await getUserSession()
  return <main className="">{JSON.stringify(user)}</main>
}