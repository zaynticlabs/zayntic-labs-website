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

    // --- Form Validation ---
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
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

            if (isValid) {
                // Mock form submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sending...";
                submitBtn.disabled = true;

                fetch("https://formsubmit.co/ajax/zaynticlabs@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        business: document.getElementById('business').value,
                        message: document.getElementById('message').value,
                        _subject: "New Website Lead!"
                    })
                })
                .then(response => response.json())
                .then(data => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    contactForm.reset();
                    formSuccess.style.display = 'flex';
                    
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 5000);
                })
                .catch(error => {
                    console.error("Error:", error);
                    submitBtn.innerHTML = "Error! Try Again.";
                    submitBtn.disabled = false;
                });
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
