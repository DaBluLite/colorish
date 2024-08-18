<script lang="ts">
	import TabBar from "$lib/components/TabBar.svelte";
	import { boundClients } from "$lib/store";
	import { getClientDisplayName } from "$lib/utils/utils";
	import { redirect } from "@sveltejs/kit";
	let tabs = [
		{
			title: "This Manager",
			href: "/devices/this/about",
			activeref: "/devices/this",
		},
	];

	export let data;

	if (
		data.boundClientKey &&
		data.url.pathname.includes(encodeURI(data.boundClientKey))
	) {
		redirect(302, `/sources/${data.boundClientKey}/about`);
	}

	Object.values($boundClients).forEach((cl) => {
		const tabTitle: string = Object.values(
			JSON.parse(cl.boundKey)
		)[0] as string;

		tabs.push({
			title: getClientDisplayName(tabTitle),
			href: `/devices/${encodeURI(cl.boundKey)}/about`,
			activeref: `/devices/${encodeURI(cl.boundKey)}`,
		});
	});

	window.electron.receive(
		"update-bound-clients",
		({
			clients,
		}: {
			clients: {
				[boundKey: string]: {
					boundKey: string;
					complications?: string[];
					online?: any[];
					offline?: any[];
				};
			};
		}) =>
			Object.values(clients).forEach((cl) => {
				const tabTitle: string = Object.values(
					JSON.parse(cl.boundKey)
				)[0] as string;

				if (
					!tabs
						.map(({ activeref }) => activeref)
						.includes(`/devices/${encodeURI(cl.boundKey)}`)
				)
					tabs.push({
						title: getClientDisplayName(tabTitle),
						href: `/devices/${encodeURI(cl.boundKey)}/about`,
						activeref: `/devices/${encodeURI(cl.boundKey)}`,
					});
			})
	);
</script>

<TabBar items={tabs} />
<slot />
