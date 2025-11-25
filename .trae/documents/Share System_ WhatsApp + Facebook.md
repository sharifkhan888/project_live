## लक्ष्य
- मौजूदा "Share" सिस्टम से अतिरिक्त विकल्प हटाना और केवल WhatsApp व Facebook दिखाना
- शेयर प्रीव्यू में `img/parties/LinkShareThumpnel.png` थंबनेल व नीचे "voting poll" टेक्स्ट दिखाना
- क्लिक करने पर `http://167.71.227.234/` खुलना; थंबनेल पर URL टेक्स्ट न दिखे

## टेम्पलेट अपडेट
- `templates/index.html` में शेयर मोडल से "Share via Link" सेक्शन हटाना (lines 106–112)
- Twitter व Instagram बटन हटाना, केवल WhatsApp व Facebook रखना (lines 121–128)
- "Share" बटन क्लिक पर हमेशा हमारा शेयर मोडल खुले; न कि Native Share API
  - बटन: `templates/index.html:59–62, 88–90`

## JavaScript बदलाव
- `static/js/app.js`
  - `setupEventListeners()` में `btnShare` हैंडलर को हमेशा `openShareModal()` करना (lines 60–66)
  - `shareNative()` की जरूरत नहीं; कॉल हटाना (lines 61–63)
  - `shareOnWhatsApp()` में टेक्स्ट को केवल लिंक या छोटा टेक्स्ट रखना ताकि प्रीव्यू कार्ड में केवल OG इमेज + टाइटल दिखे; URL प्रीव्यू बनेगा और क्लिक पर साइट खुलेगी (lines 486–511)
  - `shareOnFacebook()` वही `sharer.php?u=<url>` उपयोग करेगा (lines 547–550)
  - `getShareUrl()` से canonical लिया जा रहा है; canonical पहले से `http://167.71.227.234/` है, इसलिए कोई बदलाव नहीं (lines 626–637)

## Open Graph सेटअप
- OG मेटा पहले से हैं: `index.html:7–23`
- `poll/views.py:27–43` में OG वैल्यूज़ को ठीक करना:
  - `og_title = 'voting poll'`
  - `og_url = 'http://167.71.227.234/'` (पहले से सेट)
  - `og_image = absolute('/static/img/parties/LinkShareThumpnel.png')` (पहले से सेट)
  - `og_description` खाली या न्यूनतम टेक्स्ट
- इससे WhatsApp/Facebook दोनों पर थंबनेल इमेज और "voting poll" दिखेगा; क्लिक पर साइट खुलेगी

## सीमाएँ/नोट्स
- WhatsApp/Facebook प्रीव्यू कार्ड प्लेटफॉर्म-ड्रिवन होते हैं; कार्ड पर डोमेन/साइट-नेम दिखाई दे सकता है जिसे पूरी तरह छुपाया नहीं जा सकता
- संदेश बॉडी में URL टेक्स्ट न दिखे, इसके लिए हम शेयर टेक्स्ट को न्यूनतम रखेंगे; प्रीव्यू कार्ड में "voting poll" टाइटल दिखेगा

## वैरिफिकेशन
- Dev सर्वर पर पेज लोड कर के:
  - "Share" क्लिक → सिर्फ WhatsApp, Facebook दिखें
  - WhatsApp वेब/मोबाइल पर शेयर → कार्ड में `LinkShareThumpnel.png` + "voting poll" दिखे, क्लिक पर `http://167.71.227.234/` खुले
  - Facebook शेयर → समान प्रीव्यू व लिंक ओपन

## अगले कदम (इम्प्लीमेंटेशन)
1. `index.html` से लिंक-शेयर सेक्शन, Twitter/Instagram बटन हटाना
2. `app.js` में Share हैंडलर को मोडल-ओनली करना; WhatsApp टेक्स्ट मिनिमाइज़ करना
3. `views.py` में `og_title` को `'voting poll'` करना और बाकी OG वैल्यूज़ की पुष्टि
4. ब्राउज़र में परीक्षण और प्रीव्यू सत्यापन