import { ComparisonProduct }        from "~/interfaces/comparison/product"
import { ComparisonCategory }       from "~/interfaces/comparison/category"
import { ComparisonFeaturesGroup, ComparisonFeatureInProductsList } from "~/interfaces/comparison/features"
import KeenSliderHelper             from '~/classes/keen-slider-helper'

type NullableObject<T> = T | null

export default interface State {
    results: {
        categories:      ComparisonCategory[]
        products:        ComparisonProduct[]
        featureGroups:   ComparisonFeaturesGroup[]
    },
    currentCategory:            NullableObject<ComparisonCategory>
    desktopSlider:              KeenSliderHelper
    mobileSliders:              KeenSliderHelper[]
    productFeatures:            ComparisonFeatureInProductsList
    isComparisonLoading:        boolean
    isFeatureDifferenceApplied: boolean
    isSliderLoaded:             boolean
    isProductBarActive:         boolean
    isMobile:                   boolean
    isArrowsVisible:            boolean
}
