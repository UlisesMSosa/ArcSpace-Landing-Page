document.addEventListener('DOMContentLoaded', () => {

    // ----- PARTICLES ANIMATION -----
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let sparkles = [];
    let animationId;
    let mouseX = -1000;
    let mouseY = -1000;
    let frameCount = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.03 + 0.005;
            this.angle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.shape = Math.random() > 0.7 ? 'star' : 'circle';
            this.armLength = this.size * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += this.pulseSpeed;
            this.angle += this.rotationSpeed;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x -= dx * force * 0.015;
                this.y -= dy * force * 0.015;
            }
        }

        draw() {
            const pulseOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
            const scale = 0.8 + 0.2 * Math.sin(this.pulse);

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(scale, scale);

            if (this.shape === 'star') {
                this.drawStar(pulseOpacity);
            } else {
                this.drawCircle(pulseOpacity);
            }

            ctx.restore();
        }

        drawCircle(opacity) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(237, 29, 36, ${opacity * 0.5})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
            ctx.fill();
        }

        drawStar(opacity) {
            const spikes = 4;
            const outerR = this.size * 1.5;
            const innerR = this.size * 0.5;
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / spikes;

            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
                const x1 = Math.cos(rot) * outerR;
                const y1 = Math.sin(rot) * outerR;
                ctx.lineTo(x1, y1);
                rot += step;

                const x2 = Math.cos(rot) * innerR;
                const y2 = Math.sin(rot) * innerR;
                ctx.lineTo(x2, y2);
                rot += step;
            }
            ctx.closePath();
            ctx.fillStyle = `rgba(255, 215, 0, ${opacity * 0.6})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(237, 29, 36, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    class Sparkle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.02;
            this.size = Math.random() * 3 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.life -= this.decay;
        }

        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${this.life * 0.8})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.6})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 120);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function createSparkleBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            sparkles.push(new Sparkle(x, y));
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(237, 29, 36, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frameCount++;

        if (frameCount % 120 === 0) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            createSparkleBurst(x, y);
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        sparkles = sparkles.filter(s => s.life > 0);
        sparkles.forEach(s => {
            s.update();
            s.draw();
        });

        connectParticles();
        animationId = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    });

    document.addEventListener('touchend', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    document.addEventListener('click', (e) => {
        createSparkleBurst(e.clientX, e.clientY);
    });

    initParticles();
    animateParticles();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            initParticles();
        }, 300);
    });

    // ----- NAVBAR SCROLL -----
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ----- MOBILE NAV TOGGLE -----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // ----- SCROLL REVEAL -----
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ----- CAROUSEL -----
    const track = document.getElementById('carouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    let currentIndex = 0;
    const totalSlides = slides.length;

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.dot');

    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        goToSlide(currentIndex);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    let autoplayInterval = setInterval(nextSlide, 4000);

    const carouselContainer = document.querySelector('.carousel-comic-frame');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(nextSlide, 4000);
        });

        carouselContainer.addEventListener('touchstart', () => {
            clearInterval(autoplayInterval);
        });

        carouselContainer.addEventListener('touchend', () => {
            autoplayInterval = setInterval(nextSlide, 4000);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});