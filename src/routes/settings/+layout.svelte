<script>
	import TabBar from "$lib/components/TabBar.svelte";
</script>
<TabBar items={[
    { title: "Main", href: "/settings/main" },
    { title: "About", href: "/settings/about" }
]} />
<slot/>