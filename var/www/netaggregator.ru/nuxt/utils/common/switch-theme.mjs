export function swichTheme(v)
{
    document.body.classList.remove(v === 'dark' ? 'theme--light' : 'theme--dark')
    document.body.classList.add(v === 'dark' ? 'theme--dark' : 'theme--light')
}
