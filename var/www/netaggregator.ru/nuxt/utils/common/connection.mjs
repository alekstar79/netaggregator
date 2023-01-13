export function setSingleConnection(state, { set, del, gid, entity })
{
    let idx = -1

    state.list.forEach((item, i) => {
        state.list[i].connections || (state.list[i].connections = [])

        if (del === item._id) {
            state.list[i].connections = state.list[i].connections.filter(c => c !== gid)
        }

        if (!set) return

        if ((idx = state.list[i].connections.indexOf(gid)) > -1) {
            state.list[i].connections.splice(idx, 1)
        }
        if (set === item._id) {
            state.list[i].connections.push(gid)
        }
    })

    this.dispatch(`${entity}/save`)
}

export function setMultiplyConnection(state, { set, del, gid, entity })
{
    state.list.forEach((item, i) => {
        state.list[i].connections || (state.list[i].connections = [])

        if (del && del === item._id) {
            state.list[i].connections = state.list[i].connections.filter(c => c !== gid)
        }
        if (set && set === item._id) {
            state.list[i].connections.push(gid)
        }
    })

    this.dispatch(`${entity}/save`)
}
