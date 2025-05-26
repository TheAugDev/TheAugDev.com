// site-scripts.js for The Augmented Developer Website

document.addEventListener('DOMContentLoaded', function() {
    console.log("TAD Site Scripts Initialized");

    // --- Smooth Scroll for Navigation Links ---
    document.querySelectorAll('.main-nav a[href^="#"], .hero-cta-buttons a[href^="#"], .cta-button-primary[href^="#"], .cta-button-secondary[href^="#"]').forEach(anchor => {
        if (anchor.pathname.replace(/^\//, '') === window.location.pathname.replace(/^\//, '') &&
            anchor.hostname === window.location.hostname) {
            
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = document.querySelector('.site-header') ? document.querySelector('.site-header').offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // --- Dynamic Copyright Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form Submission Logic ---
    const contactForm = document.getElementById('tadContactForm');
    const formStatusDiv = document.getElementById('contactFormStatus');
    // IMPORTANT: Replace this with the ACTUAL Web App URL of your NEW Google Apps Script for the contact form
    const CONTACT_FORM_GAS_URL = 'https://script.google.com/macros/s/AKfycbzGJl_a4NAWdio6kmvG6QBkacFZBcoxEniyCTbcgxEVRBR4PLs8N-76yShskt08FclH/exec'; 

    if (contactForm && formStatusDiv) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            formStatusDiv.textContent = 'Sending message...';
            formStatusDiv.className = 'status-info'; 
            formStatusDiv.style.display = 'block'; // Make sure it's visible

            const submitButton = contactForm.querySelector('.submit-button');
            if(submitButton) submitButton.disabled = true;


            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            fetch(CONTACT_FORM_GAS_URL, {
                method: 'POST',
                body: JSON.stringify(data) 
            })
            .then(response => {
                if (!response.ok) { 
                    return response.json().then(err => { throw new Error(err.message || `Server error: ${response.status}`) });
                }
                return response.json();
            })
            .then(result => {
                if (result.status === 'success') {
                    formStatusDiv.textContent = result.message || 'Message sent successfully!';
                    formStatusDiv.className = 'status-success';
                    contactForm.reset(); 
                } else {
                    formStatusDiv.textContent = result.message || 'An error occurred. Please try again.';
                    formStatusDiv.className = 'status-error';
                }
            })
            .catch(error => {
                console.error('Contact form submission error:', error);
                formStatusDiv.textContent = `Submission failed: ${error.message}. Please try again.`;
                formStatusDiv.className = 'status-error';
            })
            .finally(() => {
                 if(submitButton) submitButton.disabled = false;
            });
        });
    }

    // --- Scroll-triggered animations for sections ---
    const animatedSections = document.querySelectorAll('.content-section, .hero-text, .hero-visual-placeholder'); // Add more selectors if needed
    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // For elements that are initially set to opacity 0 for JS-driven animation
                if(entry.target.classList.contains('hero-text') || entry.target.classList.contains('hero-visual-placeholder')){
                    // These have CSS animations defined already
                } else { // For other .content-section elements
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    animatedSections.forEach(section => {
        // Don't apply initial styles if it's the hero text/visual as they have their own entry animations
        if(!section.classList.contains('hero-text') && !section.classList.contains('hero-visual-placeholder') && !section.classList.contains('page-hero') && section.id !== 'hero'){
            section.style.opacity = "0"; 
            section.style.transform = "translateY(40px)"; 
        }
        observer.observe(section);
    });
});