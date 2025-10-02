document.addEventListener('DOMContentLoaded', function() {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.classList.add('hidden');
        }
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Scrollspy for active nav link ---
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (navLinks.length > 0 && sections.length > 0) {
        const scrollSpyObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const activeLink = document.querySelector(`.navbar-nav .nav-link[href="#${id}"]`);

                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));

                    // Add active class to the intersecting link
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sections.forEach(section => scrollSpyObserver.observe(section));
    }

    // --- Fade-in sections on scroll ---
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    if (fadeInSections.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        fadeInSections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Certificate Modal ---
    const certificateModal = document.getElementById('certificateModal');
    if (certificateModal) {
        certificateModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const imgSrc = button.getAttribute('data-img-src');
            const modalImageContainer = document.getElementById('modalCertificateImageContainer');
            if (modalImageContainer) {
                modalImageContainer.style.backgroundImage = `url('${imgSrc}')`;
            }
        });
    }

    // --- Contact Form Validation & Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear previous validation states and status messages
            const inputs = contactForm.querySelectorAll('.form-control');
            inputs.forEach(input => input.classList.remove('is-invalid'));
            formStatus.innerHTML = '';

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            let isValid = true;

            // Validate Name
            if (name.value.trim() === '') {
                name.classList.add('is-invalid');
                isValid = false;
            }

            // Validate Email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.value)) {
                email.classList.add('is-invalid');
                isValid = false;
            }

            // Validate Message
            if (message.value.trim() === '') {
                message.classList.add('is-invalid');
                isValid = false;
            }

            if (isValid) {
                // Form is valid, proceed with submission
                const formData = new FormData(contactForm);
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;

                // Disable button and show spinner
                submitButton.disabled = true;
                submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...`;

                fetch('send_email.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        formStatus.innerHTML = `<div class="alert alert-success" role="alert">${data.message}</div>`;
                        contactForm.reset();
                    } else {
                        formStatus.innerHTML = `<div class="alert alert-danger" role="alert">${data.message}</div>`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    formStatus.innerHTML = `<div class="alert alert-danger" role="alert">Oops! Something went wrong. Please try again later.</div>`;
                })
                .finally(() => {
                    // Re-enable button and restore text
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                });
            }
        });
    }

    // --- Language Toggle (assuming it exists from translations.js) ---
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        if (typeof applyTranslations === 'function') {
            // Apply initial language on page load
            const savedLang = localStorage.getItem('lang') || 'en';
            document.documentElement.lang = savedLang;
            document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
            applyTranslations(savedLang);

            // Add click event listener
            langToggle.addEventListener('click', () => {
                const originalButtonText = langToggle.innerHTML;
                langToggle.disabled = true;
                langToggle.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

                // Use a timeout to allow the UI to update with the spinner
                setTimeout(() => {
                    try {
                        const currentLang = document.documentElement.lang;
                        const newLang = currentLang === 'en' ? 'ar' : 'en';
                        localStorage.setItem('lang', newLang);
                        document.documentElement.lang = newLang;
                        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                        applyTranslations(newLang);
                    } catch (error) {
                        console.error("Failed to apply translations:", error);
                    } finally {
                        // This block will always run, ensuring the button is restored
                        langToggle.disabled = false;
                        langToggle.innerHTML = originalButtonText;
                    }
                }, 50);
            });
        } else {
            console.error("Translation function 'applyTranslations' not found. Make sure 'translations.js' is loaded correctly before 'app.js'.");
            langToggle.disabled = true; // Disable button if translations can't work
        }
    }
});