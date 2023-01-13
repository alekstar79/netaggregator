export function rclamp(v, l = 0, h = 255, d = 0)
{
    if (typeof v === 'undefined' || Number.isNaN(v)) v = d

    return v > h ? h : v < l ? l : v + .5 | 0
}
