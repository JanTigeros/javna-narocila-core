# javna-narocila-core — Docker usage

Ta README razloži, kako zgraditi in pognati projekt z Dockerjem (PowerShell na Windows).

## Vsebina
- `scraper/` — Node scraper (Puppeteer)
- `webapp/` — Vite/React aplikacija, strezena z nginx
- `docker-compose.yml` — definira `scraper` in `web` servise

## Predpogoji
- Docker Desktop (Windows)
- PowerShell (npr. privzeti Windows PowerShell ali PowerShell Core)
- Če uporabljate Windows, poskrbite, da so mape, ki jih montirate (npr. projektna mapa), deljene v Docker Desktop (Settings > Resources > File Sharing) — sicer volumen mount lahko ne deluje.

## Kaj sem ustvaril
- `scraper/Dockerfile` — image za zagon `node scraper.js`, vsebuje potrebne knjižnice za Chromium
- `webapp/Dockerfile` — multi-stage build (Node -> build -> nginx)
- `docker-compose.yml` — sestavi in poveže `scraper` in `web` storitve
- `.dockerignore` datoteke

## Hitri primeri (PowerShell)
Pozicija: odprite PowerShell v korenski mapi repozitorija (kjer je `docker-compose.yml`).

1) Zgradite in zaženite oba servisa (v foreground):

```powershell
# zgradi slike in pognemo
docker compose up --build
```

2) Gradnja in zagon v ozadju (detached):

```powershell
docker compose up -d --build
```

3) Spremljanje logov (npr. web):

```powershell
# spremljaj loge web storitve
docker compose logs -f web
# spremljaj loge scraper storitve
docker compose logs -f scraper
```

4) Zaženete scraper enačrtno (en-shot) (če želite ročno pognati skripto iz compose okolja):

```powershell
# pognemo enkratni container iz specifičnega servisa
docker compose run --rm scraper node scraper.js
```

5) Ustavitev in odstranitev containerjev:

```powershell
# ustavi
docker compose down
# ustavi in odstrani tudi omrežja/volumes (če imate volumes konfigurirane)
docker compose down --volumes --remove-orphans
```

6) Če spremenite kodo in želite ponovno zgraditi slike:

```powershell
docker compose build --no-cache
docker compose up -d --build
```

## Kje najdete podatke
- Scraper zapisuje rezultate v `scraper/data.json` (to datoteko sem na hostu tudi mountal v container). Po končanem zagonu/izvršitvi preverite `scraper/data.json` na hostu.
- Web aplikacija streže `webapp/public/data.json` kot `http://<host>:8080/data.json` (sestavljeno verzijo). V `docker-compose.yml` je mount, ki kopira `webapp/public/data.json` v nginx serve lokacijo.

## Prilagoditve in priporočila
- Puppeteer/Chromium:
  - Dockerfile v `scraper` privzeto namesti sistemske knjižnice, Puppeteer pa običajno med `npm install` prenese Chromium. Če želite preprečiti prenos (če že imate sistemski Chrome/Chromium), nastavite okoljsko spremenljivko `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` in podajte `PUPPETEER_EXECUTABLE_PATH` do binarije.
  - Če imate težave s Chromium (ne zažene se znotraj containera), preverite:
    - ali imate vse sistemske odvisnosti (Dockerfile naj jih zagotovi)
    - ali ima container dovolj privilegijev; za debug lahko začasno dodate `--cap-add=SYS_ADMIN` ali `--shm-size=1g` (nevarno za produkcijo, le za debug)

- Montiranje datotek:
  - Compose trenutno montira `./scraper/data.json:/app/data.json` in `./webapp/public/data.json:/usr/share/nginx/html/data.json:ro`.
  - Če scraper zapisuje na več lokacij, prilagodite `volumes` v `docker-compose.yml` ali spremenite pot v `scraper.js`.

- SPA in nginx:
  - Če uporabljate client-side routing (history API) in imate napake pri refreshu poti, priporočam dodati lastno `nginx.conf` z fallback na `index.html` in kopirati v `webapp/Dockerfile`.

## Pogoste ukaze za debug
- Poglejte stanje containerjev:

```powershell
docker ps -a
```

- Vstopite v laufajoči container (scraper) za ročni debug:

```powershell
docker compose run --rm --entrypoint "bash" scraper
# ali
docker exec -it javna-scraper /bin/bash
```

- Če želite pognati scraper interaktivno z dovolj deljenega pomnilnika (če Chromium crkuje):

```powershell
docker run --rm -it --shm-size=1g -v ${PWD}:/app node:18-bullseye-slim bash
# nato v containerju: node scraper.js
```

## Najpogostejše težave in rešitve
- "Mounting fails on Windows": preverite Docker Desktop File Sharing ter da PowerShell teče z dovoljenji in pot ni UNC. Uporabite absolutno pot, če je potrebno.
- "Chromium/pupeteer ne zažene": preverite `npm install` log in ali se Chromium prenese; dodajte `--shm-size=1g` in preizkusite.
- Če dobite napako `page.waitForTimeout is not a function`, repo že vsebuje `sleep()` helper in `scraper.js` je prilagojen — poskrbite, da ste rebuildali sliko po spremembah.

## Napredne možnosti
- Periodični zagon scraperja:
  - Uporabite crontab v ločenem containerju, ali zunanje orodje (GitHub Actions, host CRON) za periodično `docker compose run --rm scraper node scraper.js`.
  - Lahko ustvarite wrapper skripto v `scraper/` ki v zanki čaka in klice scraper s sleep; nato v `docker-compose.yml` nastavite `restart: always`.

## Vprašanja in nadaljnje izboljšave
- Želite, da:
  - prilagodim `scraper` image, da uporablja sistemski Chromium namesto prenosa? (zahteva nastavitve in path)
  - dodam `nginx.conf` z history API fallback za SPA? 
  - dodam cron-mehanizem (npr. `scheduler` servis) za periodični zagon scraperja?

---
Ta README sem pripravil za lažji začetek z Dockerjem. Če želiš, lahko sedaj:
- dodam `nginx.conf` za SPA fallback, ali
- nastavim `PUPPETEER_EXECUTABLE_PATH` in prilagodim `Dockerfile` če želiš sistemski Chrome.

