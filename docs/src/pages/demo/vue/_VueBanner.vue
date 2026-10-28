<script setup lang="ts">
import { useCookiesBanner } from "cookies-eu-banner-vue";

const { mustShowBanner, setConsent } = useCookiesBanner();

const accept = () => {
	setConsent(true);
};
const reject = () => {
	setConsent(false);
};
</script>

<template>
	<Transition :duration="500" leave-to-class="cookies-eu-banner--before-remove">
		<div v-if="mustShowBanner" class="cookies-eu-banner__wrapper">
			<div class="cookies-eu-banner">
				<div class="cookies-eu-banner__text">
					<div class="cookies-eu-banner__title">Banner demo</div>
					<p class="cookies-eu-banner__message">
						This banner is for demo purpose only, and do not trigger anything.
					</p>
				</div>
				<button class="c-button c-button--secondary" @click.prevent="reject">Reject</button>
				<button class="c-button" @click.prevent="accept">Accept</button>
			</div>
		</div>
	</Transition>
</template>

<style lang="scss">
@use "../../../assets/styles/components/banner";
</style>
