<template>
    <article class="card" :class="{'card--show-params': showParams}" :data-id-product="product.id">
        <div class="card__wrapper">
            <header
                v-if="!minified"
                class="card__header"
            >
                <div class="card__code-and-flag-wrapper">
                    <div class="card__flag" :class="{'hidden': !product.attributes.has_discount}">
                        <div class="flag">
                            <span
                                class="flag__value"
                            >
                                <template v-if="product.attributes.has_discount && product.attributes.discount_percentage">
                                    {{ product.attributes.discount_percentage }}
                                </template>
                            </span>
                            <div class="flag__injection"></div>
                        </div>
                    </div>
                    <div class="card__code">
                        <span class="card__code-prompt">Код:&nbsp;</span>
                        <span class="card__code-number">{{product.id}}</span>
                    </div>
                </div>
                <div class="card__functional">
                    <div class="card__comparison">
                        <div
                            class="comparison button-compare-add"
                            :class="{'comparison--active': product.attributes.in_compare}"
                            :data-id-product="product.id"
                            :rel="product.id"
                        >
                            <div
                                class="service-button service-button--comparison group"
                                :class="{'service-button--active': product.attributes.in_compare}"
                            >
                                <svg class="service-button__icon">
                                    <use href="#icon-comparison"></use>
                                </svg>
                                <div class="service-button__badge service-button__badge--icon">
                                    <svg
                                        class="service-button__badge-icon"
                                    >
                                        <use href="#icon-plus-sign"></use>
                                    </svg>
                                    <span class="service-button__badge-icon service-button__badge-icon--active">
                                        <svg>
                                            <use href="#icon-minus-sign"></use>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card__favorite">
                        <div
                            class="favorite button-wishlist-add"
                            :class="{'favorite--active': product.attributes.in_wishlist}"
                            :data-id-product="product.id"
                            :rel="product.id"
                        >
                            <div
                                class="service-button service-button--favorite group"
                                :class="{'service-button--active': product.attributes.in_wishlist}"
                            >
                                <svg class="service-button__icon">
                                    <use href="#icon-favorite"></use>
                                </svg>
                                <div class="service-button__badge service-button__badge--icon">
                                    <svg
                                        class="service-button__badge-icon"
                                    >
                                        <use href="#icon-plus-sign"></use>
                                    </svg>
                                    <svg
                                        class="service-button__badge-icon service-button__badge-icon--active"
                                    >
                                        <use href="#icon-minus-sign"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div class="card__main">
                <a
                    :href="product.links.self"
                    class="card__img-link"
                >
                    <figure>
                        <picture>
                            <img
                                class="card__img"
                                :alt="product.attributes.title"
                                :src="getImageProduct()"
                                :data-src="getImageProduct()"
                                :class="{'grayscale' : product.attributes?.showColorlessText}"
                                width="100%"
                                height="67.5%"
                            />
                            <div class="card__arrow-main-wrapper card__arrow-main-wrapper--left" v-if="sliderStatus()">
                                <svg>
                                    <use href="#icon-arrow-min"></use>
                                </svg>
                            </div>
                            <div class="card__arrow-main-wrapper card__arrow-main-wrapper--right" v-if="sliderStatus()">
                                <svg>
                                    <use href="#icon-arrow-min"></use>
                                </svg>
                            </div>
                            <source :srcset="image" :class="{'card__source--active': key==0}" class="card__source" :key="key" v-for="(image, key) in getImagesForPrimaryUpload(product.links.images)" />
                        </picture>
                        <figcaption
                            v-if="product.attributes?.showColorlessText"
                            class="card__photo-is-wrong-color-missing"
                        >
                            Фотография в данном цвете отсутствует
                        </figcaption>
                    </figure>
                </a>
                <div class="label" v-if="product.attributes.badges.length || statusNotAvailable">
                    <template v-for="badge in product.attributes.badges">
                        <template  v-if="['Новинка'].includes(badge.name)">
                            <div :class="{
                                    'label__item': true,
                                    'label__item--green': badge.name == 'Новинка',
                                    'label__item--pusovy': badge.name == 'Шоурум',
                                }"
                                :key="badge"

                            >
                                {{ badge.name }}

                                <!--noindex-->
                                <ModalPrompt :text="badge['description']" :show-as-label="true"/>
                                <!--/noindex-->
                            </div>
                        </template>
                    </template>
                    <template  v-if="isNotAvailable">
                        <div class="label__item label__item--pink-antique">
                            недоступно для заказа
                        </div>
                    </template>
                </div>
            </div>
            <footer class="card__footer">
                <div class="card__category-name-wrapper">
                    <a :href="product.links.self" >
                        <span class="card__category-name">
                            {{product.relationships.categories.data.title}}
                        </span>

                        <span
                            class="card__title"
                        >
                            <span class="card__title-text">{{product.attributes.title}}</span>
                        </span>
                    </a>
                </div>
                <div class="flex items-center w-full card__rating-wrapper" v-if="showRating">
                    <StarRating
                        :rating="Number(product.attributes.comments.comments_rating)"
                        :increment="0.01"
                        :read-only="true"
                        :show-rating="false"
                        :star-size="16"
                        active-color="#F2994A"
                        classes="card__stars-list"
                    />
                    <a :class="['card__rating']" v-if="product.attributes.comments.number_of_comments" :href=product.attributes.comments.comments_link>
                        {{product.attributes.comments.number_of_comments}} <span class='card__rating-word'>{{product.attributes.comments.comments_word}}</span>
                    </a>
                </div>

                <div
                    v-if="!minified"
                    class="card__price-and-button-wrapper"
                    :class="{'card__price-and-button-wrapper--no-old-price': !product.attributes.has_discount, 'card__price-and-button-wrapper--invisible': isNotAvailable}"
                >
                    <div class="card__price-wrapper" :class="{'card__price-wrapper--no-old-price': !product.attributes.has_discount}">
                        <div class="card__price card__price--new">
                            {{ product.attributes.price }}
                        </div>
                        <div
                            class="card__price card__price--old"
                            v-if="product.attributes.has_discount"
                        >
                            <span>
                                {{ product.attributes.old_price }}
                            </span>
                        </div>
                    </div>
                    <button
                        v-if="!product.attributes.cache_is_pack"
                        :disabled="!product.attributes.available_for_order"
                        class="dropdown-entry card__cart-button card__cart-button--cart"
                        :class="{'card__cart-button--has-old-cart': product.attributes.has_discount}"
                        data-relation="cart-catalog-modals"
                        send-product-cart
                        :data-link="product.id"
                        :data-multiplicity="product.attributes.multiplicity || 1"
                    >
                        <svg class="card__cart-button-icon">
                            <use href="#icon-cart"></use>
                        </svg>
                        <span class="hidden">В корзину</span>
                    </button>
                    <a
                        class="card__cart-button card__cart-button--link"
                        :class="{'card__cart-button--has-old-cart': product.attributes.has_discount}"
                        :href="product.links.self"
                        v-else
                    >
                        <svg class="card__cart-button-icon">
                            <use href="#icon-arrow-angle"></use>
                        </svg>
                    </a>
                </div>
                <div
                    class="card__status"
                    v-html="status"
                    :class="{
                        'card__status--no-multiplicity' : !(Number(product.attributes.multiplicity) > 1 || product.attributes.isStationery)
                    }"
                ></div>
                <div
                    class="card__amount-in-a-package"
                    :class="{'card__amount-in-a-package--not-old-price': !product.attributes.has_discount}"
                >
                    <template
                        v-if="Number(product.attributes.multiplicity) > 1 || product.attributes.isStationery"
                    >
                        Мин. партия: {{Number(product.attributes.multiplicity)}} шт. <span class="card__amount-in-a-package--price"> — </span> <span class="card__amount-in-a-package--price whitespace-nowrap">{{ priceWithMultiplicity(product.attributes.price, Number(product.attributes.multiplicity)) }}</span>
                    </template>
                </div>
                <div
                    v-if="product.attributes.colors && product.attributes.colors.count > 1 && !minified"
                    class="card__colors"
                    :class="{
                        'card__colors--no-old-cart': !product.attributes.has_discount,
                        'card__colors--only-one': product.attributes.colors.count === 1,
                        'card__colors--hidden': (product.attributes.isStationery && product.attributes.colors.count === 1)
                    }"
                >
                    <div
                        class="card__color-layout card__color-layout--signature dropdown-entry"
                        data-relation="popup-colors"
                    >
                        <span class="card__color-text pointer-events-none">{{product.attributes.colors.colorText}}</span>
                    </div>
                </div>
                <div
                    class="card__buy-one-click"
                    :class="{'card__cart-button--hidden': isNotAvailable}"
                    v-if="!product.attributes.cache_is_pack && !minified"
                >
                    <div
                        class="button card__button-buy-one-click sm:tracking-[1px] sm:px-4 sm:text-caption sm:leading-10"
                        send-product-cart-simplified
                        data-relation="cart-catalog-modals"
                        :data-link="product.id"
                        :data-multiplicity="product.attributes.multiplicity || 1"
                    >Купить в 1 клик</div>
                </div>
                <div
                    class="card__characteristics"
                    v-if="!minified"
                >
                    <div class="card__property" v-if="product.attributes.category_show_sizes && !product.attributes.cache_is_pack">
                        <div class="card__property-name-layout">
                            Ш x Г х В:
                        </div>
                        <div class="dotted-line-white-bg card__property-delimiter"></div>
                        <div class="card__property-value" :class="{'card__property-value--hyphenation-with-width-constraint': product.attributes.isOfficeEquipment}">
                            {{sizes}}
                        </div>
                    </div>
                    <div class="card__property" v-for="characteristics in product.attributes.importantListingFeatures?.importantListingFeatures" :key="characteristics.id">
                        <div class="card__property-name-layout">
                            {{characteristics.name}}:
                        </div>
                        <div class="dotted-line-white-bg card__property-delimiter"></div>
                        <div class="card__property-value" :class="{'card__property-value--hyphenation-with-width-constraint': product.attributes.isOfficeEquipment}">
                            {{characteristics.value}}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </article>
</template>


<script lang="ts">
import { defineComponent, PropType }    from "vue"
import { ComparisonProduct }            from '~/interfaces/comparison/product'
import { uploadListProductsByColor }    from "~/helpers/upload-list-products-by-color"
import ModalPrompt                      from "~/components/misc/ModalPrompt.vue"
import StarRating                       from "vue-star-rating"

export default defineComponent({
    name: "ProductCard",
    components: {
        ModalPrompt,
        StarRating
    },
    props: {
        item: {
            required: true,
            type: Object as PropType<ComparisonProduct>,
        },
        showRating : {
            required: false,
            type : Boolean,
            default : true
        },
        showColorsBlock: {
            required: false,
            type: Boolean,
            default: true,
        },
        minified: {
            required: false,
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            showParams: false,
            product: JSON.parse(JSON.stringify(this.item)),
            statusNotAvailable: false,
            allImagesUploadedStatus: false
        }
    },
    computed: {
        category():string {
            return this.product?.relationships?.categories ? this.product?.relationships?.categories.data.title : ''
        },
        sizes():string {
            return `${this.product.attributes.width} x ${this.product.attributes.depth} х ${this.product.attributes.height}`
        },
        isNotAvailable(): boolean {
            let statusNotAvailable = false

            if (this.product.attributes.visibility == 'search') {
                statusNotAvailable = true
            }

            return statusNotAvailable
        },
        status(): string {
            const attributes = this.product.attributes

            if (!attributes) return ''

            let status = ''

            if (attributes.cache_is_pack) {
                if (attributes.quantity > 0) {
                    status = `<span class='text-dark-green'>В наличии</span>`
                } else {
                    if (attributes.available) {
                        status = 'Ожидается'
                    } else {
                        status = `<span class='text-dark-green'>На заказ</span>`
                    }
                }
            } else {
                if (attributes.quantity > 0) {
                    status = `<span class='text-dark-green'>В наличии:</span> ${attributes.quantity}`
                } else {
                    if (attributes.available) {
                        status = 'Ожидается'
                    } else {
                        status = `<span class='text-dark-green'>На заказ</span>: ${attributes.proddays}`
                    }
                }
            }

            return status
        },
    },
    methods: {
        getImageProduct():string {
            const index = Number(this.product.attributes.show_color ? 0 : this.product.attributes.image_active_index)

            return this.product.links.images[index]
        },
        getAllProductColors() {
            const idProduct = this.product.id as number

            uploadListProductsByColor(idProduct)
        },
        toggleParams() {
            this.showParams = !this.showParams
        },
        sliderStatus(): boolean {
            return this.product.links.images.length == 1 ? false : true
        },
        prevSlide($event: Event) {
            $event.preventDefault()

            if (this.product.attributes.image_active_index == 0) {
                this.product.attributes.image_active_index = this.product.links.images.length - 1
            } else {
                --this.product.attributes.image_active_index
            }
        },
        nextSlide($event: Event) {
            $event.preventDefault()

            if (this.product.attributes.image_active_index == this.product.links.images.length - 1) {
                this.product.attributes.image_active_index = 0
            } else {
                ++this.product.attributes.image_active_index
            }
        },
        priceWithMultiplicity(price: string, multiplicity: number) {
            const clearPrice = Number(price.replace(' ', '').replace('₽', ''))

            let priceMultiplicity = clearPrice * multiplicity as number|string

            priceMultiplicity = this.convertToCurrency(String(priceMultiplicity))

            return priceMultiplicity
        },
        convertToCurrency(price:string): string {
            return parseFloat(price).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ") + ' ₽'
        },
        getImagesForPrimaryUpload(images:Array<string>) {
            let countImg = 1

            if(images.length >= 3) {
                countImg = 3
            }

            return images.slice(0, countImg)
        }
    },
    watch: {
        item(newValue: ComparisonProduct) {
            this.product = JSON.parse(JSON.stringify(newValue))
        }
    },
})
</script>
