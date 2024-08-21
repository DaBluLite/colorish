import type { PageLoad } from "./$types";
import { DataStore } from "$lib/api";
import { goto } from "$app/navigation";

export const load: PageLoad = () => {
    DataStore.get("Username").then((Username) => {
		if (!Username) {
			goto("/signin");
		}
	});
}