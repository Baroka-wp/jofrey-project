function handleIndexSearch() {
    const city = document.getElementById('location-input').value;
    const type = document.getElementById('type-input').value;
    const maxPrice = document.getElementById('max-price-input').value;

    const criteria = { city, type, maxPrice };
    localStorage.setItem('searchCriteria', JSON.stringify(criteria));

    window.location.href = 'http://127.0.0.1:5500/jofrey/src/property-list/property-list.html';
}



function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');
    navLinks.classList.toggle('show');
    
    if (menuIcon.classList.contains('fa-bars')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.testimonial-card');
    const slider = document.querySelector('.testimonial-slider');
    const slideWidth = slides[0].clientWidth + parseInt(getComputedStyle(slides[0]).marginRight, 10);
    
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    slider.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', () => {   
    const criteria = JSON.parse(localStorage.getItem('searchCriteria'));
    if (criteria) {
        document.getElementById('location-input').value = criteria.city || '';
        document.getElementById('type-input').value = criteria.type || '';
        document.getElementById('max-price').value = criteria.priceMax || '';

        handleSearch();
    } 
    setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
});


function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
