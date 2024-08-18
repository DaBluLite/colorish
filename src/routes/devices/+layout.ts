import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, url }) => {
	return {
		boundClientKey: params.boundClientKey,
		url: url
	};
};