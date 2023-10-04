export interface JsonApiError {
    status:         string,
    code:           string,
    title:          string,
    detail:         string,
}

export interface JsonApiAttributes {
    title:          string,
    [key: string]: unknown
}

export interface JsonApiRelation {
    type: string,
    id: string,
}
export interface JsonApiRelationships {
}

export interface JsonApiLinks {
    self:           string
}

export interface JsonApiItem {
    type:           string,
    id:             string,
    attributes:     JsonApiAttributes,
    relationships?: JsonApiRelationships,
    links?:         JsonApiLinks,
}

export interface JsonApiMeta {
    [key:string]: unknown
}

export interface JsonApi extends Object {
    data:       JsonApiItem[],
    included:  JsonApiItem[],
    errors?:    JsonApiError[],
    links?: {
        self: string
    },
    meta?: JsonApiMeta
}

export interface JsonApiSingle extends Object {
    data:       JsonApiItem,
    included?:  JsonApiItem[],
    errors?:    JsonApiError[],
    links?: {
        self: string
    },
    meta?: JsonApiMeta
}

