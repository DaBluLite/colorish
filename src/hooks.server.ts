import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit';
import { handle as authenticationHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
 
async function authorizationHandle({ event, resolve }) {
  if (event.url.pathname.startsWith('/protected') || event.url.pathname.startsWith('/creator')) {
    const session = await event.locals.auth();
    if (!session) {
      throw redirect(303, '/authinternal?redirect=' + event.url.pathname);
    }
  }

  if (event.url.pathname.startsWith('/authinternal')) {
    const session = await event.locals.auth();
    if (session) {
        if((event as RequestEvent).url.searchParams.get("redirect")) {
          throw redirect(303, (event as RequestEvent).url.searchParams.get("redirect")!);
        } else {
          throw redirect(303, '/');
        }
    }
  }

  return resolve(event);
}
export const handle: Handle = sequence(authenticationHandle, authorizationHandle)