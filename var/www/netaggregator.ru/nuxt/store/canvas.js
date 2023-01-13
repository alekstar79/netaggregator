// history https://alimozdemir.com/posts/fabric-js-history-operations-undo-redo-and-useful-tips

import { Brush } from '~/utils/canvas'

export const state = () => ({
    shiftKey: false,
    ctrlKey: false,
    fixed: false,

    widget: null,
    client: null,
    origin: null,
    scaled: null,
    qrcode: null,
    track: null,
    point: null,
    shape: null,
    ctext: null,
    merge: null,
    text: null,
    path: null,

    cache: {},
    gridToSet: null,
    gridName: null,
    gridList: [],

    guidesList: [],
    draggable: [],

    diagonal: 0,

    xGrid: 100,
    yGrid: 100,
    xSnap: 1,
    ySnap: 1,

    controls: {
        guides: true,
        info: false,
        open: false,
        save: false,
        snap: false,
        grid: false
    },
    drawerOptions: {
        lineType: 'solid',
        fill: 'rgba(255,255,255,0)',
        stroke: 'rgba(0,0,0,1)',
        strokeUniform: true,
        strokeWidth: 1,
        alpha: 20, // 255
        sharp: 10,
        bulge: .5,
        soft: .5,
        blur: 5,
        magicThreshold: 16,
        selectable: true,
        img: {}
    },
    textOptions: {
        lineType: 'solid',
        fill: 'rgba(0,0,0,1)',
        stroke: 'rgba(255,255,255,0)',
        strokeUniform: true,
        strokeWidth: 0
    },
    pencilTool: {
        value: Brush.PENCIL,
        text: 'Pencil'
    }
})

export const mutations = {
    set(state, payload)
    {
        Object.keys(payload).forEach(k => { state[k] = payload[k] })
    },
    disposeStack(state)
    {
        state.client = null
        state.origin = null
        state.scaled = null
        state.track = null
        state.point = null
    },
    dragPush(state, wid)
    {
        state.draggable.push(wid)
    },
    dragRemove(state, wid)
    {
        state.draggable = state.draggable.filter(id => id !== wid)
    },
    dragSort(state, wid)
    {
        state.draggable.sort(($1, $2) => $1 === wid ? 1 : $2 === wid ? -1 : 0)
    },
    setDrawerOption({ drawerOptions }, payload)
    {
        Object.keys(payload).forEach(k => { drawerOptions[k] = payload[k] })
    },
    setTextOption({ textOptions }, payload)
    {
        Object.keys(payload).forEach(k => { textOptions[k] = payload[k] })
    },
    setLineWidth({ drawerOptions }, width)
    {
        drawerOptions.strokeWidth = width

        this.commit('canvas/setLineType', drawerOptions.lineType)
    },
    setLineType({ drawerOptions }, type)
    {
        drawerOptions.lineType = type

        const k = drawerOptions.strokeWidth > 3 ? 2 : 1

        switch (type) {
            case 'solid':
                delete drawerOptions.strokeLineCap
                delete drawerOptions.strokeDashArray
                break
            case 'dotted':
                drawerOptions.strokeLineCap = 'round'
                drawerOptions.strokeDashArray = [
                    1, drawerOptions.strokeWidth * 3
                ]
                break
            case 'dashed':
                delete drawerOptions.strokeLineCap
                drawerOptions.strokeDashArray = [
                    drawerOptions.strokeWidth * 2.3 * k,
                    drawerOptions.strokeWidth * 1.7 * k
                ]
        }
    },
    addGridToList(state)
    {
        state.gridList.push({ name: state.gridName, list: state.guidesList })
    },
    removeGrid(state)
    {
        state.gridList = state.gridList.filter(g => g.name !== state.gridName)
    },
    chooseGrid(state, name)
    {
        state.gridName = name

        state.gridList.some(grid => {
            if (grid.name === name) {
                state.gridToSet = grid.list
                return true
            }

            return false
        })
    },
    initGrid(state)
    {
        state.gridToSet = state.gridList[0].list
        state.gridName = state.gridList[0].name
    },
    createGuide(state, data)
    {
        state.guidesList.push(data)
    },
    removeGuide(state, id)
    {
        state.guidesList = state.guidesList.filter((_, i) => i !== id)
    },
    updateGuide(state, { id, percent, pixel })
    {
        if (percent === null || pixel === null) {
            return this.commit('canvas/removeGuide', id)
        }

        state.guidesList[id].set = { percent, pixel }
        state.guidesList[id].evt = null
    },
    toggleOpenDialog(state)
    {
        state.controls = { ...state.controls, open: !state.controls.open, save: false, snap: false }
    },
    toggleSaveDialog(state)
    {
        state.controls = { ...state.controls, save: !state.controls.save, open: false, snap: false }
    },
    toggleSnapDialog(state)
    {
        state.controls = { ...state.controls, snap: !state.controls.snap, save: false, open: false }
    },
    closeDialog(state)
    {
        state.controls = { ...state.controls, snap: false, save: false, open: false }
    },
    toggleGuides(state)
    {
        state.controls = { ...state.controls, guides: !state.controls.guides }
    },
    toggleGrid(state)
    {
        state.controls = { ...state.controls, grid: !state.controls.grid }
    },
    toggleInfo(state)
    {
        state.controls = { ...state.controls, info: !state.controls.info }
    }
}
