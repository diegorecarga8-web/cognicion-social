#!/bin/sh
# Descarga las tipografías de Google Fonts (licencia OFL) que usan los mockups
# y reescribe fonts/fonts.css para que apunte a los archivos locales.
set -e
cd "$(dirname "$0")"
mkdir -p fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Playfair+Display:wght@700;900&family=Playball&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=block" > fonts/fonts.css
grep -o "https://fonts.gstatic.com[^)]*" fonts/fonts.css | sort -u | while read -r u; do
  f=$(echo "$u" | sed 's|https://fonts.gstatic.com/s/||; s|/|_|g')
  curl -sS -o "fonts/$f" "$u"
  sed -i.bak "s|$u|$f|g" fonts/fonts.css
done
rm -f fonts/fonts.css.bak
echo "Fuentes listas en $(pwd)/fonts"
