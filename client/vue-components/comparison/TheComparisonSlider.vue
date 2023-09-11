<template>
    <section :class="$bem({ m: { 'mobile': isMobile, 'hide-arrows': !isArrowsVisible } })" ref="slider-wrapper">
        <div v-show="!isMobile" class="keen-slider-wrapper">
            <div ref="products" class="keen-slider">
                <div class="keen-slider__slide" v-for="(product, index) in results.products" :key="index.toString()">
                    <ProductCard :item="product" :showRating="false"/>
                    <div :class="$bem({ e: 'remove' })" @click="addToComparison(product.id)">
                        <svg>
                            <use href="#icon-close"></use>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="isMobile" class="grid-container">
            <div v-for="i in 2" :key="i" class="col-span-6 keen-slider-wrapper">
                <div ref="mobileproducts" class="keen-slider">
                    <div class="keen-slider__slide" v-for="(product, index) in results.products" :key="index.toString()">
                        <ProductCard :item="product" :showRating="false"/>
                        <div :class="$bem({ e: 'remove' })" @click="addToComparison(product.id, index)">
                            <svg>
                                <use href="#icon-close"></use>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, nextTick, toRaw } from "vue"
import ProductCard from "~/client/vue-components/misc/ProductCard.vue"
import throttle from "~/helpers/throttle"
import comparisonStore from "~/store/comparison"
import KeenSliderHelper from '~/classes/keen-slider-helper'
import { KeenSliderInstance } from 'keen-slider'

export default defineComponent({
    name: "ComparisonSlider",
    data() {
        return {
            preventSlideEvent: false,
        }
    },
    setup() {
        const { results, desktopSlider, mobileSliders, isProductBarActive, isMobile, isSliderLoaded, isArrowsVisible } = comparisonStore.refs
        const changeTableFeatures = comparisonStore.actions.changeTableFeatures
        const changeTableFeaturesMobile = comparisonStore.actions.changeTableFeaturesMobile
        const toggleFeatureDifference = comparisonStore.actions.toggleFeatureDifference
        const addToComparison = comparisonStore.actions.addToComparison

        return {
            results,
            desktopSlider,
            mobileSliders,
            changeTableFeatures,
            changeTableFeaturesMobile,
            toggleFeatureDifference,
            isProductBarActive,
            isMobile,
            isSliderLoaded,
            isArrowsVisible,
            addToComparison,
        }
    },
    mounted() {
        this.resizeHandler()
        const throttledResizeHandler = throttle(this.resizeHandler, 500)
        const throttledScrollHandler = throttle(this.scrollHandler, 150)
        window.addEventListener('scroll', () => throttledScrollHandler())
        window.addEventListener('resize', () => throttledResizeHandler())
    },
    methods: {
        async initMobileSliders() {
            await nextTick()

            if (this.mobileSliders.length) return void 0

            if (Object.values(this.desktopSlider).length !== 0) {
                this.desktopSlider.destroy()
                this.desktopSlider = {} as KeenSliderHelper
            }

            const containers = this.$refs.mobileproducts as NodeListOf<HTMLElement>

            if (!containers.length) return void 0

            containers.forEach((container: HTMLElement, index: number) => {
                const slider = new KeenSliderHelper(
                    container,
                    {
                        loop: false,
                        initial: index,
                        slides: {
                            perView: 1,
                        },
                        defaultAnimation: {
                            duration: 50,
                        },
                    }
                )

                slider.createAdditionalMarkup({
                    arrows: {
                        enable: true,
                    },
                    dots: {
                        enable: false
                    },
                    counter: {
                        enable: true
                    }
                })
                const sliderInstance = slider.instance
                sliderInstance.on('slideChanged', this.handleSlideChange)
                sliderInstance.on('optionsChanged', this.handleSlideChange)

                this.mobileSliders.push(slider)
            })

            this.changeTableFeaturesMobile()

            this.isSliderLoaded = true
        },
        async initSlider() {
            await nextTick()

            if (Object.keys(this.desktopSlider).length) return void 0

            if (this.mobileSliders.length !== 0) {
                this.mobileSliders.forEach(slider => slider.destroy())
                this.mobileSliders = []
            }

            const container = this.$refs.products as HTMLElement

            if (!container) return void 0

            const slider = new KeenSliderHelper(
                container,
                {
                    loop: false,
                    slides: {
                        perView: 2,
                        spacing: 16
                    },
                    defaultAnimation: {
                        duration: 50,
                    },
                    breakpoints: {
                        '(min-width: 640px)': {
                            slides: {
                                perView: 2,
                                spacing: 24
                            }
                        },
                        '(min-width: 960px)': {
                            slides: {
                                perView: 3,
                                spacing: 24
                            }
                        },
                        '(min-width: 1200px)': {
                            slides: {
                                perView: 4,
                                spacing: 40
                            }
                        },
                        '(min-width: 1680px)': {
                            slides: {
                                perView: 6,
                                spacing: 40
                            }
                        }
                    }
                }
            )

            slider.createAdditionalMarkup({
                arrows: {
                    enable: true,
                },
                dots: {
                    enable: false
                },
                counter: {
                    enable: false
                }
            })
            this.desktopSlider = slider

            this.changeTableFeatures()

            const sliderInstance = slider.instance
            sliderInstance.on('slideChanged', this.handleSlideChange)
            sliderInstance.on('optionsChanged', this.handleSlideChange)

            this.isSliderLoaded = true
        },
        scrollHandler () {
            const scrolled = window.scrollY as number
            const slider = this.$refs['slider-wrapper'] as HTMLElement

            if (!slider) return void 0

            this.isProductBarActive = scrolled > slider.offsetTop + slider.offsetHeight + 40 ? true : false

        },
        resizeHandler () {
            const viewportWidth = window.innerWidth as number
            this.isMobile = viewportWidth < 960 ? true : false
            this.isMobile ? this.initMobileSliders() : this.initSlider()
        },
        handleMobileSliderOverlap (eventSlider: KeenSliderInstance) {
            if (this.preventSlideEvent) {
                this.preventSlideEvent = false
                return void 0
            }

            const currentRel = eventSlider.track.details.rel

            this.mobileSliders.forEach(el => {
                const instance = el.instance

                if (
                    toRaw(instance) !== eventSlider &&
                    currentRel === instance.track.details.rel
                ) {

                    instance.track.details.rel ===  instance.track.details.maxIdx
                        ? instance.moveToIdx(currentRel - 1)
                        : instance.moveToIdx(currentRel + 1)

                    this.preventSlideEvent = true
                }
            })
        },
        handleSlideChange (e?: KeenSliderInstance) {
            if (Object.keys(this.desktopSlider).length === 0 && this.mobileSliders.length === 0 || !e) return void 0

            if (this.isMobile) this.handleMobileSliderOverlap(e)

            this.isMobile ? this.changeTableFeaturesMobile() : this.changeTableFeatures()
            this.toggleFeatureDifference()
        },
    },
    components: {
        ProductCard,
    },
})
</script>

<style lang="scss">
$className: "comparison-slider";

.#{$className} {
    .card {
        @apply md:h-[420px] lg:h-[450px] xlg:h-[380px] xxlg:h-[506px];
    }
    .card__functional {
        @apply hidden;
    }
    .card__code {
        @apply flex lg:hidden xxlg:flex flex-grow-[1];
    }
    .card__price-and-button-wrapper {
        @apply lg:w-full lg:order-3 lg:justify-between;
    }
    .card__price--new {
        @apply mb-0;
    }
    .card__cart-button {
        @apply lg:mt-0;
    }
    .card__status {
        @apply lg:w-full lg:order-4;
    }

    .card__price-and-button-wrapper {
        @apply justify-between w-full order-3 mb-0;
    }

    &__remove {
        @apply absolute text-center w-6 h-6 bg-pale-sky-10 rounded-full z-[40] left-[calc(100%-1.5rem)] xsm:left-[calc(100%-2.5rem)] top-4 cursor-pointer;

        svg {
            @apply pointer-events-none w-3 h-3 m-auto mt-[6px] fill-black;
        }
    }

    .keen-slider-wrapper__arrow {
        @apply flex top-[35%] w-8 h-8 rounded-full bg-pale-sky-10;
    }

    .keen-slider-wrapper__arrow--prev {
        @apply -left-4;
    }

    .keen-slider-wrapper__arrow--next {
        @apply -right-4;
    }

    &--hide-arrows {
        .keen-slider-wrapper__arrow {
            @apply hidden;
        }
    }

    &--mobile {
        .card__code {
            @apply hidden xsm:flex;
        }

        .card__header {
            @apply px-0 xsm:px-4;
        }

        .card__footer {
            @apply mx-0 xsm:m-4;
        }

        .card__price-and-button-wrapper {
            @apply mt-3 xsm:mt-0;
        }

        .card__price-wrapper {
            @apply flex-col gap-2 xsm:flex-row xsm:gap-0;
        }

        .keen-slider-wrapper__counter {
            @apply flex bottom-[-30px];
        }

        .keen-slider-wrapper__current-value {
            @apply text-body leading-6 font-normal;
        }

        .keen-slider-wrapper__arrow--prev {
            @apply left-0 p-0 ml-0 xsm:ml-4;
        }

        .keen-slider-wrapper__arrow--next {
            @apply right-0 p-0 mr-0 xsm:mr-4;
        }

        .keen-slider-wrapper__arrow {
            @apply w-0 h-4 top-[105%] block;

            svg {
                @apply w-5 h-4;
            }
        }
    }

}
</style>
