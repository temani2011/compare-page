export default function throttle(func: Function, ms: number) {
    let isThrottled: boolean = false,
        savedArgs: any,
        savedThis: any

    function wrapper(this: any) {
        if (isThrottled) {
                savedArgs = arguments
                savedThis = this
                return
        }

        func.apply(this, arguments)

        isThrottled = true

        setTimeout(function () {
                isThrottled = false
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs)
                    savedArgs = savedThis = null
                }
        }, ms)
    }

    return wrapper
}
