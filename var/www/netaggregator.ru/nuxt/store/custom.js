export const state = () => ({ schema: {} })

export const mutations = {
    set(state, payload)
    {
        state.schema = payload.schema || {}
    }
}
