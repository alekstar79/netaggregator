import { VBadge as VBadgeOriginal } from 'vuetify/lib'

/**
 * Hack to patch VBadge because it has no way to set events listeners
 * @see https://github.com/vuetifyjs/vuetify/issues/6504#issuecomment-594131975
 */
function patchVBadge(VBadge)
{
  return VBadge.extend({
    methods: {
      genBadge()
      {
        const lang = this.$vuetify.lang
        const label = this.$attrs['aria-label'] || lang.t(this.label)

        const data = this.setBackgroundColor(this.color, {
          staticClass: 'v-badge__badge',
          style: this.styles,
          on: this.$listeners,
          attrs: {
            'aria-atomic': this.$attrs['aria-atomic'] || 'true',
            'aria-label': label,
            'aria-live': this.$attrs['aria-live'] || 'polite',
            title: this.$attrs.title,
            role: this.$attrs.role || 'status'
          },
          directives: [{
            name: 'show',
            value: this.isActive
          }]
        })

        const badge = this.$createElement('span', data, [this.genBadgeContent()])

        if (!this.transition) return badge

        return this.$createElement('transition', {
          props: {
            name: this.transition,
            origin: this.origin,
            mode: this.mode
          }
        }, [badge])
      }
    }
  })
}

export const VBadgePatched = patchVBadge(VBadgeOriginal)
