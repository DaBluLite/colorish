<script lang="ts">
	import ColorPicker from "svelte-awesome-color-picker";

	let boundAccent = "#5865f2";
	let boundSecond = "#2b2d31";
	let boundPrimary = "#313338";
	let boundTertiary = "#1e1f22";

	import "bootstrap-icons/font/bootstrap-icons.scss";
	import SaveColorwayModal from "../components/SaveColorwayModal.svelte";
	import { savecolorwaymodal_open } from "$lib/store";

	let colorwayName = "";
</script>

<div class="wrap">
	<div class="modal-content">
		<h2 class="modal-header">
			<a href="/" class="icon">&#xF12F;</a>Create a colorway:
		</h2>
		<span class="sect-header">Name:</span>
		<input
			type="text"
			placeholder="Enter a valid name..."
			bind:value={colorwayName}
		/>
		<span class="sect-header">Colors:</span>
		<div style="display: flex; gap: .75rem;">
			<ColorPicker
				name="accent"
				label="Accent"
				bind:hex={boundAccent}
				--cp-border-color="#fff"
				--cp-input-color="#333"
				--cp-bg-color="#333"
			/>
			<ColorPicker
				name="primary"
				label="Primary"
				bind:hex={boundPrimary}
				--cp-border-color="#fff"
				--cp-input-color="#333"
				--cp-bg-color="#333"
			/>
			<ColorPicker
				name="secondary"
				label="Secondary"
				bind:hex={boundSecond}
				--cp-border-color="#fff"
				--cp-input-color="#333"
				--cp-bg-color="#333"
			/>
			<ColorPicker
				name="tertiary"
				label="Tertiary"
				bind:hex={boundTertiary}
				--cp-border-color="#fff"
				--cp-input-color="#333"
				--cp-bg-color="#333"
			/>
		</div>
		<button
			class="button"
			on:click={() => savecolorwaymodal_open.set(true)}
		>
			Create...
		</button>
	</div>
</div>

<SaveColorwayModal
	colorway={{
		name: colorwayName,
		accent: boundAccent,
		primary: boundPrimary,
		secondary: boundSecond,
		tertiary: boundTertiary,
		author: "dablulite",
		authorID: "582170007505731594",
	}}
/>

<style lang="scss">
	.icon {
		font-family: bootstrap-icons;
		text-decoration: none;
		color: #fff;
	}
	.wrap {
		display: flex;
		& > div {
			width: 50%;
		}
	}
	.modal-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
