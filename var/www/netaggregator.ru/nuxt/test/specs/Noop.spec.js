import Noop from '~/components/core/Noop.vue'
import { mount } from '@vue/test-utils'

import test from 'ava'

test('is a Noop instance', t => {
  let wrapper = {}

  try {

    wrapper = mount(Noop)

  } catch (e) {
  }

  t.truthy(wrapper.vm)

})
