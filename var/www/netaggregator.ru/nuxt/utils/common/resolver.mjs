export function resolver(preload)
{
    let min, max, ids, _idx = 0

    preload || (preload = () => {})

    return function({ state, commit }) {
        return new Promise((resolve, reject) => {
            if (!state.modules.some((t, idx) => {
                if (t.entity !== state.entity) return false

                preload({ state, commit, module: t, idx })

                ids = [...state.modules.keys()]

                min = _idx > idx ?  idx : _idx
                max = _idx > idx ? _idx :  idx

                resolve({
                    ids: ids.filter(v => v > min && v < max),
                    current: _idx,
                    next: idx
                })

                _idx = idx

                return true

            })) {
                reject()
            }
        })
    }
}
