import { handleCors } from '../../_shared/cors.ts'
import { notImplemented } from '../../_shared/errors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  return notImplemented('create_reservation')
})
