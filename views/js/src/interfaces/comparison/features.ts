import {
    JsonApiAttributes,
    JsonApiItem,
} from '../json-api'

export interface ComparisonFeatureAttributes extends JsonApiAttributes {
    group_name: string
    showed:     boolean
    value:      number
    comments? : number
    reversed? : boolean
    description : string
}

export interface ComparisonFeature extends JsonApiItem {
    attributes: ComparisonFeatureAttributes
}

export interface ComparisonFeaturesGroupsAttributes extends JsonApiAttributes {
    showed:     boolean
    features:   ComparisonFeature[]
}

export interface ComparisonFeaturesGroup extends JsonApiItem {
    attributes:     ComparisonFeaturesGroupsAttributes
}

export interface ComparisonFeatureInProduct {
    productId : string
    value     : string | number
    showed    : boolean
    comments? : number
    reversed? : boolean
}

export interface ComparisonFeatureInProductsList {
    [key: string]: ComparisonFeatureInProduct[]
}
