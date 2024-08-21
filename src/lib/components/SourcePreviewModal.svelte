<script lang="ts">
	import { colorToHex } from "$lib/utils/utils";
	import { onMount } from "svelte";
	import ModalHeaderClose from "./ModalHeaderClose.svelte";

	export let source: { name: string; url?: string; colorways?: Colorway[] };

	let colorways: Colorway[] = [];

	onMount(async () => {
		if (source.url) {
			const response = await fetch(source.url);

			const data = await response.json();

			colorways = data.colorways || [];
		} else {
			colorways = source.colorways || [];
		}
	});

	export let open: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if open}
	<div class="backdrop" on:click|self={() => (open = false)}>
		<dialog open class="modal">
			<div class="modal-content">
				<ModalHeaderClose
					modal_title={`Preview for ${source.name}`}
					modal_open={{ set: (value) => (open = value) }}
				/>
				<div class="selector">
					{#each colorways
						.map( (color) => (color.colors ? color : { ...color, colors: ["accent", "primary", "secondary", "tertiary"] }) )
						.map((color) => {
							const colors = {};
							color.colors?.map((colorStr) => (colors[colorStr] = colorToHex(color[colorStr])));
							return { ...color, colorObj: colors };
						}) as color}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div class="colorway" id={"colorway-" + color.name}>
							<div class="colorwayColors">
								{#if !color.isGradient}
									{#each Object.values(color.colorObj) as colorStr}
										<div
											class="color"
											style={`background-color: #${colorToHex(
												colorStr
											)}`}
										/>
									{/each}
								{:else}
									<div
										class="color"
										style={`background: linear-gradient(${color.linearGradient})`}
									/>
								{/if}
							</div>
							<span class="label">{color.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</dialog>
	</div>
{/if}

<style lang="scss">
	.modal-content {
		min-width: 400px;
	}
	.modal {
		max-width: 500px;
	}
	.selector {
		padding: 0;
		overflow: hidden auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		height: calc(100% - 8px);
		scrollbar-width: none !important;
		&::-webkit-scrollbar {
			width: 0;
		}
		& > .colorway {
			display: flex;
			flex-direction: row;
			justify-content: start;
			padding: 0 8px;
			gap: 5px;
			border-radius: 6px;
			background-color: #101010;
			box-sizing: border-box;
			min-height: 44px;
			align-items: center;
			border: 1px solid transparent;
			transition: 0.2s ease;
			cursor: pointer;
			color: #dfdfdf;
			&:hover {
				background-color: #2a2a2a;
			}
			&[aria-checked="true"] {
				background-color: #2a2a2a;
				border-color: #a6a6a6;
			}
			& .label {
				margin-right: auto;
				margin-left: 0.5rem;
			}
			& > .colorwayColors {
				display: flex;
				flex-flow: wrap;
				flex-direction: row;
				overflow: hidden;
				border-radius: 50%;
				width: 30px;
				height: 30px;
				box-shadow: 0 0 0 1.5px #a6a6a6;
				box-sizing: border-box;
				& > .color {
					width: 50%;
					height: 50%;
				}
				&:not(:has(> .color:nth-child(2))) > .color {
					width: 100%;
					height: 100%;
				}
				&:not(:has(> .color:nth-child(3))) > .color {
					height: 100%;
				}
				&:not(:has(> .color:nth-child(4))) > .color:nth-child(3) {
					width: 100%;
				}
			}
		}
	}
</style>
