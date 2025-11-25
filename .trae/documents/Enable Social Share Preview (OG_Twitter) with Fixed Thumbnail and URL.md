## What Will Be Implemented
- Configure Open Graph and Twitter meta tags so WhatsApp, Facebook, Instagram and Twitter show a thumbnail preview.
- Always use the thumbnail image with black background + white Hindi text and the fixed site URL `http://167.71.227.234/`.
- Serve the image over HTTP from your Django static files (the filesystem path `/mnt/data/LinkShareThumpnel.png` is not reachable by social apps).

## Static Asset Placement
1. Copy the provided image to your Django static directory: `static/img/share/LinkShareThumpnel.png`.
2. The public image URL will be: `http://167.71.227.234/static/img/share/LinkShareThumpnel.png`.
3. Run `collectstatic` in production so WhiteNoise serves the file.

## View Context (Single Source of Truth)
Update `poll/views.py:26–41` to provide explicit OG/Twitter values:
- `og_title = 'http://167.71.227.234/'` (keeps preview clean while showing the site link)
- `og_description = ''` (empty to avoid extra text)
- `og_image = 'http://167.71.227.234/static/img/share/LinkShareThumpnel.png'` (absolute URL required by social platforms)
- `og_url = 'http://167.71.227.234/'`
- Keep `og_site_name` minimal (domain) and `og_locale = 'hi_IN'`.

## Template Meta Tags
Edit `templates/index.html` head section (lines 3–20) to rely on the view-provided values and add strong hints for scrapers:
- `link rel="canonical" href="{{ og_url }}"`
- `meta property="og:type" content="website"`
- `meta property="og:title" content="{{ og_title }}"`
- `meta property="og:description" content="{{ og_description }}"`
- `meta property="og:image" content="{{ og_image }}"`
- `meta property="og:url" content="{{ og_url }}"`
- `meta property="og:image:type" content="image/png"`
- `meta property="og:image:alt" content="{{ og_title }}"`
- `meta name="twitter:card" content="summary_large_image"`
- `meta name="twitter:title" content="{{ og_title }}"`
- `meta name="twitter:description" content="{{ og_description }}"`
- `meta name="twitter:image" content="{{ og_image }}"`
- `meta name="twitter:url" content="{{ og_url }}"`

Your project already loads these tags in `templates/index.html:7–19`; we will replace the defaults with the fixed values from the view and add `og:image:type`/`og:image:alt`.

## Settings Verification
- `STATIC_URL`/`STATICFILES_DIRS` already configured in `voting_poll/settings.py:129–134`; WhiteNoise is enabled.
- `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` already include `167.71.227.234`.

## Deployment Steps
1. Place the image under `static/img/share/LinkShareThumpnel.png`.
2. Run `python manage.py collectstatic`.
3. Redeploy/restart the app.

## Validation
- Use Facebook Sharing Debugger and Twitter Card Validator to confirm the image/URL render.
- WhatsApp/Instagram may cache aggressively; append a query string to the URL (`http://167.71.227.234/?v=1`) on first share if you need to refresh.
- Verify that fetching `http://167.71.227.234/static/img/share/LinkShareThumpnel.png` returns 200 publicly.

## Outcome
- Sharing `http://167.71.227.234/` on WhatsApp, Facebook, Instagram and Twitter will show the specified thumbnail image and the site URL only, with a clean professional preview.