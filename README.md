# javna-narocila-core — Docker usage
## Vsebina
- `scraper/` — Node scraper (Puppeteer)
- `webapp/` — Vite/React aplikacija, strezena z nginx
- `docker-compose.yml` — definira `scraper` in `web` servise

## Predpogoji
- Docker Desktop (Windows)
- PowerShell

## Docker
- `scraper/Dockerfile` — image za zagon `node scraper.js`, vsebuje potrebne knjižnice za Chromium
- `webapp/Dockerfile` — multi-stage build (Node -> build -> nginx)
- `docker-compose.yml` — sestavi in poveže `scraper` in `web` storitve
- `.dockerignore` datoteke

## Hitri primeri (PowerShell)
Pozicija: odpri PowerShell v korenski mapi repozitorija (kjer je `docker-compose.yml`).

1) Zgradi in zaženite oba servisa (v foreground):

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
# spremljaj loge webapp-a
docker compose logs -f web
# spremljaj loge scraper-ja
docker compose logs -f scraper
```

4) Zaženi scraper en-shot (če želite ročno pognati skripto iz compose okolja):

```powershell
# pozene enkratni container iz specifičnega servisa
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

## Kje najdeš podatke
- Scraper zapisuje rezultate v `scraper/data.json` (to datoteko sem na hostu tudi mountal v container). Po končanem zagonu/izvršitvi preverite `scraper/data.json` na hostu.
- Web aplikacija streže `webapp/public/data.json` kot `http://<host>:8080/data.json` (sestavljeno verzijo). V `docker-compose.yml` je mount, ki kopira `webapp/public/data.json` v nginx serve lokacijo.

## Pogosti ukazi za debug
- Poglej stanje containerjev:

```powershell
docker ps -a
```

- Vstopi v running container (scraper) za ročni debug:

```powershell
docker compose run --rm --entrypoint "bash" scraper
# ali
docker exec -it javna-scraper /bin/bash
```

- Če želiš pognati scraper interaktivno z dovolj deljenega pomnilnika (če Chromium crkuje):

```powershell
docker run --rm -it --shm-size=1g -v ${PWD}:/app node:18-bullseye-slim bash
# nato v containerju: node scraper.js
```

