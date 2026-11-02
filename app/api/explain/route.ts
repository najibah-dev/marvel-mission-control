// This public route never loads provider credentials or makes outbound calls.
export async function POST() {
  return Response.json({error:'Film explanations are available in the dashboard.'}, {status:410, headers:{'Cache-Control':'no-store'}});
}
