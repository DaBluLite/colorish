<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import TabBar from "$lib/components/TabBar.svelte";
	import { boundClients } from "$lib/store";
	import { getClientDisplayName } from "$lib/utils/utils";
	let tabs = [
		{
			title: "This Manager",
			href: "/devices/this/about",
			activeref: "/devices/this",
			onClick: () => invalidateAll(),
		},
	];

	export let data;

	if (
		data.boundClientKey &&
		data.url.pathname.includes(encodeURI(data.boundClientKey))
	) {
		goto(`/sources/${data.boundClientKey}/about`);
	}

	Object.values($boundClients).forEach((cl) => {
		const tabTitle: string = Object.values(
			JSON.parse(cl.boundKey)
		)[0] as string;

		tabs.push({
			title: getClientDisplayName(tabTitle),
			href: `/devices/${encodeURI(cl.boundKey)}/about`,
			activeref: `/devices/${encodeURI(cl.boundKey)}`,
			onClick: () => invalidateAll(),
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
						onClick: () => invalidateAll(),
					});
			})
	);
</script>

<TabBar items={tabs} />
<slot />
