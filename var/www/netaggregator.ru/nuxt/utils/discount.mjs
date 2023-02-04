/** @see https://yookassa.ru/my/agreement */
export const com = { ym: .035, tm: .035, bc: .035, wm: .06, qw: .06, tb: .04 }

export const components = { chatbot: 100, stream: 80, widget: 80, cover: 80, designer: 60 }
export const discounts = { 2: 3, 3: 5, 10: 7, 20: 10, 30: 15, 40: 20, 100: 25 }
export const periods = { 3: .05, 6: .1, 9: .16, 12: .2 }

/* export function getPrice(groups, period, items = [])
{
    let extra = 0, price = 0

    if (items.includes('cover')) {
        items = items.filter(srv => srv !== 'designer')
        price += components.cover
    }
    if (items.includes('designer')) {
        extra += components.designer
    }
    if (items.includes('stream')) {
        extra += components.stream
    }
    if (items.includes('widget')) {
        price += components.widget
    }
    if (items.includes('chatbot')) {
        price += components.chatbot
    }

    price = groups > 1
        ? ((price + (.8 * price * (groups - 1))) * period)
        : price * period

    if (groups >= 3) {
        price *= (1 - getDiscountGroups(groups) / 100)
    }

    price += extra

    return price
} */

export function getDiscountGroups(groups)
{
    let discount = 0

    for (const key in discounts) {
        if (groups >= parseInt(key)) {
            discount = parseInt(discounts[key])
        } else {
            break
        }
    }

    return discount
}
