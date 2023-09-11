import {
    JsonApiAttributes,
    JsonApiItem,
} from '../json-api'

export interface ComparisonCategoryLinks {
    self     : string,
    invoice? : string,
}

export interface ComparisonCategoryAttributes extends JsonApiAttributes {
    count   : number
    active  : boolean
}

export interface ComparisonCategory extends JsonApiItem {
    attributes : ComparisonCategoryAttributes
    links      : ComparisonCategoryLinks
}
