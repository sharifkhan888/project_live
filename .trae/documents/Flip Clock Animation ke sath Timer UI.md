## Uddeyshya
- Plain text timer ko Flip Clock animation counter mein badalna (Days / Hours / Minutes / Seconds).
- Backend endpoint `api/end_time/` ko jaisa hai waisa hi rakhna; sirf front‑end UI aur JS update.

## Kahan Par Badlav Honge
- `templates/index.html:37` par `#global-timer` ke andar flip clock ka markup.
- `static/js/app.js:43` mein `initGlobalTimer` ko flip digits update/animate karne ke liye modify.
- `static/css/styles.css` mein Flip Clock ke liye CSS animations aur styles add.

## HTML Updates
- `#global-timer` ke andar 4 units ka container add: Days, Hours, Minutes, Seconds.
- Har unit ke liye 2‑digit flip cards (tens, ones) ka structure: `.flip-unit` → `.flip-card` (top/bottom halves) + label.
- Labels ko i18n ke saath rakhen, taaki Hindi/English dono support ho.

## CSS Updates
- Naye classes: `.flip-clock`, `.flip-unit`, `.flip-card`, `.flip-top`, `.flip-bottom`, aur `.flip-animate` keyframes.
- Theme match: glassmorphism background, Tailwind color palette ke saath subtle shadows/borders.
- Responsive: mobile par compact sizing; desktop par larger digits.

## JS Updates
- `initGlobalTimer`:
  - First run par flip clock DOM build kare.
  - Server‑synced remaining time calculate logic jaise ka taisa rahe.
  - `render(remaining)` ko digits compute karne aur sirf value change par flip animation trigger karne ke liye update kare.
  - Cascade handle: seconds change → seconds flip; minute/hour/day change par respective units flip.
- I18n:
  - `STRINGS` mein unit labels add kare: `days_label`, `hours_label`, `minutes_label`, `seconds_label` (Hindi/English).
  - `setLanguage/applyTranslations` se labels update hon.

## Accessibility
- `#global-timer` ko `aria-live="polite"` rehne den.
- Animated halves ko `aria-hidden` rakhen; har unit label/`aria-label` mein current value announce ho sake.

## Verification
- Local run par har second par flip animation sahi trigger ho.
- Lang toggle (Hindi/English) par labels sahi update ho, digits unaffected.
- `remaining <= 0` par end time dubara fetch ho aur cycle continue.

## Deliverables
- Updated HTML (timer section), CSS (flip clock styles), JS (`initGlobalTimer` + i18n labels).

Kya main in changes ko apply karu?