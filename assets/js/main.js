// Smooth scroll para anchors
document.addEventListener('DOMContentLoaded', function() {
    // Efecto de fade-in para las secciones
    const sections = document.querySelectorAll('section');
    
    const fadeInOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInOnScroll.observe(section);
    });
    
    console.log('Portfolio loaded successfully!');
});
