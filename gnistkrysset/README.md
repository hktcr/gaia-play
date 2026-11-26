# Gnistkrysset

Ett fristående övningskryss för ellära och magnetism i NO, årskurs 7–9. **Ellära från grunden** har 38 ord och 45 korsningsrutor. De mest avancerade orden kan sparas till efter genomgång. **Hela krysset: el och magnetism** har 49 ord och 67 korsningsrutor. Upplägget följer ledtrådar och stegvis hjälp i Matens väg/Blodkrysset. Inte ett prov: facit finns i sidans JavaScript och progress visas. Övningen lagrar inga elevuppgifter eller namn och har inga nätverksanrop; svar stannar i webbläsarens lokala lagring.

- Mapp: `gnistkrysset/` i `hktcr/gaia-play`, publicerad av repots befintliga GitHub Pages.
- Redigera `BOARDS` i `kryss.js`: `h` = vågrätt, `v` = lodrätt, positioner börjar vid noll. Svenska bokstäver bevaras.
- Kontroll: `node test.mjs` och prova flödet i webbläsare. Motionsinställningen respekteras. Om GitHub Pages behöver återställas, återställ bara commitens ändringar i denna mapp.

Bygg om brädena reproducerbart: `python3 generate.py` med `largewords.json`. Byt ut BOARDS-raden i `kryss.js` mot genererat JSON. Version 2 har separat lokal sparnyckel för att inte fylla det nya brädet med bokstäver från tidigare geometri.

Aktiva direktvägar är `gnistkrysset/` och `el-och-magnetism-krysset/`, vardera med `brade.js` och den gemensamma `gnistkrysset/engine.js`. Vid brädesändringar, uppdatera rätt `brade.js`; historiska `kryss.js` är reserv för tidigare cachad HTML. Båda direktvägarna behåller respektive sparnyckel från den kombinerade versionen.

Spelrummet (`spelrum.js`/`spelrum.css`) använder två självständiga ledtrådskolumner vid sidan om brädet; på telefon väljs riktning med knappar. Svardialogen kopierar rutornas aktuella bokstäver, skriver till brädet först när användaren sparar, och behåller v2:s tidigare sparnycklar. Två hjälpsteg per ord: ledtråd och tryckt sidhänvisning i elevhäftet Ellära och magnetism (2A–2C som referenskontroll). Hänvisningar till bakgrund, där ordet inte nödvändigtvis står i texten, är markerade.
