import TurndownService from 'turndown'

const turndownService = new TurndownService()

export const extractConfluenceContent = (): string => {
    // 1. Target the main content area
    const contentElement =
        document.querySelector('#main-content') ||
        document.querySelector('.wiki-content') ||
        document.querySelector('[data-location="content"]') ||
        document.body

    if (!contentElement) return ''

    // 2. Clone to avoid modifying the actual page
    const clone = contentElement.cloneNode(true) as HTMLElement

    // 3. Remove non-visible/technical tags (SCRIPTS, STYLES, etc.)
    const tagsToRemove = ['script', 'style', 'noscript', 'iframe', 'template', 'button', 'svg'];
    tagsToRemove.forEach(tag => {
        clone.querySelectorAll(tag).forEach(el => el.remove());
    });

    // 4. Remove known technical or UI classes that clutter the text
    const classesToRemove = [
        '.confluence-ui-components',
        '.comments-section',
        '.ak-editor-content-area-placeholder',
        '.ap-container',
        '.ap-iframe-container',
        '.macro-placeholder',
        '.inline-comment-marker'
    ];
    classesToRemove.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 5. Convert to Markdown
    try {
        const markdown = turndownService.turndown(clone.innerHTML)
        return markdown.trim()
    } catch (e) {
        console.error('Turndown conversion failed:', e)
        return clone.innerText.trim() // Fallback to plain text
    }
}
