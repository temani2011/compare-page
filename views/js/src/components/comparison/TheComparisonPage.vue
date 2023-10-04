<template>
    <section>
        <div>
            <TheLoader
                :is-loading="isComparisonLoading"
            />
        </div>
        <header class="col-span-12 xsm:col-start-3 xsm:col-span-8 sm:col-start-4 sm:col-span-6 lg:col-start-5 lg:col-span-4"
        >
            <h1 class="text-h3 col-span-12 mt-4 font-medium text-center uppercase tracking-[3px] sm:text-h2 sm:mt-0 sm:col-start-5 sm:col-end-9 md:text-h1">Сравнение</h1>
        </header>
        <div v-if="!isComparisonLoading && results.categories.length && results.products.length">
            <div class="col-span-12 mt-6 xsm:mt-10">
                <TheComparisonControls/>
            </div>
            <div class="col-span-12 mt-11">
                <TheComparisonSlider/>
            </div>
            <div class="col-span-12 mt-[5rem] sm:mt-12">
                <TheComparisonTable v-if="isSliderLoaded"/>
            </div>
        </div>
        <div v-else class="h-[25vh]">
            <h2 class="text-menu-item font-medium mt-10">Список сравнения пуст.</h2>
            <div class="mt-4"> Для добавления товаров к сравнению перейдите в каталог.</div>
            <a class="min-w-min px-5 py-3 border rounded-[0.5rem] text-button uppercase text-black border-pale-sky-30 cursor-pointer hover:bg-pale-sky-10 hover:border-pale-sky-10 font-medium h-10 text-center inline-block mt-4" href="/">Перейти в каталог</a>
        </div>
    </section>
</template>


<script lang="ts">
import { defineComponent } from "vue"
import comparisonStore from "~/store/comparison"
import TheLoader from "~/components/misc/TheLoader.vue"
import TheComparisonSlider from "~/components/comparison/TheComparisonSlider.vue"
import TheComparisonControls from "~/components/comparison/TheComparisonControls.vue"
import TheComparisonTable from "~/components/comparison/TheComparisonTable.vue"

export default defineComponent({
    name: "ComparisonPage",
    data() {
        return {}
    },
    setup() {
        const { results, isComparisonLoading, isSliderLoaded } = comparisonStore.refs
        const getComparison = comparisonStore.actions.getComparison

        return {
            isComparisonLoading,
            getComparison,
            results,
            isSliderLoaded,
        }
    },
    created()  {
        this.getComparison()
    },
    methods: {
    },
    components: {
        TheLoader,
        TheComparisonSlider,
        TheComparisonControls,
        TheComparisonTable,
    },
})
</script>

<style lang="scss">
    $className: "comparison-page";

    .#{$className} {}
</style>
