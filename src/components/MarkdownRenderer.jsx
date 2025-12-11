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

    // Check if content already contains HTML tags
    const hasHtmlTags = /<(ol|ul|li|strong|em|p|br|table|thead|tbody|tr|th|td|h[1-6])[^>]*>/i.test(text);
    
    if (hasHtmlTags) {
      // Content already contains HTML, enhance the styling
      html = text
        // Add classes to ordered lists
        .replace(/<ol>/gi, '<ol class="list-decimal list-inside space-y-2 my-4 ml-6 text-gray-700">')
        .replace(/<ol([^>]*)>/gi, '<ol$1 class="list-decimal list-inside space-y-2 my-4 ml-6 text-gray-700">')
        // Add classes to unordered lists
        .replace(/<ul>/gi, '<ul class="list-disc list-inside space-y-2 my-4 ml-6 text-gray-700">')
        .replace(/<ul([^>]*)>/gi, '<ul$1 class="list-disc list-inside space-y-2 my-4 ml-6 text-gray-700">')
        // Add classes to list items
        .replace(/<li>/gi, '<li class="ml-2 py-1 leading-relaxed">')
        .replace(/<li([^>]*)>/gi, '<li$1 class="ml-2 py-1 leading-relaxed">')
        // Add classes to strong tags
        .replace(/<strong>/gi, '<strong class="font-bold text-gray-900">')
        .replace(/<strong([^>]*)>/gi, '<strong$1 class="font-bold text-gray-900">')
        // Add classes to em tags
        .replace(/<em>/gi, '<em class="italic text-gray-700">')
        .replace(/<em([^>]*)>/gi, '<em$1 class="italic text-gray-700">')
        // Add classes to paragraphs
        .replace(/<p>/gi, '<p class="mb-4 leading-relaxed">')
        .replace(/<p([^>]*)>/gi, '<p$1 class="mb-4 leading-relaxed">')
        // Add classes to tables
        .replace(/<table>/gi, '<table class="min-w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden shadow-md">')
        .replace(/<table([^>]*)>/gi, '<table$1 class="min-w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden shadow-md">')
        .replace(/<thead>/gi, '<thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">')
        .replace(/<th>/gi, '<th class="border border-blue-500 px-6 py-3 text-left font-bold text-sm uppercase tracking-wider">')
        .replace(/<td>/gi, '<td class="px-6 py-4 text-sm text-gray-700 border-b border-gray-200">');
      
      return html;
    }

    // Handle markdown tables first (before other formatting)
    html = html.replace(/(\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n$|$)/g, (match) => {
      const lines = match.trim().split('\n');
      if (lines.length < 2) return match;

      let tableHtml = '<table class="min-w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden shadow-md">';
      let headerProcessed = false;

      lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Skip separator lines like |---|---|---|
        if (trimmedLine.match(/^\|[\s\-|]+\|$/)) {
          return;
        }

        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const cells = trimmedLine.slice(1, -1).split('|').map(cell => cell.trim());

          if (!headerProcessed) {
            // First row is header with gradient background
            tableHtml += '<thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><tr>';
            cells.forEach(cell => {
              const cellContent = cell
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
              tableHtml += `<th class="border border-blue-500 px-6 py-3 text-left font-bold text-sm uppercase tracking-wider">${cellContent}</th>`;
            });
            tableHtml += '</tr></thead><tbody class="bg-white">';
            headerProcessed = true;
          } else {
            // Data rows with alternating colors
            tableHtml += '<tr class="hover:bg-blue-50 transition-colors border-b border-gray-200">';
            cells.forEach(cell => {
              const cellContent = cell
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
              tableHtml += `<td class="px-6 py-4 text-sm text-gray-700">${cellContent}</td>`;
            });
            tableHtml += '</tr>';
          }
        }
      });

      tableHtml += '</tbody></table>';
      return tableHtml;
    });

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    
    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
    
    // Unordered lists (bullets)
    html = html.replace(/^• (.+)$/gm, '<li class="ml-6 my-2 flex items-start"><span class="mr-2">•</span><span>$1</span></li>');
    
    // Ordered lists (numbers)
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 my-2 flex items-start"><span class="mr-2 font-medium">$1.</span><span>$2</span></li>');
    
    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li class="ml-6 my-2 flex items-start">.*?<\/li>(?:\n<li class="ml-6 my-2 flex items-start">.*?<\/li>)*)/g, 
      '<ul class="space-y-1 my-4 text-gray-700 bg-gray-50 p-4 rounded-lg">$1</ul>');
    
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Clean up extra br tags around lists and tables
    html = html.replace(/<br>(?=<(?:ul|ol|table))/g, '');
    html = html.replace(/(?<=<\/(?:ul|ol|table)>)<br>/g, '');
    
    // Paragraphs with better spacing
    html = html.replace(/(<br>){2,}/g, '</p><p class="mb-4 leading-relaxed">');
    if (!html.startsWith('<table') && !html.startsWith('<ul')) {
      html = '<p class="mb-4 leading-relaxed">' + html + '</p>';
    }

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
