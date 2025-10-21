// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

// ========== Navigation Toggle ==========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ========== Smooth Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== Counter Animation ==========
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.ceil(target).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.ceil(current).toLocaleString();
        }
    }, 16);
}

// ========== Intersection Observer for Animations ==========
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate stat counters
            if (entry.target.classList.contains('stat-value')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Observe all stat values
document.querySelectorAll('.stat-value').forEach(stat => {
    observer.observe(stat);
});

// ========== Fetch Global Stats ==========
async function fetchGlobalStats() {
    try {
        const response = await fetch(`${API_URL}/stats/global`);
        const data = await response.json();

        if (data.success) {
            const { stats } = data;
            
            // Update hero stats
            const userCount = document.getElementById('userCount');
            const carbonSaved = document.getElementById('carbonSaved');
            const plasticReduced = document.getElementById('plasticReduced');

            if (userCount) animateCounter(userCount, stats.totalUsers || 1250);
            if (carbonSaved) animateCounter(carbonSaved, Math.floor(stats.carbonSaved) || 45680);
            if (plasticReduced) animateCounter(plasticReduced, stats.totalPlasticItems || 15420);
        }
    } catch (error) {
        console.log('Using demo stats - server not connected');
        // Use demo data if server is not running
        const userCount = document.getElementById('userCount');
        const carbonSaved = document.getElementById('carbonSaved');
        const plasticReduced = document.getElementById('plasticReduced');

        if (userCount) animateCounter(userCount, 1250);
        if (carbonSaved) animateCounter(carbonSaved, 45680);
        if (plasticReduced) animateCounter(plasticReduced, 15420);
    }
}

// ========== Navbar Scroll Effect ==========
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
});

// ========== Card Hover Effects ==========
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.borderColor = 'var(--primary-color)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.borderColor = 'transparent';
    });
});

// ========== Initialize on Load ==========
document.addEventListener('DOMContentLoaded', () => {
    fetchGlobalStats();
    
    // Add fade-in animation to elements
    const fadeElements = document.querySelectorAll('.feature-card, .stat-card');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});

// ========== Scroll Reveal Animation ==========
const scrollReveal = () => {
    const elements = document.querySelectorAll('.feature-card, .about-content, .stat-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', scrollReveal);

// ========== Loading Animation ==========
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
