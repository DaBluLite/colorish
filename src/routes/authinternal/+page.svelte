<script lang="ts">
	import { onMount } from "svelte";

	onMount(() =>
		window.open(`http://${window.location.host}/authpage`, "_blank")
	);
</script>

<div>Please sign in using the opened browser tab</div>

<style lang="scss">
	div {
		margin: auto;
		color: #fff;
		font-size: 20px;
		font-family: Comfortaa;
		font-weight: bold;
	}
</style>
