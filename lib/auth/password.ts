// lib/auth/password.ts
import argon2 from 'argon2'

export async function hashPassword(plain: string) {
  // argon2id by default (secure)
  return argon2.hash(plain)
}
export async function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain)
}
