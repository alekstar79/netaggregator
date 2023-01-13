import { cspModule } from './csp'

export default config => ({
    render: cspModule(config)
})
