import TurndownService from 'turndown'

const turndownService = new TurndownService()

export const extractConfluenceContent = (): string => {
    // Confluence typically uses #main-content or .wiki-content
    const contentElement =
        document.querySelector('#main-content') ||
        document.querySelector('.wiki-content') ||
        document.body

    if (!contentElement) return ''

    // Clone to avoid modifying the actual page
    const clone = contentElement.cloneNode(true) as HTMLElement

    // Remove UI elements if any (comments, sidebars, etc. inside main content)
    const elementsToRemove = clone.querySelectorAll('.confluence-ui-components, .comments-section')
    elementsToRemove.forEach(el => el.remove())

    return turndownService.turndown(clone.innerHTML)
}
