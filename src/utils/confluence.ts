import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndownService = new TurndownService()
turndownService.use(gfm)

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

    // [New] Pre-process Tables for better Markdown conversion
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
        // 1. Clean attributes
        table.removeAttribute('style');
        table.removeAttribute('class');
        table.removeAttribute('data-layout');
        table.querySelectorAll('colgroup, col').forEach(bg => bg.remove());

        // 2. Ensure <thead> exists
        // Confluence often puts header rows in <tbody>. Move them if they contain <th>
        const tbody = table.querySelector('tbody');
        if (!table.querySelector('thead') && tbody) {
            const firstRow = tbody.querySelector('tr');
            // Check if first row is completely made of <th> or mostly <th>
            if (firstRow && firstRow.querySelector('th')) {
                const thead = document.createElement('thead');
                thead.appendChild(firstRow);
                table.insertBefore(thead, tbody);
            }
        }

        // 3. Flatten Cell Content
        // Turndown converts <p> to double newlines, which breaks GFM tables.
        // We must unwrap <p> and <div> tags inside cells.
        table.querySelectorAll('th, td').forEach(cell => {
            // Remove block elements but keep content.
            // Using a simple approach: replace block tags with <br> or space?
            // Space is safer for structure. 
            const blocks = cell.querySelectorAll('p, div, ul, ol, li, h1, h2, h3, h4, h5, h6');
            blocks.forEach(block => {
                // If it's a list, it's tricky. For now, just unwrap prevents breaking.
                // Insert a space to separate content
                const space = document.createTextNode(' ');
                if (block.parentNode) {
                    block.parentNode.insertBefore(space, block);
                    while (block.firstChild) {
                        block.parentNode.insertBefore(block.firstChild, block);
                    }
                    block.remove();
                }
            });

            // Also remove <br> and replaces with space to prevent any newlines
            // GFM tables do not support newlines.
            cell.querySelectorAll('br').forEach(br => {
                const space = document.createTextNode(' ');
                br.parentNode?.replaceChild(space, br);
            });
        });
    });

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
