#!/usr/bin/env node
/**
 * Generate VAPID keys for Web Push (RFC 8292).
 *
 * Outputs:
 *   VITE_VAPID_PUBLIC_KEY  — raw 65-byte base64url public key (browser-safe)
 *   VAPID_PUBLIC_KEY       — JWK JSON object (Edge Function secret)
 *   VAPID_PRIVATE_KEY      — JWK JSON object (Edge Function secret)
 *
 * Run:  node scripts/generate-vapid-keys.mjs
 * Requires Node 20+ (uses webcrypto).
 */
import { webcrypto } from 'node:crypto'

const subtle = webcrypto.subtle

function bytesToBase64Url(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function main() {
  const keyPair = await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  )

  const publicKeyJwk = await subtle.exportKey('jwk', keyPair.publicKey)
  const privateKeyJwk = await subtle.exportKey('jwk', keyPair.privateKey)

  // Compute raw 65-byte uncompressed public key: 0x04 || X || Y
  const xBytes = Uint8Array.from(
    atob(publicKeyJwk.x.replace(/-/g, '+').replace(/_/g, '/').padEnd(publicKeyJwk.x.length + (publicKeyJwk.x.length % 4 ? 4 - (publicKeyJwk.x.length % 4) : 0), '=')),
    c => c.charCodeAt(0),
  )
  const yBytes = Uint8Array.from(
    atob(publicKeyJwk.y.replace(/-/g, '+').replace(/_/g, '/').padEnd(publicKeyJwk.y.length + (publicKeyJwk.y.length % 4 ? 4 - (publicKeyJwk.y.length % 4) : 0), '=')),
    c => c.charCodeAt(0),
  )
  const rawPublicKey = new Uint8Array(65)
  rawPublicKey[0] = 0x04
  rawPublicKey.set(xBytes, 1)
  rawPublicKey.set(yBytes, 33)

  const rawPublicKeyBase64Url = bytesToBase64Url(rawPublicKey)

  console.log('='.repeat(70))
  console.log('VAPID Key Generation Complete')
  console.log('='.repeat(70))
  console.log()
  console.log('1. Add to Vercel / .env.local:')
  console.log(`   VITE_VAPID_PUBLIC_KEY=${rawPublicKeyBase64Url}`)
  console.log()
  console.log('2. Set Supabase Edge Function secrets:')
  console.log(`   supabase secrets set VAPID_PUBLIC_KEY='${JSON.stringify(publicKeyJwk)}'`)
  console.log(`   supabase secrets set VAPID_PRIVATE_KEY='${JSON.stringify(privateKeyJwk)}'`)
  console.log()
  console.log('IMPORTANT: The VAPID_PRIVATE_KEY is never exposed to the browser.')
}

main()
