<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let items: { title: string; id: string }[] = [];
	export let activeitem: { title: string; id: string };

	const dispatch = createEventDispatcher();
</script>

{#if items.length > 1}
	<nav>
		<!-- svelte-ignore a11y-missing-attribute -->
		{#each items as item}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<a
				on:click={() => {
					dispatch("finish", item.id);
					activeitem = item;
				}}
				class={item.id == activeitem.id ? "active" : ""}>{item.title}</a
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
