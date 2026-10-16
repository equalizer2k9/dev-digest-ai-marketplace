import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Every Markdown string is sanitized before it reaches the DOM: plugin READMEs and skill bodies are
// repository content, not trusted HTML.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') ?? '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function renderMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false, gfm: true });
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
