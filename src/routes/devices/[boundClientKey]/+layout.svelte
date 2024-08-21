<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import TabBar from "$lib/components/TabBar.svelte";
	import { boundClients } from "$lib/store";

	if (
		!$boundClients[$page.params.boundClientKey] &&
		$page.url.pathname.includes(
			encodeURI($page.params.boundClientKey as string)
		)
	) {
		goto("/devices/this/about");
	}

	let tabs: { title: string; href: string }[] = [];

	$: {
		tabs = [
			{
				title: "About",
				href: `/devices/${encodeURI(
					$page.params.boundClientKey
				)}/about`,
			},
		];
		Object.keys(
			$boundClients[decodeURI($page.params.boundClientKey)]
		).forEach((key) => {
			if (key == "online") {
				tabs.push({
					title: "Online",
					href: `/devices/${encodeURI(
						$page.params.boundClientKey
					)}/online`,
				});
			}
			if (key == "offline") {
				tabs.push({
					title: "Offline",
					href: `/devices/${encodeURI(
						$page.params.boundClientKey
					)}/offline`,
				});
			}
		});
	}
</script>

<TabBar items={tabs} />
<slot />
