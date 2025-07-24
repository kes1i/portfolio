document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    implementSmoothScroll();
    highlightActiveNavOnScroll();
    animateProgressBars();
    
    // Typing effect
    const heroText = document.querySelector('.hero h1');
    if (heroText) {
        const baseText = "Hello, I'm ";
        const highlightText = "Kunal";
        heroText.innerHTML = ""; 
        let index = 0;
        const fullText = baseText + highlightText;
        
        function type() {
            if (index < fullText.length) {
                if (index < baseText.length) {
                    heroText.innerHTML = fullText.substring(0, index + 1) + '<span class="highlight-text"></span>';
                } else {
                    heroText.innerHTML = baseText + '<span class="highlight-text">' + fullText.substring(baseText.length, index + 1) + '</span>';
                }
                index++;
                setTimeout(type, 100);
            }
        }
        type();
    }
});


// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.animated-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.classList.contains('html-progress') ? '90%' : 
                                          entry.target.classList.contains('css-progress') ? '50%' : 
                                          entry.target.classList.contains('js-progress') ? '30%' : 
                                          entry.target.classList.contains('c-progress') ? '50%' : 
                                          entry.target.classList.contains('python-progress') ? '40%' : 
                                          entry.target.classList.contains('sql-progress') ? '5%' : '0%';
                entry.target.style.transition = 'width 1.5s ease-in-out';
            }
        });
    }, { threshold: 0.2 });
    
    progressBars.forEach(bar => {
        bar.style.width = '0%';
        observer.observe(bar);
    });
}

// Smooth scrolling for navigation
function implementSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Highlight active nav item on scroll
function highlightActiveNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 100) {
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
}
