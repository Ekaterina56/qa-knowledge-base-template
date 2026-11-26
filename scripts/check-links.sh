#!/usr/bin/env bash
# Проверяет базу знаний:
#   1) ссылки [[...]], которые ведут на несуществующие документы;
#   2) требования без тест-кейсов.
#
# Запуск (Git Bash на Windows, или любой bash):
#   bash scripts/check-links.sh "D:/путь/к/базе"
#
# Ссылки-примеры из README, CLAUDE.md и шаблонов тоже попадут в список — это нормально.

set -euo pipefail
export LC_ALL=C.UTF-8

BASE="${1:?Укажите папку базы: bash check-links.sh <папка>}"
cd "$BASE"

names=$(mktemp); links=$(mktemp)
find . -name '*.md' -not -path './.git/*' | sed 's#.*/##; s/\.md$//' | sort -u > "$names"
grep -rhoE '\[\[[^]|#]+' --include=*.md . | sed 's/^\[\[//' | sort -u > "$links"

echo "== Ссылки на несуществующие документы"
comm -13 "$names" "$links" || true

echo
echo "== Требования без тест-кейсов"
if compgen -G "02 Требования/*.md" > /dev/null; then
  grep -L '^- Тест-кейсы: \[\[' "02 Требования"/*.md || true
else
  echo "(требований пока нет)"
fi

rm -f "$names" "$links"
