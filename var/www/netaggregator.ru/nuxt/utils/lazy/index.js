/**
* @see https://markus.oberlehner.net/blog/lazy-load-vue-components-when-they-become-visible
* @see https://github.com/maoberlehner/lazy-load-vue-components-when-they-become-visible
*/
export function loadComponent({ factory, loading, loadingData })
{
    let resolveComponent

    return () => ({
        component: new Promise(resolve => { resolveComponent = resolve }),
        error: { render: h => h('div', {}, ['Error load component']) },

        loading: {
            mounted()
            {
                if (!('IntersectionObserver' in window)) {
                    // Immediately load the component if IntersectionObserver is not available
                    return factory().then(resolveComponent)
                }

                const observer = new IntersectionObserver(entries => {
                    // Use `intersectionRatio` because of Edge 15's lack of support for `isIntersecting`
                    // See: https://github.com/w3c/IntersectionObserver/issues/211
                    if (entries[0].intersectionRatio <= 0) return

                    observer.unobserve(this.$el)

                    factory().then(resolveComponent)
                })

                observer.observe(this.$el)
            },
            render(h)
            {
                return h(loading, loadingData)
            }
        }
    })
}

export function builder(components, defaultOptions)
{
    return Object.entries(components)
        .reduce((acc, [name, factory]) => ({
            ...acc,
            [name]: loadComponent({
                ...defaultOptions,
                factory
            })

        }), {})
}
