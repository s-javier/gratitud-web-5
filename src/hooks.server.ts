export async function handle({ event, resolve }: any) {
  // if (event.url.pathname === '/ping') {
  //   return new Response('pong')
  // }
  // return await resolve(event, {
  //   transformPageChunk: ({ html }) => html.replace('<body', '<body style="color: hotpink"'),
  // })
  console.log('hook')
  console.log(event.url.pathname)
  return await resolve(event)
}
