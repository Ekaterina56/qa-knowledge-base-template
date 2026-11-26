#!/usr/bin/env node
// Превращает выгрузку задачи из Jira («Export → Word», файл .doc — на самом деле HTML)
// в обычный текст, который агент кладёт в «07 Входящие» дословно.
//
// Запуск:
//   node scripts/jira-doc-to-text.js "C:\Users\<имя>\Downloads\PROJ-123.doc" PROJ-123.txt
//
// Без зависимостей, только Node.js. Ничего не отправляет в сеть.

const fs = require('fs');

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('Использование: node jira-doc-to-text.js <выгрузка.doc> <результат.txt>');
  process.exit(1);
}

let h = fs.readFileSync(input, 'utf8');

// служебные блоки
h = h.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '');

// структура: переносы строк, списки, ячейки
h = h
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|tr|h\d|li|table|pre)>/gi, '\n')
  .replace(/<li[^>]*>/gi, '- ')
  .replace(/<\/t[dh]>/gi, ' | ');

// ссылки: «текст (адрес)»
h = h.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');

// остальные теги
h = h.replace(/<[^>]+>/g, '');

// HTML-сущности
const ent = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&laquo;': '«', '&raquo;': '»', '&mdash;': '—', '&ndash;': '–',
};
h = h.replace(/&[a-z#0-9]+;/gi, m =>
  ent[m] ?? (m.startsWith('&#') ? String.fromCharCode(parseInt(m.slice(2), 10)) : m));

// пробелы и пустые строки
h = h
  .split('\n')
  .map(l => l.replace(/[ \t]+/g, ' ').trim())
  .join('\n')
  .replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(output, h);
console.log(`Готово: ${output} (${h.split('\n').length} строк)`);
