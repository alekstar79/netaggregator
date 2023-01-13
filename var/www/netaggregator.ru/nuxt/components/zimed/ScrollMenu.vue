<template>
    <ul class="one-page-scroll-menu main-nav__navigation-box">
        <li v-for="({ id, text, current }) in links" class="scrollToLink" :class="{ current }" :key="id">
            <span @click.prevent="goTo(id)" class="menu__links--item">
                {{ $t(`zimed.${text}`) }}
            </span>
        </li>
    </ul>
</template>

<script>
    // import { getCoords } from '~/utils/common/coords.mjs'
    import goTo from 'vuetify/lib/services/goto'

    export default {
        data: () => ({
            links: [
                { id: '#banner',       text: 'home',         current: true  },
                { id: '#features',     text: 'features',     current: false },
                { id: '#pricing',      text: 'pricing',      current: false },
                { id: '#testimonials', text: 'testimonials', current: false },
                { id: '#faq',          text: 'faq_item',     current: false }
            ]
        }),
        methods: {
            goTo(id)
            {
                return goTo(id).then(() => this.links.forEach((link, idx) => {
                    if ((this.links[idx].current = link.id === id)) {
                        this.$bus.$emit('shift:target', { idx })
                    }
                }))
            },
            onTarget({ idx } = {})
            {
                idx || (idx = 0)

                this.links.forEach((link, i) => { this.links[i].current = false })
                this.links[idx].current = true
            },
            setTarget({ id /*, min, max */ })
            {
                // const top = getCoords(document.getElementById(id)).top
                // console.log(`id: ${id}, min: ${min}, max: ${max}, real-top: ${top}`)

                this.links.forEach((set, i) => {
                    this.links[i].current = set.id === `#${id}`
                })
            }
        },
        beforeDestroy()
        {
            this.$bus.$off('scroll:goal', this.setTarget)
            this.$bus.$off('shift:target', this.onTarget)
            this.$bus.$off('shift:top', this.onTarget)
        },
        mounted()
        {
            this.$bus.$on('scroll:goal', this.setTarget)
            this.$bus.$on('shift:target', this.onTarget)
            this.$bus.$on('shift:top', this.onTarget)
        }
    }
</script>

<style lang="scss" scoped>
    .main-nav__navigation-box .menu__links--item {
        cursor: pointer;
    }
</style>
