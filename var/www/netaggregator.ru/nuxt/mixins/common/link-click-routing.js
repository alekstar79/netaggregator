/**
* @see https://stackoverflow.com/questions/57182057/how-can-i-use-nuxt-link-in-content-rendered-with-v-html
* @see https://github.com/d-darwin/darwin-vue-ui/blob/main/src/mixins/linkClickRouting.js
* If children of a component contains relative HTML links
* the mixins handles these as routes.
*/
export default {
    data: () => ({
        links: []
    }),
    methods: {
        navigate(event)
        {
            if (event.target.getAttribute('target') === '_blank') return

            const href = event.target.getAttribute('href')

            if (href && href[0] === '/') {
                event.preventDefault()
                this.$router.push(href)
            }
        },
        addListeners()
        {
            this.links = this.$el.getElementsByTagName('a')

            for (let i = 0; i < this.links.length; i++) {
                this.links[i].addEventListener('click', this.navigate, false)
            }
        },
        removeListeners()
        {
            for (let i = 0; i < this.links.length; i++) {
                this.links[i].removeEventListener('click', this.navigate, false)
            }

            this.links = []
        }
    },
    updated()
    {
        if (!this.$router) return

        this.removeListeners()

        this.$nextTick(() => {
            this.addListeners()
        })
    },
    beforeDestroy()
    {
        if (this.$router) {
            this.removeListeners()
        }
    },
    mounted()
    {
        if (this.$router) {
            this.addListeners()
        }
    }
}
