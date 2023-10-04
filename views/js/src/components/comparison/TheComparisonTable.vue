<template>
    <div :class="$bem({})">
        <TheComparisonProductBar/>
        <div
            :class="$bem({ e: 'group',  m: { closed: !group.attributes.showed } })"
            v-for="(group, index) in results.featureGroups"
            :key="index.toString()"
        >
            <div :class="$bem({ e: 'header' })" @click="toggleFeatureGroup(index)">
                <span :class="$bem({ e: 'title' })" class="mr-2">{{ group.attributes.title }}</span>
                <svg
                    :class="$bem({ e: 'icon', m: { closed: !group.attributes.showed } })"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M6 14.71L12 8.99977L18 14.71" stroke="black" stroke-width="2"/>
                </svg>
            </div>
            <transition name="fade">
                <div :class="$bem({ e: 'content' })" v-show="group.attributes.showed">
                    <div
                        :class="$bem({ e: 'item' })"
                        v-show="feature.attributes.showed" v-for="(feature, index) in group.attributes.features"
                        :key="index.toString()"
                    >
                        <div :class="$bem({ e: 'subtitle' })">
                            <span>{{ feature.attributes.title }}</span>
                            <div v-if="feature.attributes.description" class="question-mark-prompt">
                                <div class="question-mark-prompt__question">?</div>
                                    <div class="modal-prompt">
                                        <span v-html="feature.attributes.description"></span>
                                    <div class="modal-prompt__arrow"></div>
                                </div>
                            </div>
                        </div>
                        <div :class="$bem({ e: 'row' })" class="grid-container">
                            <div
                                :class="$bem({ e: 'column', m: { reversed: !!featureData.reversed } })"
                                v-show="featureData.showed"
                                v-for="(featureData, index) in productFeatures[feature.id]"
                                :key="index.toString()"
                            >
                                <span :class="$bem({ e: 'value' })" v-if="group.id != '-1'">
                                    {{ featureData.value }}
                                </span>
                                <span v-else :class="$bem({ e: 'value', m: 'stars' })">
                                    <StarRating
                                        :rating="Number(featureData.value)"
                                        :increment="0.01"
                                        :read-only="true"
                                        :show-rating="false"
                                        :star-size="16"
                                        active-color="#F2994A"
                                    />
                                    <a :href="results.products[index].links.self" v-if="featureData.comments"> {{ pluralizedCommentsCount(featureData.comments) }}</a>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import comparisonStore from "~/store/comparison"
import TheComparisonProductBar from "~/components/comparison/TheComparisonProductBar.vue"
import StarRating from 'vue-star-rating'
import pluralize from '~/helpers/pluralize'

export default defineComponent({
    name: "ComparisonTable",
    data() {
        return {}
    },
    setup() {
        const { results, productFeatures } = comparisonStore.refs

        return { results, productFeatures }
    },
    methods: {
        pluralizedCommentsCount(number: number): string {
            return pluralize(number, ['отзыв', 'отзыва', 'отзывов'])
        },
        toggleFeatureGroup(index: number) {
            const element = this.results.featureGroups[index]
            element.attributes.showed = !element.attributes.showed
        }
    },
    components: {
        StarRating,
        TheComparisonProductBar,
    }
})
</script>

<style lang="scss">
    $className: "comparison-table";

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .#{$className} {
        .question-mark-prompt {
            @apply inline-block ml-2 text-caption w-4 h-4 rounded-full bg-pale-sky-10 text-center cursor-pointer;
        }
        .vue-star-rating {
            @apply pb-[0.15rem];
        }
        .vue-star-rating-star {
            @apply first:ml-0 mx-[6px] xsm:mx-2 last:mr-0
        }
        &__group {
            @apply mb-12 mt-4;

            &--closed {
                @apply border-b-[1px] border-pale-sky-30 mb-0;
            }
        }
        &__header {
            @apply flex text-menu-item tracking-[2px] cursor-pointer font-semibold uppercase mb-2 xsm:px-4;
        }
        &__title {
            @apply mr-2;
        }
        &__icon--closed {
            @apply rotate-180;
        }
        &__content {
            @apply transition-height duration-300 ease-out;
        }
        &__row {
            @apply border-b-[1px] border-pale-sky-30;
        }
        &__subtitle {
            @apply font-semibold pt-2 xsm:px-4;
        }
        &__container {
            @apply font-semibold pt-2;
        }
        &__column {
            @apply col-span-6 sm:col-span-4 md:col-span-3 xlg:col-span-2 py-2 text-shuttle-gray font-normal order-1 xsm:px-4;

            &--reversed {
                @apply order-2;
            }
        }
        &__value--stars {
            @apply flex flex-col xsm:flex-row xsm:items-center gap-1 xsm:gap-3;
        }
    }
</style>
