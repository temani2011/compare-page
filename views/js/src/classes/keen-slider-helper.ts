import KeenSlider, {
    KeenSliderPlugin,
    KeenSliderOptions,
    KeenSliderInstance,
    TrackSlidesConfigOption
} from 'keen-slider'
import 'keen-slider/keen-slider.min.css'
import clamp from '~/helpers/clamp'

interface KeenSliderOptionsExtended extends Omit<KeenSliderOptions, 'slides' | 'breakpoints'> {
    slides?:
    | ((size: number, slides: HTMLElement[]) => TrackSlidesConfigOption)
    | number
    | {
        origin?: 'center' | 'auto' | number
        number?: number | (() => number | null) | null
        perView?: 'auto' | number | (() => number | 'auto')
        perScroll?: 'auto' | number | (() => number | 'auto') // супер эксперементальная хрень, юзать в паре с perView, чтобы скроллить на нужное кол-ва слайдов
        spacing?: number | (() => number)
      }
    | null
    breakpoints?: {
        [key: string]: Omit<KeenSliderOptionsExtended, 'breakpoints'>
    }
}

interface MarkupElementOptions {
    enable: boolean
    html?: string
    disableListeners?: boolean
    manualUpdate?: boolean
}

interface AdditonaMarkupOptions {
    arrows?: MarkupElementOptions,
    dots?: MarkupElementOptions,
    counter?: MarkupElementOptions
}

class KeenSliderHelper {
    private _sliderInstance:            KeenSliderInstance

    private _wrapperElement:            HTMLElement | undefined
    private _paginationElement:         HTMLElement | undefined
    private _navigationLeftElement:     HTMLElement | undefined
    private _navigationRightElement:    HTMLElement | undefined
    private _counterElement:            HTMLElement | undefined

    private _hasParent                  = false

    private _plugins:                   KeenSliderPlugin[]

    private _perViewReducer             = 0                     // нужен чтобы кол-во точек пагинации и id-шники при ее обновление правильно считались для кол-ва слайдов > 0
    private _perScrollDivider           = 1                     // нужен чтобы кол-во точек пагинации и id-шники при ее обновление правильно считались для кол-ва слайдов > 0

    private _autoplayFlag               = false
    private _activeSlideClassname       = 'keen-slider__slide--current'
    private _autoplay: ReturnType<typeof setTimeout>|null = null

    private _additionalMarkupOptions: AdditonaMarkupOptions | null = null


    constructor(
        selector: HTMLElement,
        options?: KeenSliderOptionsExtended,
        parentSliderIntance?: KeenSliderInstance,
        activeSlideClassname?: string
    ) {
        if (selector.parentElement?.classList.contains('keen-slider-wrapper')) {
            this._wrapperElement = <HTMLElement | undefined>selector.parentElement
        }

        this._plugins = []

        if (parentSliderIntance) {
            this._hasParent = true
            this._plugins.push(this.createThumbnailPlugin(parentSliderIntance))
        }

        this._sliderInstance = new KeenSlider(
            selector,
            options,
            this._plugins
        )

        if (activeSlideClassname) this._activeSlideClassname = activeSlideClassname

        this.setActiveSlideClassname()
        this.setPerViewReducer()
        this.setPerScrollDivider()
        this.handleSlideChange()
        this.handleBreakPointChange()
        this.registerKeypressListener()
    }

    get instance(): KeenSliderInstance {
        return this._sliderInstance
    }

    get slidesCount(): number {
        return this._sliderInstance.slides.length
    }

    get wrapperElement(): HTMLElement | undefined {
        return this._wrapperElement
    }

    get navigationLeftElement(): HTMLElement | undefined {
        return this._navigationLeftElement
    }

    get navigationRightElement(): HTMLElement | undefined {
        return this._navigationRightElement
    }

    private setPerViewReducer() {
        const options = this._sliderInstance.options

        if (
            options.slides !== null &&
            typeof options.slides === 'object' &&
            typeof options.slides.perView === 'number'
        ) {
            this._perViewReducer = options.slides.perView - 1
        }
    }

    private setPerScrollDivider() {
        const options = this._sliderInstance.options as KeenSliderOptionsExtended

        if (
            options.slides !== null &&
            typeof options.slides === 'object' &&
            typeof options.slides.perScroll === 'number'
        ) {
            this._perScrollDivider = options.slides.perScroll
        }
    }

    private createThumbnailPlugin(parentSliderIntance: KeenSliderInstance ) {
        return (currentSliderInstance: KeenSliderInstance) => currentSliderInstance.on("created", () => {
            this.setActiveThumbnail(currentSliderInstance)
            this.createThumbnailEvents(currentSliderInstance, parentSliderIntance)

            parentSliderIntance.on("animationStarted", () => {
                const next = parentSliderIntance.animator.targetIdx || 0
                currentSliderInstance.moveToIdx(next)
            })
            parentSliderIntance.on("animationEnded", () => {
                this.setActiveThumbnail(currentSliderInstance)
            })
        })
    }

    private createThumbnailEvents(currentSliderInstance: KeenSliderInstance, parentSliderIntance: KeenSliderInstance) {
        currentSliderInstance.container.addEventListener('click', (event: Event) => {
            const target = event.target as HTMLElement

            if (!target || target.tagName !== 'IMG') return void 0

            const parent = target.parentElement as HTMLElement

            parentSliderIntance.moveToIdx(Number(parent.dataset.serialNumber))
        })
    }

    private setActiveThumbnail(currentSliderInstance: KeenSliderInstance) {
        currentSliderInstance.slides.forEach((slide: HTMLElement, id: number) => {
            if (id === currentSliderInstance.track.details.rel) {
                slide.classList.add('keen-slider__slide--active')
            } else {
                slide.classList.remove('keen-slider__slide--active')
            }
        })
    }

    private handleSlideChange() {
        this._sliderInstance.on('slideChanged', () => this.updateInteraciveMarkup())
    }

    private handleBreakPointChange() {
        this._sliderInstance.on('optionsChanged', () => {
            this.setPerViewReducer()
            this.setPerScrollDivider()
            this.recreateDots()
            this.updateInteraciveMarkup()
        })
    }

    updateInteraciveMarkup() {
        if (!this._wrapperElement) return void 0

        if (this._paginationElement && !this._additionalMarkupOptions?.dots?.manualUpdate) this.updatePagination()
        if ((this._navigationLeftElement || this._navigationRightElement) && !this._additionalMarkupOptions?.arrows?.manualUpdate) this.updateNavigation()
        if (this._counterElement && !this._additionalMarkupOptions?.counter?.manualUpdate) this.updateCounter()
    }

    createAdditionalMarkup(options: {
        arrows?: MarkupElementOptions,
        dots?: MarkupElementOptions,
        counter?: MarkupElementOptions
    }) {
        this._additionalMarkupOptions = options

        if (this._additionalMarkupOptions.arrows?.enable) {
            this.createArrowMarkup(true, this._additionalMarkupOptions.arrows)
        }

        if (this._additionalMarkupOptions.dots?.enable) {
            this.createDotsMarkup(true)
        }

        if (this._additionalMarkupOptions.counter?.enable) {
            this.createCounterMarkup(true)
        }

        if (this._additionalMarkupOptions.counter?.enable || this._additionalMarkupOptions.dots?.enable || this._additionalMarkupOptions.arrows?.enable) {
            this.updateInteraciveMarkup()
        }
    }

    createArrowMarkup(preventUpdate = false, options: MarkupElementOptions) {
        if (!this._wrapperElement) return void 0

        const arrowLeft  = this.createElement('keen-slider-wrapper__arrow keen-slider-wrapper__arrow--prev')
        const arrowRight = this.createElement('keen-slider-wrapper__arrow keen-slider-wrapper__arrow--next')

        const markup = options.html ? options.html : '<svg><use href="#icon-arrow"></use></svg>'

        arrowLeft.innerHTML = arrowRight.innerHTML = markup

        if (!this._sliderInstance) return void 0

        if (!options.disableListeners) {
            arrowLeft.addEventListener("click", (e) => {
                e.stopPropagation()
                this.prev()
            })
            arrowRight.addEventListener("click", (e) => {
                e.stopPropagation()
                this.next()
            })
        }

        this._wrapperElement.appendChild(arrowLeft)
        this._wrapperElement.appendChild(arrowRight)
        this._navigationLeftElement = arrowLeft
        this._navigationRightElement = arrowRight

        if (!preventUpdate) {
            this.updateInteraciveMarkup()
        }
    }

    private updateNavigation() {
        if (this._sliderInstance.options.loop) return void 0

        // TODO: вынести в проперти, чтобы не пересчитывать для пагинации и точек одновременно одно и тоже
        let currentSlideId = 1
        if (this._sliderInstance.track.details) {
            currentSlideId = Math.ceil(this._sliderInstance.track.details.rel / this._perScrollDivider) + 1
        }

        const maxId = Math.ceil((this.slidesCount - this._perViewReducer - 1) / this._perScrollDivider) + 1
        const minId = 1

        if (currentSlideId > maxId) {
            currentSlideId = maxId
        }

        if(currentSlideId < 1) {
            currentSlideId = 1
        }

        if (minId === maxId) {
            this._navigationLeftElement?.classList.add('keen-slider-wrapper__arrow--hidden')
            this._navigationRightElement?.classList.add('keen-slider-wrapper__arrow--hidden')
        } else {
            this._navigationLeftElement?.classList.remove('keen-slider-wrapper__arrow--hidden')
            this._navigationRightElement?.classList.remove('keen-slider-wrapper__arrow--hidden')
            if (currentSlideId === minId) {
                this._navigationLeftElement?.classList.add('keen-slider-wrapper__arrow--disabled')
                this._navigationRightElement?.classList.remove('keen-slider-wrapper__arrow--disabled')
            } else if (currentSlideId === maxId) {
                this._navigationLeftElement?.classList.remove('keen-slider-wrapper__arrow--disabled')
                this._navigationRightElement?.classList.add('keen-slider-wrapper__arrow--disabled')
            } else {
                this._navigationLeftElement?.classList.remove('keen-slider-wrapper__arrow--disabled')
                this._navigationRightElement?.classList.remove('keen-slider-wrapper__arrow--disabled')
            }
        }
    }

    createDotsMarkup(preventUpdate = false) {
        if (
            !this._wrapperElement ||
            (
                this._sliderInstance.options.slides !== null &&
                typeof this._sliderInstance.options.slides === 'object' &&
                typeof this._sliderInstance.options.slides.perView === 'number' &&
                this.slidesCount <= this._sliderInstance.options.slides.perView
            )
        ) return void 0

        const dots = this.createElement('keen-slider-wrapper__dots-list')

        const dotsListLength = this.slidesCount - this._perViewReducer

        for (let i = 0; i < dotsListLength; i++) {
            const dot = this.createElement('keen-slider-wrapper__dot')
            dot.addEventListener('click', () => {
                this._sliderInstance.moveToIdx(i)
            })
            dots.appendChild(dot)
        }

        this._wrapperElement.appendChild(dots)

        this._paginationElement = dots

        if (!preventUpdate) {
            this.updateInteraciveMarkup()
        }
    }

    private updatePagination() {
        const dots = this._paginationElement?.querySelectorAll<HTMLElement>('.keen-slider-wrapper__dot')

        if (!dots?.length) return void 0

        let currentSlideId = this._sliderInstance.track.details.rel

        let maxId = Math.floor(this._sliderInstance.track.details.length)

        if (!this._sliderInstance.options.loop) {
            maxId = this._sliderInstance.track.details.maxIdx - this._perViewReducer
        }

        if (currentSlideId > maxId) currentSlideId = maxId
        if (currentSlideId < 0)     currentSlideId = 0

        const minId = 0
        const offset = 5

        dots.forEach((dot: HTMLElement, dotId: number) => {
            dot.classList.remove('keen-slider-wrapper__dot--active')
            dot.classList.remove('keen-slider-wrapper__dot--visible')
            dot.classList.remove('keen-slider-wrapper__dot--small')

            let minValue = 0
            let maxValue = maxId

            if (dotId === currentSlideId) dot.classList.add('keen-slider-wrapper__dot--active')

            if (currentSlideId === minId) {
                maxValue = offset - 1

                if (dotId < offset) {
                    dot.classList.add('keen-slider-wrapper__dot--visible')
                }
            } else if (currentSlideId === maxId) {
                minValue = maxId - (offset - 1)

                if (dotId > maxId - offset) {
                    dot.classList.add('keen-slider-wrapper__dot--visible')
                }
            } else {
                minValue = currentSlideId - Math.ceil((offset - 1) / 2)
                maxValue = currentSlideId + Math.ceil((offset - 1) / 2)

                if (minValue < 0) {
                    maxValue += Math.abs(minValue)
                    minValue = 0
                }
                if (maxId - maxValue < 0) {
                    minValue -= Math.abs(maxId - maxValue)
                    maxValue = maxId
                }

                if (dotId === clamp(minValue, dotId, maxValue)) dot.classList.add('keen-slider-wrapper__dot--visible')
            }

            if (dotId == minValue && dotId !== minId) dot.classList.add('keen-slider-wrapper__dot--small')
            if (dotId == maxValue && dotId !== maxId) dot.classList.add('keen-slider-wrapper__dot--small')
        })
    }

    private recreateDots() {
        if (!this._paginationElement) return void 0

        this._paginationElement.remove()
        this.createDotsMarkup()
    }

    createCounterMarkup(preventUpdate = false) {
        if (!this._wrapperElement) return void 0

        const counter = this.createElement('keen-slider-wrapper__counter')
        const counterCurrent = this.createElement('keen-slider-wrapper__current-value')
        const counterTotal = this.createElement('keen-slider-wrapper__total-value')

        let currentSlideId = Math.ceil(this._sliderInstance.track.details.rel / this._perScrollDivider) + 1
        const maxId = Math.ceil((this.slidesCount - this._perViewReducer - 1) / this._perScrollDivider) + 1

        if (currentSlideId > maxId) {
            currentSlideId = maxId
        }
        if(currentSlideId < 1) {
            currentSlideId = 1
        }

        counterCurrent.innerText = String(currentSlideId)
        counterTotal.innerText = '/ ' + String(maxId)

        counter.appendChild(counterCurrent)
        counter.appendChild(counterTotal)

        this._wrapperElement.appendChild(counter)
        this._counterElement = counter

        if (!preventUpdate) {
            this.updateInteraciveMarkup()
        }
    }

    private updateCounter() {
        const counterCurrent = this._counterElement?.querySelector<HTMLElement>('.keen-slider-wrapper__current-value')
        const counterTotal = this._counterElement?.querySelector<HTMLElement>('.keen-slider-wrapper__total-value')

        if (!counterCurrent || !counterTotal) return void 0

        let currentSlideId = Math.ceil(this._sliderInstance.track.details.rel / this._perScrollDivider) + 1
        const maxId = Math.ceil((this.slidesCount - this._perViewReducer - 1) / this._perScrollDivider) + 1

        if (currentSlideId > maxId) {
            currentSlideId = maxId
        }
        if(currentSlideId < 1) {
            currentSlideId = 1
        }

        counterCurrent.innerText = String(currentSlideId)
        counterTotal.innerText = '/ ' + String(maxId)
    }

    private setAutoplayFlag(flag: boolean) {
        this._autoplayFlag = flag
    }

    autoplayStart() {
        this.setAutoplayFlag(true)
    }

    autoplayStop() {
        this.setAutoplayFlag(false)
    }

    autoplay(showTime: number) {
        this.setAutoplayFlag(true)

        this._autoplay = setInterval(() => {
            if (this._autoplayFlag) {
                this._sliderInstance.next()
            }
        }, showTime)
    }

    autoplayReset() {
        if (this._autoplay === null) return void 0

        this.setAutoplayFlag(false)
        clearTimeout(this._autoplay)
    }

    private setActiveSlideClassname() {
        if (this._sliderInstance.track.details) {
            this._sliderInstance.slides[this._sliderInstance.track.details.rel].classList.add(this._activeSlideClassname)
        }

        this._sliderInstance.on('animationEnded', (params) => {
            this._sliderInstance.slides.forEach((slide: HTMLElement, id: number) => {
                if (id === params.track.details.rel) {
                    slide.classList.add(this._activeSlideClassname)
                } else {
                    slide.classList.remove(this._activeSlideClassname)
                }
            })
        })
    }

    private registerKeypressListener() {
        if (this._hasParent) return void 0

        const callback = (e: KeyboardEvent) => {
            if (this._additionalMarkupOptions?.arrows?.disableListeners) {
                // самоотписка от слушателя
                document.removeEventListener('keydown', callback)
                return void 0
            }

            const rect = this._sliderInstance.container.getBoundingClientRect()

            if (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            ) {
                switch (e.key) {
                case 'ArrowLeft':
                    this.handleKeyPress('prev')
                    break
                case 'ArrowRight':
                    this.handleKeyPress('next')
                    break
                }
            }
        }

        document.addEventListener('keydown', callback)
    }

    private handleKeyPress(direction: 'prev' | 'next') {
        if (direction === 'prev') {
            this.prev()
        } else if (direction === 'next') {
            this.next()
        }
    }

    destroy() {
        if (this._paginationElement) this._paginationElement.remove()
        if (this._navigationLeftElement) this._navigationLeftElement.remove()
        if (this._navigationRightElement) this._navigationRightElement.remove()
        if (this._counterElement) this._counterElement.remove()

        this._sliderInstance.destroy()
    }

    private createElement(classNames: string, tagName = 'div'):HTMLElement {
        const element = document.createElement(tagName)

        classNames.split(" ").forEach((name: string) => element.classList.add(name))

        return element
    }

    /**
     * Замена оригинальной instance.next() с учетом perScroll
     */
    next():void {
        if (this._perScrollDivider === 1)
            return this._sliderInstance.next()

        let nextId = this._sliderInstance.track.details.rel + this._perScrollDivider
        const maxId = this.slidesCount - 1

        if (nextId > maxId) nextId = maxId

        return this._sliderInstance.moveToIdx(nextId)
    }

    /**
     * Замена оригинальной instance.prev() с учетом perScroll
     */
    prev():void {
        if (this._perScrollDivider === 1)
            return this._sliderInstance.prev()

        let prevId = this._sliderInstance.track.details.rel - this._perScrollDivider

        if (prevId < 0) prevId = 0

        return this._sliderInstance.moveToIdx(prevId)
    }
}

export default KeenSliderHelper
