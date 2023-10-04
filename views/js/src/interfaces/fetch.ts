export interface FetchOptions {
    method?:      "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "HEAD" | "OPTIONS" | "CONNECT";
    headers?:     any;
    body?:        any;
    mode?:        "cors" | "no-cors" | "same-origin";
    credentials?: "omit" | "same-origin" | "include";
    cache?:       "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
    redirect?:    "follow" | "error" | "manual";
}
