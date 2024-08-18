import {redirect} from '@sveltejs/kit';
import type {PageServerLoad}
from './$types';

export const load: PageServerLoad = async ({locals, url}) => {
    const session = await locals.auth();
    if (! session ?. user) 
        throw redirect(303, '/authinternal?redirect=' + url.pathname);
    


    return {};
};