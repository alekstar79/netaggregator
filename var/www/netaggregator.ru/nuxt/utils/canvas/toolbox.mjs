// export const fabric = import(/* webpackChunkName: "fabric" */ 'fabric').then(m => m.default || m).then(setTools)

export async function setTools({ fabric })
{
    const { desaturateTool, sharpenTool, eraserTool, blurTool, fillTool, magicTool, bulgeTool, cloneTool } = fabric,
        { Brush } = await import(/* webpackChunkName: "toolkit" */ './index.mjs')

    fabric.toolbox = [
        { id: 'desaturator', init: desaturateTool, brush: Brush.DESATURATE },
        { id: 'sharpen',     init: sharpenTool,    brush: Brush.SHARPEN    },
        { id: 'eraser',      init: eraserTool,     brush: Brush.ERASE      },
        { id: 'magic',       init: magicTool,      brush: Brush.MAGIC      },
        { id: 'bulge',       init: bulgeTool,      brush: Brush.BULGE      },
        { id: 'clone',       init: cloneTool,      brush: Brush.CLONE      },
        { id: 'blurring',    init: blurTool,       brush: Brush.BLUR       },
        { id: 'filler',      init: fillTool,       brush: Brush.FILL       }
    ]

    return fabric
}
