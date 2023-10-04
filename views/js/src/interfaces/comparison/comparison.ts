import {
    JsonApi,
    JsonApiAttributes,
    JsonApiItem,
    JsonApiRelationships,
} from '../json-api'

import {
    ProductBadge,
    RaitingAndComments,
} from './product'

export interface Comparison extends Omit<JsonApi, 'data'>  {
    data: ComparisionData[]
}

export interface ComparisionData extends JsonApiItem {
    type           : string
    id             : string
    links?         : ComparisonLinks
    attributes     : ComparisonAttributes
    included?      : Feature[]
    relationships? : ComparisionRelationships
}

export interface ComparisonLinks {
    self     : string,
    images?  : string[],
    invoice? : string,
}

export interface ComparisonAttributes extends JsonApiAttributes {
    title                : string
    count?               : number
    active?              : boolean
    depth?               : number
    width?               : number,
    height?              : number,
    available?           : boolean,
    available_for_order? : boolean,
    show_price?          : boolean,
    id_category?         : number,
    category?            : string,
    quantity?            : number,
    price?               : string,
    price_raw?           : number,
    old_price?           : string,
    old_price_raw?       : number,
    in_compare?          : boolean,
    in_wishlist?         : boolean,
    active_color?        : number,
    has_discount?        : boolean,
    cache_is_pack?       : boolean,
    discount_percentage? : number,
    showed               : boolean,
    image_active_index   : number,
    badges?              : ProductBadge[],
    comments?            : RaitingAndComments,
}

export interface Feature extends JsonApiItem {
    type       : string
    id         : string
    attributes : FeatureAttributes
}

export interface FeatureAttributes extends JsonApiAttributes {
    group_name  : string
    name        : string
    value       : string
    showed      : boolean
    comments?   : number
    description : string
}

export interface ComparisionRelationships extends JsonApiRelationships {
    product: ProductRelationships
}

export interface ProductRelationships extends JsonApiRelationships {
    data: ProductRelationshipsData
}

export interface ProductRelationshipsData {
    type : string
    id   : number
}

export interface FeatureInProductsList {
    [key: string]: FeatureInProduct[]
}

export interface FeatureInProduct {
    productId : string
    value     : string
    showed    : boolean
    comments? : number
    reversed? : boolean
}
