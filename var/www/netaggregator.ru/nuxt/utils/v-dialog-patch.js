import { VDialog as VDialogOriginal } from 'vuetify/lib'

/**
 * Hack to patch VDialog because it has no way to set transition hooks
 * @see https://github.com/vuetifyjs/vuetify/issues/6504#issuecomment-594131975
 */
function patchVDialog(VDialog)
{
  return VDialog.extend({
    methods: {
      genTransition()
      {
        const content = this.genInnerContent()

        if (!this.transition) return content

        return this.$createElement('transition', {
          on: this.$listeners,
          props: {
            name: this.transition,
            origin: this.origin,
            duration: this.duration,
            appear: true
          }

        }, [content])
      }
    }
  })
}

export const VDialogPatched = patchVDialog(VDialogOriginal)
