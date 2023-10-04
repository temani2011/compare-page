import { createApp } from 'vue'
import { createBem } from '@vuebits/bem'
import './style.css'
import App from './App.vue'

createApp(App)
    .use(createBem({
        hyphenate: true
    }))
    .mount('#compare-page')
