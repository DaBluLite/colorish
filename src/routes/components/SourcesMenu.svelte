<script lang="ts">
	let pos = { x: 0, y: 0 };
	let showMenu = false;
	export let sources: { name: string; id: string }[],
		source: { name: string; id: string };

	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	function rightClickContextMenu(e) {
		showMenu = !showMenu;
		pos = {
			x: e.currentTarget.getBoundingClientRect().x,
			y:
				e.currentTarget.getBoundingClientRect().y +
				e.currentTarget.offsetHeight +
				8,
		};
	}
	function onPageClick() {
		showMenu = false;
	}

	function onSourceChange_internal(src: { name: string; id: string }) {
		dispatch("sourcechange", src);
		showMenu = false;
		source = src;
	}
</script>

{#if showMenu}
	<nav style="position: absolute; top:{pos.y}px; left:{pos.x}px">
		{#each sources as { name, id }}
			<button
				on:click={() => onSourceChange_internal({ name, id })}
				class="colorwaysContextMenuItm"
			>
				{name}
				<svg
					aria-hidden="true"
					role="img"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					style="margin-left: 8px;"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
						fill="currentColor"
					/>
					{#if source.id == id}
						<circle fill="#fff" cx="12" cy="12" r="5" />
					{/if}
				</svg>
			</button>
		{/each}
	</nav>
{/if}

<button
	class="button"
	on:click|stopPropagation={(e) => {
		rightClickContextMenu(e);
	}}
>
	Source: {source.name}
</button>
<svelte:window on:click={onPageClick} />

<style lang="scss">
	nav {
		border-radius: 8px;
		border: 1px solid #dfdfdf;
		background-color: #000;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		z-index: 5;
		& > button {
			box-sizing: border-box;
			display: flex;
			justify-content: space-between;
			align-items: center;
			min-height: 32px;
			padding: 6px 8px;
			border-radius: 6px;
			background-color: #101010;
			border: 1px solid transparent;
			transition: 0.2s ease;
			cursor: pointer;
			color: #dfdfdf;
			&:hover,
			&.active {
				background-color: #2a2a2a;
				border-color: #a6a6a6;
			}
		}
	}
</style>
