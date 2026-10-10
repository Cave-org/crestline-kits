"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const s = typeof next === "string" ? next : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter your email and password" };
  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !ok) return { error: "That email and password don't match" };
  await createSession(user.id, user.role);
  redirect(safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/account"));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^((\+?233|0)\d{9})?$/, "Enter a Ghana phone number, like 024 123 4567")
    .optional(),
  password: z.string().min(8, "Use at least 8 characters for your password"),
});

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const exists = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (exists) return { error: "An account with that email already exists. Sign in instead." };
  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    })
    .returning();
  await createSession(user.id, user.role);
  redirect(safeNext(formData.get("next"), "/account"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
