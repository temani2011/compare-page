import { reactive, toRefs, toRaw }  from 'vue'
import State                        from '~/interfaces/comparison/state'
import { fetchRequest }             from "~/helpers/fetch"
import KeenSliderHelper             from '~/classes/keen-slider-helper'
import { KeenSliderInstance }       from 'keen-slider'
import { JsonApi, JsonApiItem }     from '~/interfaces/json-api'
import { ComparisonCategory }       from '~/interfaces/comparison/category'
import { ComparisonProduct }        from '~/interfaces/comparison/product'
import { ComparisonFeaturesGroup, ComparisonFeature, ComparisonFeatureInProductsList, ComparisonFeatureInProduct }  from '~/interfaces/comparison/features'

const defaultResults = {
    categories:      [] as ComparisonCategory[],
    products:        [] as ComparisonProduct[],
    featureGroups:   [] as ComparisonFeaturesGroup[],
}

const state = reactive<State>({
    results: JSON.parse(JSON.stringify(defaultResults)),
    currentCategory: null,
    desktopSlider: {} as KeenSliderHelper,
    mobileSliders: [] as KeenSliderHelper[],
    productFeatures: {} as ComparisonFeatureInProductsList,
    isComparisonLoading: false,
    isFeatureDifferenceApplied: false,
    isSliderLoaded: false,
    isProductBarActive: false,
    isMobile: false,
    isArrowsVisible: false,
})

const parseComparisonData = (response: JsonApi): void => {
    if (!response.data) return void 0

    response.data.forEach((element: JsonApiItem): void => {
        switch (element.type) {
        case 'category':
            if (element.attributes.active) state.currentCategory = element as ComparisonCategory
            state.results.categories.push(element as ComparisonCategory)
            break
        case 'product':
            state.results.products.push(element as ComparisonProduct)
            break
        case 'feature_group':
            state.results.featureGroups.push(element as ComparisonFeaturesGroup)
            break
        default:
            break
        }
    })

    getProductsFeature()

    return void 0
}

const getProductsFeature = () => {
    let features: ComparisonFeature[] = []

    state.results.featureGroups.forEach((group: ComparisonFeaturesGroup) => {
        if (group.attributes.features.length) features = features.concat(group.attributes.features)
    })

    features.forEach((feature: ComparisonFeature) => {
        const list: ComparisonFeatureInProduct[] = []

        state.results.products.forEach((product: ComparisonProduct) => {
            if (product.included) {
                const findedFeature = product.included?.find((pfeature: ComparisonFeature) => pfeature.id == feature.id)

                const value = findedFeature ? findedFeature.attributes.value : '-'

                const data: ComparisonFeatureInProduct = {
                    productId: product.id,
                    value: value,
                    showed: true,
                }

                if (findedFeature?.attributes.comments) data.comments = findedFeature?.attributes.comments

                list.push(data)
            }
        })

        Object.assign(state.productFeatures, { [feature.id]: list })
    })
}

const redirectToNextCategory = () => {
    const url = new URL(window.location.href)

    const category = state.results.categories.find((category: ComparisonCategory) => category.id !== state.currentCategory?.id)

    if (category) {
        url.searchParams.has('compare_category')
            ? url.searchParams.set('compare_category', category.id)
            : url.searchParams.append('compare_category', category.id)
    } else {
        if (url.searchParams.has('compare_category')) url.searchParams.delete('compare_category')
    }

    window.location.assign(url)
}

const changeComparisonCount = () => {
    const header = document.getElementById('header') as HTMLElement

    if (!header) return void 0
    const comparison = header.querySelector('.comparison .service-button__badge') as HTMLElement

    if (!comparison || !state.results.categories.length) return void 0

    const sum = state.results.categories.reduce(
        (accumulator: number, category: ComparisonCategory) => accumulator + (category.attributes.count ?? 0), 0
    )

    comparison.innerText = String(sum)
}

const actions = {
    async getComparison () {
        try {
            state.isComparisonLoading = true

            const url = new URL(window.location.href)

            const selectedCategory = url.searchParams.has('compare_category') ? url.searchParams.get('compare_category') : ''

            const params = {
                ajax: '1',
                action: 'get_page_data',
                compare_category: selectedCategory ?? '',
            }

            const query = new URLSearchParams(params).toString()

            const response = await fetchRequest(`/module/express_compare/compare?${query}`, {})

            parseComparisonData(response)
        } catch (error) {
            console.error(error)
        } finally {
            state.isComparisonLoading = false
        }
    },
    async clearComparisonList () {
        if (!state.currentCategory) return void 0

        try {
            const params = {
                ajax: '1',
                action: 'remove_category',
                id_category: state.currentCategory.id,
            }

            const query = new URLSearchParams(params).toString()

            const response = await fetchRequest(`/module/express_compare/compare?${query}`, {})

            if (!response) return void 0

            redirectToNextCategory()
        } catch (error) {
            console.error(error)
        }
    },
    async addToComparison (productId: string, sliderIndex = -1) {
        try {
            const find = state.results.products.find((product: ComparisonProduct) => product.id === productId)

            const action = !find ? 'add_product' : 'remove_product'

            const params = {
                ajax: '1',
                action: action,
                id_product: productId,
            }

            const query = new URLSearchParams(params).toString()

            const response = await fetchRequest(`/module/express_compare/compare?${query}`, {})

            if (!response) return void 0

            if (action === 'remove_product') {
                if (state.currentCategory?.attributes.count === 1) {
                    redirectToNextCategory()
                    return void 0
                }
                if (state.results.products.length !== 0) actions.removeProductFromState(productId, sliderIndex)
            }
        } catch (error) {
            console.error(error)
        }
    },
    changeTableFeatures () {
        const slider = state.desktopSlider.instance
        const sliderIndex = slider.track.details.rel as number

        let sliderCount = 1

        if (
            slider. options.slides !== null &&
            typeof slider.options.slides === 'object' &&
            typeof slider.options.slides.perView === 'number'
        ) {
            sliderCount = slider.options.slides.perView
        }

        const sliderMax = slider.track.details.maxIdx as number

        if (!Object.keys(state.productFeatures).length) return void 0

        // прятать стрелки если вьюпорт больше кол-ва слайдов
        state.isArrowsVisible = sliderCount < sliderMax + 1 ? true : false

        // фикс двойного вызова переключения слайдера
        if (sliderCount < sliderMax + 1 && sliderCount + sliderIndex > sliderMax + 1) return void 0

        const list = Object.values(<ComparisonFeatureInProductsList>state.productFeatures)

        list.forEach((features: ComparisonFeatureInProduct[]) => {
            features.forEach((feature: ComparisonFeatureInProduct, index: number) => {
                feature.showed = index >= sliderIndex && index < sliderCount + sliderIndex ? true : false
            })
        })
    },
    changeTableFeaturesMobile () {
        if (!Object.keys(state.productFeatures).length) return void 0

        const list = Object.values(<ComparisonFeatureInProductsList>state.productFeatures)

        const indexList:number[] = []

        state.mobileSliders.forEach(sliderHelper => {
            const slider = sliderHelper.instance
            indexList.push(slider.track.details.rel)
        })

        if (indexList.length !== 2) return void 0

        let reversed = false

        if (indexList[0] > indexList[1]) reversed = true

        list.forEach((features: ComparisonFeatureInProduct[]) => {
            let isRowReversed = false
            features.forEach((feature: ComparisonFeatureInProduct, index: number) => {
                feature.showed = indexList.includes(index) ? true : false
                if (indexList.includes(index) && reversed && !isRowReversed) {
                    feature.reversed = true
                    isRowReversed = true
                } else {
                    feature.reversed = false
                }
            })
        })
    },
    toggleFeatureDifference () {
        if (!Object.keys(state.productFeatures).length) return void 0

        let featuresToShow: string[] = []

        if (state.isFeatureDifferenceApplied) {
            Object.keys(state.productFeatures).forEach((key) => {

                const showedFeatures = state.productFeatures[key].filter(
                    (feature: ComparisonFeatureInProduct) => feature.showed === true
                )

                const firstFeature = showedFeatures[0]

                const isNotEqual = showedFeatures.some(
                    (feature: ComparisonFeatureInProduct) => feature.value !== firstFeature.value
                )

                if (isNotEqual) featuresToShow.push(key)
            })
        } else {
            featuresToShow = Object.keys(state.productFeatures)
        }

        state.results.featureGroups.forEach((group: ComparisonFeaturesGroup) => {
            if (group.attributes.features) {
                group.attributes.features.forEach((feature: ComparisonFeature) => {
                    featuresToShow.includes(String(feature.id))
                        ? feature.attributes.showed = true
                        : feature.attributes.showed = false
                })

                const allFeaturesInGroupAreHidden = group.attributes.features.every((feature: ComparisonFeature) => feature.attributes.showed === false)

                group.attributes.showed = allFeaturesInGroupAreHidden ? false : true
            }
        })
    },
    removeProductFromState (id: string, sliderIndex: number) {
        let index = -1

        index = state.results.products.findIndex((product: ComparisonProduct) => product.id === id)

        if (index < 0) return void 0

        state.results.products.splice(index, 1)

        const list = Object.values(<ComparisonFeatureInProductsList>state.productFeatures)

        list.forEach((features: ComparisonFeatureInProduct[]) => {
            features.splice(index, 1)
        })

        if (state.currentCategory) {
            state.currentCategory.attributes.count -= 1
        }

        if (!state.isMobile) {
            if (!state.desktopSlider) return void 0

            const sliderInstance = toRaw(state.desktopSlider).instance as KeenSliderInstance

            setTimeout(() =>  { // :(
                sliderInstance.update()
            }, 200)

            actions.changeTableFeatures()
        } else {
            if (!state.mobileSliders.length) return void 0

            state.mobileSliders.forEach((slider, index: number) => {
                const rawSlider = toRaw(slider) as KeenSliderHelper
                const sliderInstance = rawSlider.instance as KeenSliderInstance

                setTimeout(() => { // :(
                    sliderInstance.update()
                    rawSlider.updateInteraciveMarkup()
                }, 200)

                const currentRel = sliderInstance.track.details.rel

                if (sliderIndex !== index) return void 0

                sliderInstance.track.details.rel ===  sliderInstance.track.details.maxIdx
                    ? sliderInstance.moveToIdx(currentRel - 1)
                    : sliderInstance.moveToIdx(currentRel + 1)
            })

            actions.changeTableFeaturesMobile()
        }

        actions.toggleFeatureDifference()

        changeComparisonCount()
    },
}

const refs = toRefs(state)
export default {refs, actions}
