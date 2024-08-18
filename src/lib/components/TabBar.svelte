<script lang="ts">
	import { page } from "$app/stores";

	export let items: { title: string; href: string; activeref?: string }[] =
		[];
</script>

{#if items.length > 1}
	<nav>
		{#each items as item}
			<a
				href={item.href}
				class={$page.url.pathname.startsWith(
					item.activeref || item.href
				)
					? "active"
					: ""}>{item.title}</a
			>
		{/each}
	</nav>
{/if}

<style lang="scss">
	nav {
		width: 100%;
		height: 30px;
		& > a {
			color: #fff;
			text-decoration: none;
			padding: 4px 12px;
			border-radius: 32px;
			transition: 0.2s ease;
			margin-right: 8px;
			&:hover {
				background-color: #1f1f1f;
			}
			&.active {
				color: #000;
				background-color: #fff;
			}
		}
	}
</style>
