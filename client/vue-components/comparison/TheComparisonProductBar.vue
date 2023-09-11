<template>
    <div :class="$bem({ m: { hidden: !isProductBarActive } })">
        <div :class="$bem({ e: 'wrapper' })">
            <div :class="$bem({ e: 'container' })" class="grid-container">
                <div
                    :class="$bem({ e: 'item' })"
                    v-show="productFeatures[-1][index].showed"
                    v-for="(product, index) in results.products"
                    :key="index.toString()"
                >
                    <picture :class="$bem({ e: 'picture' })">
                        <img :class="$bem({ e: 'img' })" :src="product.links.images ? product.links.images[0] : ''">
                    </picture>
                    <div :class="$bem({ e: 'content' })">
                            <span :class="$bem({ e: 'category' })">{{ product.attributes.category }}</span>
                            <span :class="$bem({ e: 'title' })">{{ product.attributes.title }}</span>
                            <span :class="$bem({ e: 'price' })">
                                {{ product.attributes.price }}&nbsp;
                                <s v-if="product.attributes.old_price_raw > 0" :class="$bem({ e: 'price-old' })">
                                    {{ product.attributes.old_price }}
                                </s>
                            </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import comparisonStore from "~/store/comparison"

export default defineComponent({
    name: "ComparisonProductBar",
    data() {
        return {}
    },
    setup() {
        const { results, productFeatures, isProductBarActive } = comparisonStore.refs

        return {
            results,
            productFeatures,
            isProductBarActive,
        }
    },
});
</script>

<style lang="scss">
    $className: "comparison-product-bar";

    .#{$className} {
        @apply sticky top-[3.9rem] z-[1] w-full shadow-lg;

        &--hidden {
            @apply hidden;
        }
        &__wrapper {
            @apply absolute -left-[7.5rem] -right-[7.5rem] px-[7.5rem] bg-pale-sky-10;
        }
        &__container {
            @apply py-4;
        }
        &__item {
            @apply flex col-span-6 sm:col-span-4 md:col-span-3 xlg:col-span-2;
        }
        &__picture {
            @apply my-auto mr-2;
        }
        &__img {
            @apply  w-full object-cover rounded-lg h-[3.625rem];
        }
        &__content {
            @apply flex flex-col flex-auto overflow-hidden w-full relative after:block after:absolute after:top-0 after:right-0 after:h-full after:w-[45%];

            &::after {
                background: linear-gradient(to right, #ffffff00 0%, #eff0f1 100%);
            }
        }
        &__category {
            @apply text-pale-sky-70 whitespace-nowrap overflow-hidden w-full relative;
        }
        &__title {
            @apply block w-full font-semibold whitespace-nowrap overflow-hidden relative text-black text-body;
        }
        &__price {
            @apply font-semibold not-italic;
        }
        &__price-old {
            @apply text-caption text-pale-sky-70 ml-1;
        }
    }
</style>
