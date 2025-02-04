// Particle.js configuration
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#4f46e5' },
        shape: { type: 'circle' },
        opacity: {
            value: 0.5,
            random: false,
            animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
        },
        size: {
            value: 3,
            random: true,
            animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
        },
        lineLinked: {
            enable: true,
            distance: 150,
            color: '#4f46e5',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: false,
            straight: false,
            outMode: 'out',
            bounce: false,
        }
    },
    interactivity: {
        detectOn: 'canvas',
        events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
            resize: true
        },
        modes: {
            grab: { distance: 140, lineLinked: { opacity: 1 } },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});

// Typed.js initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Typed.js
    const typed = new Typed('#typed', {
        stringsElement: '#typed-strings',
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
        backDelay: 2000
    });

    // Mobile menu functionality
    const mobileMenuButton = document.querySelector('nav button');
    const mobileMenu = document.querySelector('nav div.md\\:flex');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.glass-card, .tech-icon');
        elements.forEach(element => {
            const position = element.getBoundingClientRect();
            if (position.top < window.innerHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial animation check
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Newsletter form submission
    const newsletterForm = document.querySelector('form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                // Show success message
                const button = newsletterForm.querySelector('button');
                const originalText = button.textContent;
                button.textContent = 'Subscribed!';
                button.classList.add('bg-green-600');
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('bg-green-600');
                    newsletterForm.reset();
                }, 2000);
            }
        });
    }
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('shadow-lg');
        navbar.classList.add('bg-white/80');
        return;
    }
    
    if (currentScroll > lastScroll) {
        // Scrolling down
        navbar.classList.add('-translate-y-full');
        navbar.classList.add('transition');
        navbar.classList.add('duration-300');
    } else {
        // Scrolling up
        navbar.classList.remove('-translate-y-full');
        navbar.classList.add('shadow-lg');
        navbar.classList.add('bg-white/95');
    }
    
    lastScroll = currentScroll;
});
