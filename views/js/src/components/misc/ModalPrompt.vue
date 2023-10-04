<template>
    <div
        class="modal-prompt"
        :class="{
            'modal-prompt--label': showAsLabel
        }"
    >
        <span class="flex flex-row" v-html=text></span>
        <div class="modal-prompt__arrow"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: "ModalPrompt",
    props: {
        text: {
            type: String,
            required: true,
        },
        showAsLabel: {
            type: Boolean,
            required: false,
            default: false
        }
    }
})
</script>
