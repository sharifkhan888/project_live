// Global variables
let candidates = [];
let resultsChart = null;
let currentResults = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initLanguage();
    applyTranslations();
    loadCandidates();
    setupEventListeners();
    initModalAccessibility();
    initDeepLink();
});

// Party logos map (supports English and localized labels)
const PARTY_LOGOS = {
    'Congress': '/static/img/parties/congress.png',
    'BJP': '/static/img/parties/BJP.jpg',
    'NCP': '/static/img/parties/RashwadiCongressParty.png',
    'MIM': '/static/img/parties/MIM.png',
    'Independent': '/static/img/parties/independent.svg',
    'कांग्रेस': '/static/img/parties/congress.png',
    'भाजपा': '/static/img/parties/BJP.jpg',
    'राष्ट्रवादी काँग्रेस पार्टी': '/static/img/parties/RashwadiCongressParty.jpg',
    'एआईएम': '/static/img/parties/MIM.png',
    'अपक्ष': '/static/img/parties/png.jpg'
};

function getPartyLogoSrc(party) {
    const key = (party || '').trim();
    return PARTY_LOGOS[key] || PARTY_LOGOS['Independent'];
}

// Party colors map (supports English and localized labels)
const PARTY_COLORS = {
    'Congress': '#ffcc00',
    'BJP': '#4caf50',
    'NCP': '#ff3b30',
    'MIM': '#2196f3',
    'Independent': '#9c27b0',
    'कांग्रेस': '#ffcc00',
    'भाजपा': '#4caf50',
    'राष्ट्रवादी काँग्रेस पार्टी': '#ff3b30',
    'एआईएम': '#2196f3',
    'अपक्ष': '#9c27b0'
};

function getPartyColor(party) {
    const key = (party || '').trim();
    return PARTY_COLORS[key] || '#667eea';
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('vote-form').addEventListener('submit', handleVote);
    const btnResults = document.getElementById('btn-results');
    const btnShare = document.getElementById('btn-share');
    if (btnResults) btnResults.addEventListener('click', () => { loadResults(); showResultsSection(); });
    if (btnShare) btnShare.addEventListener('click', () => openShareModal());

    const langHi = document.getElementById('lang-hi');
    const langEn = document.getElementById('lang-en');
    const langHiM = document.getElementById('lang-hi-m');
    const langEnM = document.getElementById('lang-en-m');
    [langHi, langHiM].forEach(b => b && b.addEventListener('click', () => setLanguage('hi')));
    [langEn, langEnM].forEach(b => b && b.addEventListener('click', () => setLanguage('en')));
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) copyBtn.addEventListener('click', () => copyLink());
}

// Load candidates from API
async function loadCandidates() {
    try {
        const response = await fetch('/api/candidates/');
        const data = await response.json();
        
        if (data.success) {
            const unique = new Map();
            data.candidates.forEach(c => {
                const key = `${(c.name || '').trim()}|${(c.party || '').trim()}`;
                if (!unique.has(key)) unique.set(key, c);
            });
            candidates = Array.from(unique.values());
            renderCandidates();
        } else {
            showToast('उम्मीदवारों को लोड करने में त्रुटि हुई', 'error');
        }
    } catch (error) {
        console.error('Error loading candidates:', error);
        showToast('उम्मीदवारों को लोड करने में त्रुटि हुई', 'error');
    }
}

// Render candidates
function renderCandidates() {
    const container = document.getElementById('candidates-container');
    container.innerHTML = '';

    candidates.forEach(candidate => {
        const candidateDiv = document.createElement('div');
        const logoSrc = getPartyLogoSrc(candidate.party);
        candidateDiv.innerHTML = `
            <input type="radio" id="candidate-${candidate.id}" name="candidate" value="${candidate.id}" class="candidate-radio">
            <label for="candidate-${candidate.id}" class="candidate-label flex items-center justify-between" aria-label="${formatSelectCandidateLabel(candidate)}">
                <div class="flex items-center">
                    <span class="radio-custom" aria-hidden="true"></span>
                    <div class="ml-3">
                        <div class="candidate-name">${candidate.name}</div>
                        <div class="candidate-party">${candidate.party}</div>
                    </div>
                </div>
                <img src="${logoSrc}" alt="${candidate.party} logo" class="party-logo ml-4" />
            </label>
        `;
        container.appendChild(candidateDiv);

        // selection glow on click
        const radio = candidateDiv.querySelector('.candidate-radio');
        const label = candidateDiv.querySelector('.candidate-label');
        const updateSelectionClasses = () => {
            document.querySelectorAll('.candidate-label').forEach(el => el.classList.remove('selected-card'));
            if (radio.checked) label.classList.add('selected-card');
        };
        radio.addEventListener('change', updateSelectionClasses);
        label.addEventListener('click', () => setTimeout(updateSelectionClasses, 0));
    });
}

// Handle vote submission
async function handleVote(event) {
    event.preventDefault();
    
    const selectedCandidate = document.querySelector('input[name="candidate"]:checked');
    if (!selectedCandidate) {
        showToast('कृपया एक उम्मीदवार चुनें', 'error');
        return;
    }
    
    const candidateId = selectedCandidate.value;
    
    try {
        const response = await fetch('/api/vote/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ candidate_id: parseInt(candidateId) })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('आपका वोट सफलतापूर्वक दर्ज किया गया!', 'success');
            try { localStorage.setItem('voted', '1'); } catch (e) {}
            setTimeout(() => {
                loadResults();
                showResultsSection();
            }, 1500);
        } else {
            showToast(data.error || 'वोट दर्ज करने में त्रुटि हुई', 'error');
        }
    } catch (error) {
        console.error('Error casting vote:', error);
        showToast('वोट दर्ज करने में त्रुटि हुई', 'error');
    }
}

// Load results from API
async function loadResults() {
    try {
        const response = await fetch('/api/results/');
        const data = await response.json();
        
        if (data.success) {
            currentResults = data;
            renderResults();
        } else {
            showToast('परिणाम लोड करने में त्रुटि हुई', 'error');
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showToast('परिणाम लोड करने में त्रुटि हुई', 'error');
    }
}

// Render results
function renderResults() {
    if (!currentResults) return;
    
    // Update total votes
    document.getElementById('total-votes').textContent = currentResults.total_votes;
    
    // Render pie chart
    renderPieChart();
    
    // Render progress bars
    renderProgressBars();
}

// Render pie chart
function renderPieChart() {
    const ctx = document.getElementById('results-chart').getContext('2d');
    
    if (resultsChart) {
        resultsChart.destroy();
    }
    
    const labels = currentResults.candidates.map(c => `${c.name} (${c.party})`);
    const data = currentResults.candidates.map(c => c.votes);
    const colors = currentResults.candidates.map(c => getPartyColor(c.party));

    const percentagePlugin = {
        id: 'percentagePlugin',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            const total = dataset.data.reduce((a, b) => a + b, 0);
            ctx.save();
            meta.data.forEach((element, i) => {
                const pos = element.tooltipPosition();
                const val = dataset.data[i];
                const pct = total ? Math.round((val / total) * 100) : 0;
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pct + '%', pos.x, pos.y);
            });
            ctx.restore();
        }
    };
    
    resultsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(context) {
                            const candidate = currentResults.candidates[context.dataIndex];
                            return formatVotesLabel(candidate);
                        }
                    }
                }
            }
        },
        plugins: [percentagePlugin]
    });
}

// Render progress bars
function renderProgressBars() {
    const container = document.getElementById('progress-bars');
    container.innerHTML = '';
    currentResults.candidates.forEach(candidate => {
        const progressDiv = document.createElement('div');
        const logoSrc = getPartyLogoSrc(candidate.party);
        const barColor = getPartyColor(candidate.party);
        progressDiv.innerHTML = `
            <div class="mb-2">
                <div class="flex justify-between items-center mb-1">
                    <div class="flex items-center">
                        <img src="${logoSrc}" alt="${candidate.party} logo" class="party-logo mr-3" />
                        <div>
                            <div class="text-sm font-medium">${candidate.name}</div>
                            <div class="text-xs text-gray-400">${candidate.party}</div>
                        </div>
                    </div>
                    <span class="text-sm text-gray-400">${formatVotesLabel(candidate)}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${candidate.percentage}%; background: ${barColor}">${candidate.percentage}%</div>
                </div>
            </div>
        `;
        container.appendChild(progressDiv);
    });
}

// Show voting section
function showVotingSection() {
    document.getElementById('voting-section').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('back-to-vote').classList.add('hidden');
}

// Show results section
function showResultsSection() {
    document.getElementById('voting-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('back-to-vote').classList.remove('hidden');
}

// Language strings and toggle
const STRINGS = {
    hi: {
        page_title: 'प्रभाग क्र. 8 – ब: में जनता के',
        subheading: '(मदारटेकडी, ताजनगर, मुस्ताकअली नगर)',
        question: 'नगरसेवक के लिए सर्वश्रेष्ठ उम्मीदवार कौन?',
        voting_title: 'अपना वोट दें',
        vote_hint: 'अपना पसंदीदा उम्मीदवार चुनें और वोट करें',
        vote_btn: 'वोट करें',
        results_btn: 'परिणाम',
        share_btn: 'शेयर',
        results_title: 'मतदान परिणाम',
        total_votes_label: 'कुल वोट',
        back_to_vote: 'वापस वोट करें',
        share_results: 'परिणाम साझा करें',
        share_modal_title: 'परिणाम साझा करें',
        share_via_link: 'लिंक के माध्यम से साझा करें',
        copy_link: 'लिंक कॉपी करें',
        close: 'बंद करें',
        share_on_social: 'सोशल मीडिया पर साझा करें',
        load_candidates_error: 'उम्मीदवारों को लोड करने में त्रुटि हुई',
        must_select: 'कृपया एक उम्मीदवार चुनें',
        vote_success: 'आपका वोट सफलतापूर्वक दर्ज किया गया!',
        vote_error: 'वोट दर्ज करने में त्रुटि हुई',
        results_error: 'परिणाम लोड करने में त्रुटि हुई',
        copied: 'लिंक कॉपी किया गया!',
        copy_error: 'लिंक कॉपी करने में त्रुटि हुई',
        share_instagram_hint: 'लिंक कॉपी किया गया! Instagram में साझा करें।',
        select_candidate_aria: (name, party) => `उम्मीदवार चुनें ${name} (${party})`,
        votes_label: (name, votes, percentage) => `${votes} वोट (${percentage}%)`
    },
    en: {
        page_title: 'Ward No. 8-B: Councillor Election Poll',
        subheading: '(Madartekdi, Tajnagar, MustaqAli Nagar)',
        question: 'Who is the best candidate for Councillor?',
        voting_title: 'Cast Your Vote',
        vote_hint: 'Select your preferred candidate and cast your vote',
        vote_btn: 'Vote',
        results_btn: 'Results',
        share_btn: 'Share',
        results_title: 'Voting Results',
        total_votes_label: 'Total Votes',
        back_to_vote: 'Back to Vote',
        share_results: 'Share Results',
        share_modal_title: 'Share Results',
        share_via_link: 'Share via Link',
        copy_link: 'Copy Link',
        close: 'Close',
        share_on_social: 'Share on Social Media',
        load_candidates_error: 'Error loading candidates',
        must_select: 'Please select a candidate',
        vote_success: 'Your vote was recorded successfully!',
        vote_error: 'Error casting vote',
        results_error: 'Error loading results',
        copied: 'Link copied!',
        copy_error: 'Error copying link',
        share_instagram_hint: 'Link copied! Share on Instagram.',
        select_candidate_aria: (name, party) => `Select candidate ${name} (${party})`,
        votes_label: (name, votes, percentage) => `${votes} votes (${percentage}%)`
    }
};

function initLanguage() {
    const saved = localStorage.getItem('lang') || 'hi';
    setLanguage(saved);
}

function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    const strings = STRINGS[lang];
    document.documentElement.lang = lang;
    const hint = document.getElementById('vote-hint');
    const btnVote = document.getElementById('btn-vote');
    const btnResults = document.getElementById('btn-results');
    const btnShare = document.getElementById('btn-share');
    if (hint) hint.textContent = strings.vote_hint;
    if (btnVote) btnVote.textContent = strings.vote_btn;
    if (btnResults) btnResults.textContent = strings.results_btn;
    if (btnShare) btnShare.textContent = strings.share_btn;
    applyTranslations();

    // toggle active style
    const setActive = (activeBtnIds) => {
        ['lang-hi','lang-en','lang-hi-m','lang-en-m'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('active');
        });
        activeBtnIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('active');
        });
    };
    if (lang === 'hi') setActive(['lang-hi','lang-hi-m']); else setActive(['lang-en','lang-en-m']);
}

function applyTranslations() {
    const lang = localStorage.getItem('lang') || 'hi';
    const strings = STRINGS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = strings[key];
        if (typeof value === 'string') {
            el.textContent = value;
        }
    });
    // Update share link input placeholder/value
    const shareInput = document.getElementById('share-link-input');
    if (shareInput) shareInput.value = getShareUrl();
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `fixed top-4 right-4 z-50 toast-enter`;
    
    // Remove existing classes and add new ones
    toast.querySelector('.glass-card').className = `glass-card px-6 py-4 rounded-lg shadow-lg toast-${type}`;
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('toast-exit');
        }, 300);
    }, 3000);
}

// Share modal functions
function openShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    trapFocus(modal);
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Social media sharing functions
function shareOnWhatsApp() {
    const lang = localStorage.getItem('lang') || 'hi';
    const total = (typeof currentResults?.total_votes !== 'undefined') ? currentResults.total_votes : 0;
    const shareUrl = getShareUrl();
    const textHi = `प्रभाग क्र. 8 – ब: नगरसेवक चुनाव परिणाम: कुल ${total} वोट पड़े। ${shareUrl}`;
    const textEn = `Ward 8-B Councillor Poll Results: Total ${total} votes. ${shareUrl}`;
    const text = lang === 'hi' ? textHi : textEn;
    if (navigator.share) {
        navigator.share({ title: STRINGS[lang].page_title, text, url: shareUrl }).catch(() => {});
        return;
    }
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(navigator.userAgent);
    const appUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const webUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (isMobile) {
        const fallback = setTimeout(() => { window.open(webUrl, '_blank'); }, 800);
        try {
            window.location.href = appUrl;
        } catch (e) {
            clearTimeout(fallback);
            window.open(webUrl, '_blank');
        }
    } else {
        window.open(webUrl, '_blank');
    }
}

function shareOnTwitter() {
    const text = `Ward 8-B Poll Results: Total ${currentResults?.total_votes || 0} votes`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
}

function shareOnInstagram() {
    const lang = localStorage.getItem('lang') || 'hi';
    const total = (typeof currentResults?.total_votes !== 'undefined') ? currentResults.total_votes : 0;
    const textHi = `प्रभाग क्र. 8 – ब: नगरसेवक चुनाव परिणाम: कुल ${total} वोट पड़े।`;
    const textEn = `Ward 8-B Councillor Poll Results: Total ${total} votes.`;
    const text = lang === 'hi' ? textHi : textEn;
    if (navigator.share) {
        navigator.share({ title: STRINGS[lang].page_title, text, url: getShareUrl() }).catch(() => {});
        return;
    }
    copyLink();
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(navigator.userAgent);
    const appUrl = 'instagram://app';
    const webUrl = 'https://www.instagram.com/';
    if (isMobile) {
        const fallback = setTimeout(() => { window.open(webUrl, '_blank'); }, 800);
        try {
            window.location.href = appUrl;
        } catch (e) {
            clearTimeout(fallback);
            window.open(webUrl, '_blank');
        }
    } else {
        window.open(webUrl, '_blank');
    }
    showToast(STRINGS[lang].share_instagram_hint, 'success');
}

function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank');
}

function copyLink() {
    const input = document.getElementById('share-link-input');
    const toCopy = input ? input.value : getShareUrl();
    navigator.clipboard.writeText(toCopy).then(() => {
        const lang = localStorage.getItem('lang') || 'hi';
        showToast(STRINGS[lang].copied, 'success');
    }).catch(() => {
        const lang = localStorage.getItem('lang') || 'hi';
        showToast(STRINGS[lang].copy_error, 'error');
    });
}

// Accessibility helpers for modal
function initModalAccessibility() {
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('share-modal');
        const isOpen = modal && modal.classList.contains('flex') && !modal.classList.contains('hidden');
        if (!isOpen) return;
        if (e.key === 'Escape') {
            closeShareModal();
        }
    });
}

function trapFocus(container) {
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();
    container.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

// i18n helpers
function formatVotesLabel(candidate) {
    const lang = localStorage.getItem('lang') || 'hi';
    const strings = STRINGS[lang];
    return strings.votes_label(candidate.name, candidate.votes, candidate.percentage);
}

function formatSelectCandidateLabel(candidate) {
    const lang = localStorage.getItem('lang') || 'hi';
    const strings = STRINGS[lang];
    return strings.select_candidate_aria(candidate.name, candidate.party);
}

// Deep-link & share helpers
function getShareUrl() {
    const base = window.location.origin + window.location.pathname;
    return base;
}

function initDeepLink() {
    try {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view === 'results') {
            loadResults();
            showResultsSection();
        } else {
            showVotingSection();
        }
    } catch (e) {}
}
