import {
    JsonApiAttributes,
    JsonApiItem,
    JsonApiRelationships,
    JsonApiLinks
} from "~/interfaces/json-api"

import { ComparisonFeature } from './features'

export interface BaseProduct extends JsonApiItem {
    attributes: BaseProductAttributes
    relationships: BaseProductRelationships
    links: BaseProductLinks
}

export interface BaseProductAttributes extends JsonApiAttributes {
    width: number,
    height: number,
    depth: number,
    available_for_order: boolean,
    available: boolean,
    multiplicity: number,
    show_price: boolean,
    id_product_attribute: number,
    proddays: string,
    quantity: number,
    in_wishlist: boolean,
    in_compare: boolean,
    cache_is_pack: boolean,
    category_show_sizes: boolean,
    importantListingFeatures?: NameAndValue[],
    id_product_attribute_group: number,
    visibility: string,
    image_active_index: number,
    show_color: boolean,
    has_discount: boolean,
    price: string,
    price_raw: number,
    old_price: string,
    old_price_raw: number,
    discount_percentage: string,
    badges: ProductBadge[],
    comments: RaitingAndComments,
    category_name: string,
    colors: {
        count: number
        colorText: string
    } | null,
    showColorlessText: boolean,
}

export interface BaseProductRelationships extends JsonApiRelationships {
    categories: Category,
    colors: Colors
}

export interface BaseProductLinks extends JsonApiLinks {
    images: string[],
}

export interface NameAndValue {
    name: string,
    value: string
}

export interface Category {
    data: RelationData
}

export interface Colors {
    data: RelationData[]
}

export interface RelationData {
    id: string,
    title: string
}

export interface RaitingAndComments {
    number_of_comments: number
    comments_rating: number
    comments_word: string
    comments_link: string
}

export interface ProductBadge {
    class:          string,
    description:    string,
    name:           string
}

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
