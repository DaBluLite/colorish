<script lang="ts">
	import TabBar from "$lib/components/TabBar.svelte";
	import { boundClients } from "$lib/store";
	import { redirect } from "@sveltejs/kit";

	export let data;

	const tabs: { title: string; href: string }[] = [
		{
			title: "About",
			href: `/devices/${encodeURI(data.boundKey)}/about`,
		},
	];

	if (
		!$boundClients[decodeURI(data.boundKey)] &&
		(data.url.pathname.includes("online") ||
			data.url.pathname.includes("offline"))
	)
		throw redirect(301, "/devices/this/about");

	if (
		$boundClients[decodeURI(data.boundKey)] &&
		$boundClients[decodeURI(data.boundKey)]
	) {
		tabs.push({
			title: "Online",
			href: `/devices/${encodeURI(data.boundKey)}/online`,
		});
	}
	if (
		$boundClients[decodeURI(data.boundKey)] &&
		$boundClients[decodeURI(data.boundKey)].offline
	) {
		tabs.push({
			title: "Offline",
			href: `/devices/${encodeURI(data.boundKey)}/offline`,
		});
	}
</script>

<TabBar items={tabs} />
<slot />
