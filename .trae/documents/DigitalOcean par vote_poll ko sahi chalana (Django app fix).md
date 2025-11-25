**Mudda Samajh**
- Homepage dikhta hai par candidates/result data nahi aa raha; vote POST bhi fail hota hoga.
- Project Django + DRF + Whitenoise hai. Data API se aata hai: `/api/candidates/`, `/api/results/`, `/api/vote/`.
- Production DB par seed data missing hone ki sambhavna zyada; CSRF ke kaaran vote POST 403 fail ho sakta hai.

**Root Causes**
- DB seed missing: `Candidate` table empty hone par UI mein koi list render nahi hoti.
- CSRF: `cast_vote` POST view CSRF-protected hai, frontend CSRF token nahi bhej raha.
- Env config: `.env` mein `POSTGRES_PASSWORD` empty, `DEBUG=True`; production ke liye sahi values set karni chahiye.
- HTTPS: Browser “Not secure” dikha raha; optionally SSL enable karna hai.

**Code Mein Required Changes**
1) CSRF ko vote endpoint par off karna
- `poll/views.py:42` ke upar import add karein: `from django.views.decorators.csrf import csrf_exempt`.
- `cast_vote` par decorator lagayein: `@csrf_exempt` ko `@api_view(['POST'])` ke upar.

2) Settings harden aur origins set
- `voting_poll/settings.py:28` par `DEBUG` ko prod mein `False` rakhein via `.env` (`DEBUG=False`).
- `voting_poll/settings.py` mein add karein:
  - `CSRF_TRUSTED_ORIGINS = ['http://167.71.227.234', 'https://<aapka-domain>']`
  - `ALLOWED_HOSTS` ko `.env` se IP/domain dekar restrict karna behtar hai (`ALLOWED_HOSTS=167.71.227.234,<domain>`). Abhi `'*'` hai.
  - Optional: `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')` aur jab SSL ho to `SECURE_SSL_REDIRECT = True`.
- CORS: Abhi `CORS_ALLOW_ALL_ORIGINS = True` (`settings.py:149`). Production mein specific origin list rakhein.

**Server/DB Steps (Droplet par chalane ke liye)**
1) Env set
- `.env` update: 
  - `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` ko droplet/managed Postgres ke actual values se set karein.
  - `DEBUG=False`
- Gunicorn/Nginx ko env file read karwana ensure karein.

2) Migrations + Seed Data
- Commands:
  - `python manage.py migrate`
  - `python manage.py loaddata db_dump_p.json`
- Verify: `curl http://167.71.227.234/api/candidates/` se JSON list aaye.

3) Static assets
- `python manage.py collectstatic --noinput`
- Nginx me `location /static/` ya Whitenoise (already enabled) se serve ho raha; confirm.

4) Service restart
- `systemctl restart gunicorn` (ya jo service aap use kar rahe hain) aur Nginx reload.

5) HTTPS (optional par recommended)
- Nginx `server_name <domain>;` set.
- Certbot: `sudo certbot --nginx -d <domain>`.
- Django: `SECURE_SSL_REDIRECT=True` enable karein.

**Verification Checklist**
- `GET /api/candidates/` → candidates array populated.
- `GET /api/results/` → `total_votes` + candidates summary.
- Vote flow: Select candidate → `POST /api/vote/` 201 success (CSRF exempted) → Results update.
- Browser Network tab me 200/201 responses; Console me koi error nahi.

**Deliverables**
- Code edits: `poll/views.py` me CSRF exempt; `voting_poll/settings.py` me trusted origins + prod settings.
- Server-side commands: migrations, seed, collectstatic, service restart.

Aap confirm kar dein to main ye changes apply karke droplet par verify kar dunga.