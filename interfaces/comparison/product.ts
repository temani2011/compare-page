import {
    BaseProduct,
    BaseProductRelationships,
    BaseProductLinks
} from '../base/product'
import { ComparisonFeature } from './features'

export interface ComparisonProductLinks extends BaseProductLinks {
    image: string
}

export interface ComparisonProductRelatedFeature {
    type:   string
    id:     number
}

export interface ComparisonProductRelatedFeaturesList {
    data: ComparisonProductRelatedFeature
}

export interface ComparisonProductRelationships extends Omit<BaseProductRelationships, 'colors'> {
    features: ComparisonProductRelatedFeaturesList
}

export interface ComparisonProduct extends Omit<BaseProduct, 'relationships' | 'links'> {
    relationships: ComparisonProductRelationships
    links: ComparisonProductLinks
    included: ComparisonFeature[]
}
