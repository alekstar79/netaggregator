// const navigator = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' ? window.navigator : { userAgent: '' }

function getUserAgent({ brands = [] } = {})
{
    let agent

    test: for (const { brand, version } of brands) switch (true) {
        case ['Chromium','Google Chrome','CriOS'].includes(brand):
            agent = `Chrome/${version}`
            break

        case ['Firefox'].includes(brand):
            agent = `Firefox/${version}`
            break test

        case ['Opera', 'OPR'].includes(brand):
            agent = `Opera/${version}`
            break test

        case ['Microsoft Edge','Edge'].includes(brand):
            agent = `Edge/${version}`
            break test

        case ['Safari'].includes(brand):
            agent = `Safari/${version}`
            break test
    }

    return agent
}

export function detectUserAgent()
{
    if (window?.navigator.userAgentData) {
        return getUserAgent(window.navigator.userAgentData) || window.navigator.userAgent
    }

    return window?.navigator.userAgent || ''
}
