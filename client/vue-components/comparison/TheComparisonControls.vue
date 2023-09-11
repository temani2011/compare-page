<template>
    <div :class="$bem({})" class="grid-container">
        <div :class="$bem({ e: 'left' })">
            <div class="toggle-switch">
                <span :class="$bem({ e: 'toggle-text' })">Показывать только различия</span>
                <label>
                    <input
                        type="checkbox"
                        class="toggle-switch__checkbox"
                        v-model="isFeatureDifferenceApplied"
                        @change="toggleFeatureDifference"
                    >
                    <span class="toggle-switch__track">
                        <span class="toggle-switch__indicator">
                            <span class="toggle-switch__mark">
                            </span>
                        </span>
                    </span>
                </label>
            </div>
        </div>
        <div :class="$bem({ e: 'categories' })" class="scrollbar-custom scrollbar-hide">
            <div :class="$bem({ e: 'categories-list' })">
                <a
                    v-for="(category, index) in results.categories"
                    :class="$bem({ e: 'categories-item', m: { 'active': category.attributes?.active }})"
                    :key="index.toString()"
                    :href="category.attributes?.active ? '#' : 'compare?compare_category=' + category.id"
                >
                    {{ category.attributes.title }}&nbsp;({{ category.attributes.count }})
                </a>
            </div>
        </div>
        <div :class="$bem({ e: 'sub-categories' })" class="scrollbar-custom scrollbar-hide">
            <div :class="$bem({ e: 'sub-categories-list' })">
                <a
                    v-for="(category, index) in results.categories"
                    :class="$bem({ e: 'sub-categories-item', m: { 'active': category.attributes?.active }})"
                    :key="index.toString()"
                    :href="category.attributes?.active ? '#' : 'compare?compare_category=' + category.id"
                >
                    {{ category.attributes.title }}&nbsp;({{ category.attributes.count }})
                </a>
            </div>
        </div>
        <div :class="$bem({ e: 'right', m: { 'between': user !== null && user.logged } })">
            <span :class="$bem({ e: 'invoice' })" v-if="user?.logged">
                <a :href="printLink" title="Печать сравнения" target="_blank">
                    <svg class="stroke-pale-sky-100" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <use href="#icon-print"></use>
                    </svg>
                </a>
            </span>
            <div :class="$bem({ e: 'clear' })" v-if="currentCategory" @click="clearComparisonList">
                <span>Очистить список</span>
                <svg  class="stroke-pale-sky-100" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <use href="#icon-trash"></use>
                </svg>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import store from "~/store/base"
import comparisonStore from "~/store/comparison"
import { ComparisonProduct } from "~/interfaces/comparison/product"

export default defineComponent({
    name: 'ComparisonControls',
    setup() {
        const { results, currentCategory, isFeatureDifferenceApplied } = comparisonStore.refs
        const { user } = store.refs
        const toggleFeatureDifference = comparisonStore.actions.toggleFeatureDifference
        const clearComparisonList = comparisonStore.actions.clearComparisonList

        return {
            user,
            results,
            currentCategory,
            isFeatureDifferenceApplied,
            toggleFeatureDifference,
            clearComparisonList,
        }
    },
    computed: {
        printLink (): string {
            if (!this.currentCategory) return ''

            const url = new URL(window.location.origin + this.currentCategory.links.invoice)
            const porductIds: string[] = this.results.products.map((product: ComparisonProduct) => product.id)
            url.searchParams.append('products', JSON.stringify(porductIds))
            return url.toString()
        },
    },
})
</script>

<style lang="scss">
    $className: "comparison-controls";

    .#{$className} {
        &__categories {
            @apply col-span-12 sm:col-span-4 md:col-span-6 xlg:col-span-8 pb-3 sm:pb-0 mt-4 sm:my-auto overflow-x-auto order-1 sm:order-none;
        }
        &__categories-list {
            @apply flex items-center sm:flex-wrap justify-start sm:justify-center;
        }
        &__categories-item {
            @apply block text-body-small text-pale-sky-100 ml-1 px-4 py-1 rounded-[0.25rem] cursor-pointer text-center hover:border hover:border-pale-sky-30 border border-white whitespace-nowrap;

            &:nth-child(n+2) {
                @apply sm:hidden md:block;
            }

            &:nth-child(n+3) {
                @apply md:hidden xlg:block;
            }

            &:nth-child(n+5) {
                @apply xlg:hidden;
            }

            &--active {
                @apply ml-0 bg-pale-sky-70 text-white;
            }
        }
        &__sub-categories {
            @apply col-span-12 hidden sm:block;
        }
        &__sub-categories-list {
            @apply flex items-center sm:flex-wrap justify-start sm:justify-center;
        }
        &__sub-categories-item {
            @extend .#{$className}__categories-item;
            @apply mt-3;

            &:nth-child(n+2),
            &:nth-child(n+3),
            &:nth-child(n+5) {
                @apply block;
            }

            &:nth-child(-n+1) {
                @apply sm:hidden;
            }

            &:nth-child(-n+2) {
                @apply md:hidden;
            }

            &:nth-child(-n+4) {
                @apply xlg:hidden;
            }

            &--active {
                @apply ml-0 bg-pale-sky-70 text-white;
            }
        }
        &__left {
            @apply col-span-6 sm:col-span-4 md:col-span-3 xlg:col-span-2 flex items-baseline;

            .toggle-switch {
                @apply items-center flex-nowrap;
            }
        }
        &__right {
            @apply col-span-6 sm:col-span-4 md:col-span-3 xlg:col-span-2 mt-0 text-body-small flex items-center justify-end;

            &--between {
                @apply gap-4 justify-end xsm:justify-between xsm:gap-0;
            }
        }
        &__toggle.toggle-switch:last-of-type {
            @apply mt-6;
        }
        &__toggle-text {
            @apply ml-2 my-auto text-pale-sky-100 text-body-small py-1 whitespace-nowrap;
        }
        &__invoice {
            @apply cursor-pointer transition-opacity duration-100 hover:opacity-70 ml-2;
        }
        &__clear {
            @apply flex gap-3 text-pale-sky-100 cursor-pointer transition-opacity duration-100 hover:opacity-70;

            & > span {
                @apply hidden xsm:block;
            }
        }
    }
</style>

