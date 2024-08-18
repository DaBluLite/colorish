<script lang="ts">
	import TabBar from "$lib/components/TabBar.svelte";
</script>

<TabBar
	items={[
		{ title: "About", href: "/devices/this/about" },
		{ title: "Online", href: "/devices/this/online" },
		{ title: "Offline", href: "/devices/this/offline" },
	]}
/>
<slot />
