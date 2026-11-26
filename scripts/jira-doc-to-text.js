#!/usr/bin/env node
// Перетворює вивантаження задачі з Jira («Export → Word», файл .doc — насправді HTML)
// на звичайний текст, який агент кладе в «07 Вхідні» дослівно.
//
// Запуск:
//   node scripts/jira-doc-to-text.js "C:\Users\<ім'я>\Downloads\PROJ-123.doc" PROJ-123.txt
//
// Без залежностей, лише Node.js. Нічого не надсилає в мережу.

const fs = require('fs');

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('Використання: node jira-doc-to-text.js <вивантаження.doc> <результат.txt>');
  process.exit(1);
}

let h = fs.readFileSync(input, 'utf8');

// службові блоки
h = h.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');

// структура: перенесення рядків, списки, клітинки
h = h
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|tr|h\d|li|table|pre)>/gi, '\n')
  .replace(/<li[^>]*>/gi, '- ')
  .replace(/<\/t[dh]>/gi, ' | ');

// посилання: «текст (адреса)»
h = h.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');

// решта тегів
h = h.replace(/<[^>]+>/g, '');

// HTML-сутності
const ent = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&laquo;': '«', '&raquo;': '»', '&mdash;': '—', '&ndash;': '–',
};
h = h.replace(/&[a-z#0-9]+;/gi, m =>
  ent[m] ?? (m.startsWith('&#') ? String.fromCharCode(parseInt(m.slice(2), 10)) : m));

// пробіли й порожні рядки
h = h
  .split('\n')
  .map(l => l.replace(/[ \t]+/g, ' ').trim())
  .join('\n')
  .replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(output, h);
console.log(`Готово: ${output} (${h.split('\n').length} рядків)`);
