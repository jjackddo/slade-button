import TurndownService from 'turndown'

const turndownService = new TurndownService()

export const extractConfluenceContent = (): string => {
    // 1. Target the main content area precisely
    // Confluence Cloud often uses .ak-main-content or #main-content
    const contentElement =
        document.querySelector('.ak-main-content') ||
        document.querySelector('#main-content') ||
        document.querySelector('.wiki-content') ||
        document.querySelector('[data-location="content"]') ||
        document.body

    if (!contentElement) return ''

    // 2. Clone to avoid modifying the actual page
    const clone = contentElement.cloneNode(true) as HTMLElement

    // 3. Remove only TRUE technical junk
    // We keep buttons/svgs as they often represent Confluence UI lozenges/badges
    const technicalJunk = [
        'script',
        'style',
        'noscript',
        'iframe',
        'template',
        '.confluence-ui-components', // Extension's own UI or Confluence UI
        '.comments-section',
        '.ak-editor-content-area-placeholder',
        '.ap-container', // Connect addon containers
        '.ap-iframe-container',
        '#easy-heading-export' // Example of a specific addon div that might be empty/noisy
    ];

    technicalJunk.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 4. Specifically target nested script/data blocks that Turndown might pick up
    // Some addons inject <script>//<![CDATA[ ... //]]></script>
    clone.querySelectorAll('script').forEach(s => s.remove());

    // 5. Convert to Markdown
    try {
        const markdown = turndownService.turndown(clone.innerHTML)

        // Final sanity check: if markdown is empty or mostly code/script patterns, 
        // fallback to innerText but we prefer Turndown for formatting.
        return markdown.trim()
    } catch (e) {
        console.error('Turndown conversion failed:', e)
        return clone.innerText.trim()
    }
}
