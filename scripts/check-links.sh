#!/usr/bin/env bash
# Перевіряє базу знань:
#   1) посилання [[...]], що ведуть на неіснуючі документи;
#   2) вимоги без тест-кейсів.
#
# Запуск (Git Bash на Windows або будь-який bash):
#   bash scripts/check-links.sh "D:/шлях/до/бази"
#
# Посилання-приклади з README, CLAUDE.md і шаблонів теж потраплять до списку — це нормально.

set -euo pipefail
export LC_ALL=C.UTF-8

BASE="${1:?Вкажіть папку бази: bash check-links.sh <папка>}"
cd "$BASE"

names=$(mktemp); links=$(mktemp)
find . -name '*.md' -not -path './.git/*' | sed 's#.*/##; s/\.md$//' | sort -u > "$names"
grep -rhoE '\[\[[^]|#]+' --include=*.md . | sed 's/^\[\[//' | sort -u > "$links"

echo "== Посилання на неіснуючі документи"
comm -13 "$names" "$links" || true

echo
echo "== Вимоги без тест-кейсів"
if compgen -G "02 Вимоги/*.md" > /dev/null; then
  grep -L '^- Тест-кейси: \[\[' "02 Вимоги"/*.md || true
else
  echo "(вимог поки немає)"
fi

rm -f "$names" "$links"
