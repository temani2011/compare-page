<template>
    <transition name="bravo6-goin-dark">
        <div
            :class="$bem({ m: modifier })"
            v-show="isLoading"
        >
            <div :class="$bem({ e: 'loader-icon', m: 'home24' })">
            </div>
        </div>
    </transition>
</template>


<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: "TheLoader",
    props: {
        isLoading: {
            required: true,
            type: Boolean
        },
        modifier: {
            required: false,
            type: String,
            default: ''
        }
    }
})
</script>

<style lang="scss">
$className: "the-loader";

// стили для прелоадера, если нет темного фона фильтра
html:not(.body-scroll-fix) {
    .#{$className} {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 200;
    }
}

.#{$className} {
    opacity: 1;
    transition: opacity 0.5s ease-in-out;

    &.bravo6-goin-dark-enter-from,
    &.bravo6-goin-dark-leave-to {
        opacity: 0;
    }

    // прелоадер для home24
    &__loader-icon--home24 {
        animation: animate_loader_rotate 1.5s linear infinite;
        clip: rect(0, 80px, 80px, 40px);
        height: 80px;
        width: 80px;
        position: fixed;
        z-index: 135;
        left: calc(50vw - 40px);
        top: calc(50vh - 40px);

        @keyframes animate_loader_rotate {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(220deg);
            }
        }

        &:after {
            animation: animate_loader_width 1.5s ease-in-out infinite;
            clip: rect(0, 80px, 80px, 40px);
            content: "";
            border-radius: 50%;
            height: 80px;
            width: 80px;
            position: absolute;
        }

        @keyframes animate_loader_width {
            0% {
                box-shadow: inset #fff 0 0 0 8px;
                transform: rotate(-140deg);
            }

            50% {
                box-shadow: inset #fff 0 0 0 2px;
            }

            100% {
                box-shadow: inset #fff 0 0 0 8px;
                transform: rotate(140deg);
            }
        }
    }

    &--respect-dropdown {
        @apply fixed top-0 left-1/2 -translate-x-1/2 bottom-0 w-screen h-screen bg-black bg-opacity-70 z-[21];
    }
}
</style>
