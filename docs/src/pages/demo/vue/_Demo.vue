<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCookiesBanner } from "cookies-eu-banner-vue";
import VueBanner from "./_VueBanner.vue";

const { mustShowBanner, hasConsent, setConsent, resetConsent, checkConsentAndShowBanner } =
	useCookiesBanner();

const consentState = computed(() => {
	if (hasConsent.value === true) {
		return "Accepted";
	}

	if (hasConsent.value === false) {
		return "Rejected";
	}

	return "No choice";
});

const accept = () => {
	setConsent(true);
};
const reject = () => {
	setConsent(false);
};
const reset = () => {
	resetConsent();
};

onMounted(() => {
	checkConsentAndShowBanner();
});
</script>

<template>
	<div class="demo__blocks">
		<div class="demo__state">
			<h3 class="m-section__subtitle">State</h3>

			<dl>
				<dt>Must show banner</dt>
				<dd>{{ mustShowBanner }}</dd>

				<dt>Consent state</dt>
				<dd>{{ consentState }}</dd>
			</dl>
		</div>

		<div class="demo__custom-controls">
			<h3 class="m-section__subtitle">Custom controls</h3>

			<div class="demo__buttons">
				<button class="c-button c-button--secondary" @click.prevent="accept">Accept</button>
				<button class="c-button c-button--secondary" @click.prevent="reject">Reject</button>
				<button class="c-button c-button--secondary" @click.prevent="reset">Reset the demo</button>
			</div>
		</div>
	</div>

	<VueBanner />
</template>

<style lang="scss">
@use "../../../assets/styles/components/button";
</style>
