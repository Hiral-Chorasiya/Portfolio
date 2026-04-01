// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================================
       CUSTOM CURSOR logic
       ========================================================================= */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorGlow = document.querySelector('.cursor-glow');

    // Check if device supports hover
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

    if (!isTouchDevice) {
        let mouseX = 0;
        let mouseY = 0;
        let glowX = 0;
        let glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instantly move the dot
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        // Smoothly follow with the glow
        const animateCursor = () => {
            glowX += (mouseX - glowX) * 0.15;
            glowY += (mouseY - glowY) * 0.15;
            cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Add hover effects for interactive elements
        const interactives = document.querySelectorAll('a, button, input, textarea, .project-card, .service-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    } else {
        // Hide custom cursor on mobile
        cursorDot.style.display = 'none';
        cursorGlow.style.display = 'none';
    }

    /* =========================================================================
       TILT EFFECT (Vanilla JS instead of relying on big libraries)
       ========================================================================= */
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s linear';
        });
    });

    /* =========================================================================
       TYPEWRITER EFFECT
       ========================================================================= */
    const typeTarget = document.querySelector('.typewriter-text');
    if (typeTarget) {
        const words = ["Web Developer", "SEO Specialist", "WordPress Developer"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                typeTarget.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typeTarget.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = 100;
            if (isDeleting) typeSpeed /= 2;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before typing next word
            }

            setTimeout(type, typeSpeed);
        }

        // Start typing effect after the initial GSAP reveal
        setTimeout(type, 1500);
    }

    /* =========================================================================
       THREE.JS SETUP (Background WebGL)
       ========================================================================= */
    initThreeJS();

    /* =========================================================================
       GSAP ANIMATIONS & SCROLLTRIGGER
       ========================================================================= */
    initGSAP();

    /* =========================================================================
       Navbar Scroll Effect
       ========================================================================= */
    const nav = document.querySelector('.premium-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
});

/* =========================================================================
   THREE.JS INITIALIZATION
   ========================================================================= */
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Group for all floating objects to allow parallax control
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // 1. PARTICLES //
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100; // Spread across -50 to 50
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create soft glowing material for particles
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x00ffd5,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    sceneGroup.add(particlesMesh);

    // 2. CENTRAL GEOMETRY (Icosahedron) //
    const polyGeo = new THREE.IcosahedronGeometry(8, 1);
    const polyMat = new THREE.MeshBasicMaterial({
        color: 0x4f8cff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const polyMesh = new THREE.Mesh(polyGeo, polyMat);
    sceneGroup.add(polyMesh);

    // Geometric rings
    const ringGeo = new THREE.TorusGeometry(12, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffd5, transparent: true, opacity: 0.2 });
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh1.rotation.x = Math.PI / 2;
    sceneGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeo, ringMat);
    ringMesh2.rotation.y = Math.PI / 2;
    sceneGroup.add(ringMesh2);

    // Mouse Parallax Logic
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Rotate Geometries
        polyMesh.rotation.x += 0.001;
        polyMesh.rotation.y += 0.002;

        ringMesh1.rotation.y += 0.001;
        ringMesh1.rotation.z += 0.0005;

        ringMesh2.rotation.x += 0.001;
        ringMesh2.rotation.z += 0.0005;

        // Animate particles slowly upwards
        particlesMesh.rotation.y = elapsedTime * 0.05;

        // Parallax easing
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        sceneGroup.rotation.y += 0.05 * (targetX - sceneGroup.rotation.y);
        sceneGroup.rotation.x += 0.05 * (targetY - sceneGroup.rotation.x);

        renderer.render(scene, camera);
    }

    animate();
}

/* =========================================================================
   GSAP & SCROLLTRIGGER INITIALIZATION
   ========================================================================= */
function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Reveal Animations
    gsap.fromTo(".hero-title",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
    );

    gsap.fromTo(".hero-subtext",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
    );

    gsap.fromTo(".hero-cta a",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)", stagger: 0.2, delay: 0.8 }
    );

    // 2. Section Reveals
    const sections = ['.about-section', '.experience-section', '.key-skills-section', '.projects-section', '.services-section', '.contact-section'];

    sections.forEach(sec => {
        gsap.fromTo(sec,
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
                scrollTrigger: {
                    trigger: sec,
                    start: "top 80%",
                    once: true
                }
            }
        );
    });

    // 3. Skill Bars Fill
    ScrollTrigger.create({
        trigger: ".skills-wrapper",
        start: "top 85%",
        once: true,
        onEnter: () => {
            const bars = document.querySelectorAll('.skill-bar-fill');
            bars.forEach((bar, i) => {
                const width = bar.getAttribute('data-width');
                gsap.to(bar, { width: width, duration: 1.5, ease: "power2.out", delay: i * 0.2 });
            });
        }
    });

    // 4. Testimonials Horizontal Scroll Integration
    const track = document.querySelector('.testimonial-track');
    if (track) {
        // We will just slide the track sideways to simulate carousel or side scroll
        const scrollWidth = track.scrollWidth - window.innerWidth + 100;

        gsap.to(track, {
            x: -scrollWidth,
            ease: "none",
            scrollTrigger: {
                trigger: ".testimonials-section",
                pin: true,
                scrub: 1,
                end: () => "+=" + track.offsetWidth
            }
        });
    }

    // 5. Project Grid Stagger
    ScrollTrigger.create({
        trigger: ".project-grid",
        start: "top 80%",
        once: true,
        onEnter: () => {
            gsap.fromTo(".project-item",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" }
            );
        }
    });
}
