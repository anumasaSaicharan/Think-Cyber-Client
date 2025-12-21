import React from 'react';
import PropTypes from 'prop-types';

/**
 * MarkdownRenderer Component
 * Converts markdown-formatted text to styled HTML
 * Supports: bold, italic, lists, tables, links, and line breaks
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  const renderMarkdown = (text) => {
    let html = text;

    // 1. Pre-process: Ensure special bullet points are on new lines to render them as lists
    // This handles cases where bullets are inline like "Intro: • Point 1 • Point 2"
    html = html.replace(/([^\n])\s*•/g, '$1\n•');

    // 2. Process Markdown formatting (generate plain HTML tags first)
    // We do this BEFORE detecting HTML so we can support "mixed" content (e.g. text with **bold** inside)

    // Markdown Tables
    html = html.replace(/(\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n$|$)/g, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;

      let tableHtml = '<table>';
      let headerProcessed = false;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        // Skip separator lines
        if (trimmedLine.match(/^\|[\s\-|]+\|$/)) return;

        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const cells = trimmedLine.slice(1, -1).split('|').map(cell => cell.trim());
          if (!headerProcessed) {
            tableHtml += '<thead><tr>';
            cells.forEach(cell => {
              // Simple inline formatting for headers
              const content = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
              tableHtml += `<th>${content}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            headerProcessed = true;
          } else {
            tableHtml += '<tr>';
            cells.forEach(cell => {
              const content = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
              tableHtml += `<td>${content}</td>`;
            });
            tableHtml += '</tr>';
          }
        }
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    });

    // Bold text (**text**) -> <strong>text</strong> (Use <strong> tag not b, styling handles look)
    html = html.replace(/\*\*((?:.|\n)*?)\*\*/g, '<strong>$1</strong>');

    // Italic text (*text*) -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists (bullets) -> <li>...</li>
    // Note: We use \s instead of space to be robust
    html = html.replace(/^•\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/g, '<ul>$1</ul>');

    // Links [text](url) -> <a href="url">text</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // 3. Check if we should enforce paragraphs
    // If input was mostly text (few block tags) we convert newlines to breaks.
    // If it already had divs/ps, we assume structure is managed.
    const isRichHtml = /<(div|p|table|section|article|ul|ol)[^>]*>/i.test(text);

    if (!isRichHtml) {
      // Convert newlines to breaks
      html = html.replace(/\n/g, '<br>');

      // Clean up extra br tags around lists (generated above)
      html = html.replace(/<br>(?=<(?:ul|ol|table))/g, '');
      html = html.replace(/(?<=<\/(?:ul|ol|table)>)<br>/g, '');

      // Wrap content in p if it's text
      if (!html.startsWith('<') || html.startsWith('<strong') || html.startsWith('<em')) {
        html = `<p>${html}</p>`;
      }
    }

    // 4. Enhance HTML tags with Tailwind classes (Centralized Styling)
    // Applies styling to ALL tags, whether original or generated above.
    // We are careful to separate the tag search from the replacement to allow idempotency or just overwrite.

    // Helper to add class if not present (simplified regex replacement)
    // We actually just replace the open tag with our styled version.

    // Lists
    html = html.replace(/<ul\b[^>]*>/gi, '<ul class="list-disc list-inside space-y-2 my-4 ml-6 text-gray-700">');
    html = html.replace(/<ol\b[^>]*>/gi, '<ol class="list-decimal list-inside space-y-2 my-4 ml-6 text-gray-700">');
    html = html.replace(/<li\b[^>]*>/gi, '<li class="ml-2 py-1 leading-relaxed">');

    // Typography
    html = html.replace(/<strong\b[^>]*>/gi, '<strong class="font-bold text-gray-900">');
    html = html.replace(/<em\b[^>]*>/gi, '<em class="italic text-gray-700">');
    html = html.replace(/<p\b[^>]*>/gi, '<p class="mb-4 leading-relaxed">');
    html = html.replace(/<a\b/gi, '<a class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" ');

    // Tables
    html = html.replace(/<table\b[^>]*>/gi, '<table class="min-w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden shadow-md">');
    html = html.replace(/<thead\b[^>]*>/gi, '<thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">');
    html = html.replace(/<th\b[^>]*>/gi, '<th class="border border-blue-500 px-6 py-3 text-left font-bold text-sm uppercase tracking-wider">');
    html = html.replace(/<td\b[^>]*>/gi, '<td class="px-6 py-4 text-sm text-gray-700 border-b border-gray-200">');

    return html;
  };

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      style={{
        fontSize: '15px',
        lineHeight: '1.7',
        color: '#374151'
      }}
    />
  );
};

MarkdownRenderer.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string
};

export default MarkdownRenderer;
