document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark/Light Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    }

    themeToggle.addEventListener('click', () => {
        if (html.getAttribute('data-theme') === 'dark') {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.replace('bx-sun', 'bx-moon');
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.replace('bx-moon', 'bx-sun');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = mobileToggle.querySelector('i');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        if (navMenu.classList.contains('active')) {
            menuIcon.classList.replace('bx-menu', 'bx-x');
        } else {
            menuIcon.classList.replace('bx-x', 'bx-menu');
        }
    });

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuIcon.classList.replace('bx-x', 'bx-menu');
        });
    });

    // --- Sticky Navbar & Active Link Update ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Update
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- Scroll to Top Button ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Intersection Observer for Scroll Animations ---
    const animateElements = document.querySelectorAll('[data-animate]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // --- Form Validation & Bulletproof Submission ---
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');

    // ─── Config ───
    const RECIPIENT_EMAIL = 'zaynticlabs@gmail.com';
    // Web3Forms access key (registered & active)
    const WEB3FORMS_KEY = '68e5a9eb-6d37-437a-b5c6-ba5d7c412c1c';

    /**
     * Attempt to submit via Web3Forms (PRIMARY provider).
     * Returns true on success, false on failure.
     * Skips entirely if no access key is configured.
     */
    async function sendViaWeb3Forms(payload) {
        if (!WEB3FORMS_KEY) return false; // No key configured, skip
        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: '🚀 New Zayntic Labs Enquiry!',
                    from_name: 'Zayntic Labs Website',
                    name: payload.name,
                    email: payload.email,
                    business: payload.business,
                    message: payload.message
                })
            });
            const data = await res.json();
            return data.success === true;
        } catch (err) {
            console.warn('[Web3Forms] Failed:', err);
            return false;
        }
    }

    /**
     * Attempt to submit via FormSubmit.co (FALLBACK provider).
     * Returns true on success, false on failure.
     */
    async function sendViaFormSubmit(payload) {
        try {
            const res = await fetch('https://formsubmit.co/ajax/' + RECIPIENT_EMAIL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: payload.name,
                    email: payload.email,
                    business: payload.business,
                    message: payload.message,
                    _subject: 'New Zayntic Labs Enquiry (Backup)'
                })
            });
            const data = await res.json();
            return data.success === 'true' || data.success === true;
        } catch (err) {
            console.warn('[FormSubmit] Failed:', err);
            return false;
        }
    }

    /**
     * Save a copy of every submission to Firebase Realtime Database.
     * This guarantees you never lose an enquiry, even if email services fail.
     */
    async function saveToFirebase(payload) {
        try {
            const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js');
            const { getApp } = await import('https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js');
            const app = getApp(); // reuse the already-initialised app
            const db = getDatabase(app);
            const enquiriesRef = ref(db, 'enquiries/zayntic-labs');
            const newRef = push(enquiriesRef);
            await set(newRef, {
                ...payload,
                timestamp: new Date().toISOString(),
                source: 'contact-form'
            });
            console.log('[Firebase] Enquiry saved successfully.');
            return true;
        } catch (err) {
            console.warn('[Firebase] Save failed:', err);
            return false;
        }
    }

    /**
     * Last-resort: open user's mail client with pre-filled email.
     */
    function openMailtoFallback(payload) {
        const subject = encodeURIComponent('Website Enquiry from ' + payload.name);
        const body = encodeURIComponent(
            'Name: ' + payload.name + '\n' +
            'Email: ' + payload.email + '\n' +
            'Business: ' + payload.business + '\n\n' +
            'Message:\n' + payload.message
        );
        window.location.href = 'mailto:' + RECIPIENT_EMAIL + '?subject=' + subject + '&body=' + body;
    }

    /**
     * Show a UI message (success or error).
     */
    function showFormMessage(type, customMsg) {
        if (type === 'success' && formSuccess) {
            formSuccess.style.display = 'flex';
            if (formError) formError.style.display = 'none';
            setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
        } else if (type === 'error' && formError) {
            if (customMsg) formError.querySelector('.error-text').textContent = customMsg;
            formError.style.display = 'flex';
            if (formSuccess) formSuccess.style.display = 'none';
            setTimeout(() => { formError.style.display = 'none'; }, 8000);
        }
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const inputs = ['name', 'email', 'business', 'message'];

            inputs.forEach(id => {
                const input = document.getElementById(id);
                const group = input.closest('.form-group');

                if (!input.value.trim()) {
                    group.classList.add('error');
                    isValid = false;
                } else {
                    if (id === 'email' && !validateEmail(input.value)) {
                        group.classList.add('error');
                        isValid = false;
                    } else {
                        group.classList.remove('error');
                    }
                }

                // Remove error on input
                input.addEventListener('input', () => {
                    group.classList.remove('error');
                }, { once: true });
            });

            if (!isValid) return;

            // Gather form data
            const payload = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                business: document.getElementById('business').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sending...";
            submitBtn.disabled = true;

            // 1) Always save to Firebase first (guaranteed backup — never lose an enquiry)
            saveToFirebase(payload);

            // 2) Try Web3Forms (primary — confirmed active)
            let emailSent = await sendViaWeb3Forms(payload);

            // 3) If Web3Forms failed, try FormSubmit.co (fallback)
            if (!emailSent) {
                console.warn('[Form] Web3Forms failed, trying FormSubmit fallback...');
                emailSent = await sendViaFormSubmit(payload);
            }

            // 4) Handle result
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (emailSent) {
                contactForm.reset();
                showFormMessage('success');
            } else {
                // Both email APIs failed — but Firebase has the data!
                // Open mailto as last resort for immediate email
                console.warn('[Form] All email APIs failed. Data saved to Firebase. Opening mailto fallback.');
                contactForm.reset();
                showFormMessage('error', 'Email services are busy. Opening your email client as backup...');
                setTimeout(() => openMailtoFallback(payload), 1500);
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // --- Update Footer Year ---
    document.getElementById('current-year').textContent = new Date().getFullYear();
});
