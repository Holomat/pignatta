// script.js - Portfolio Federico Pignatta
document.addEventListener('DOMContentLoaded', () => {
  
  // ========================================
  // 1. DETECCIÓN DE DISPOSITIVO MÓVIL
  // ========================================
  const isMobile = window.matchMedia('(max-width:600px)').matches;
  
  
  // ========================================
  // 2. RELOJ EN TIEMPO REAL (FOOTER)
  // ========================================
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const clock = document.getElementById('clock');
    if (clock) {
      clock.textContent = `[${hh}:${mm}:${ss}]`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);
  
  
  // ========================================
  // 3. LIGHTBOX PARA DESKTOP
  // ========================================
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbCarousel = lightbox.querySelector('.lb-carousel');
    const lbPrev = lightbox.querySelector('.lb-nav.prev');
    const lbNext = lightbox.querySelector('.lb-nav.next');
    const lbClose = lightbox.querySelector('.close');
    let lbIdx = 0;
    let lbCount = 0;

    // Función para abrir lightbox
    function openLightbox(urls, startIdx = 0) {
      if (isMobile) return;
      lbCarousel.innerHTML = '';
      const N = urls.length;
      
      // Crear slide
      const makeSlide = src => {
        const d = document.createElement('div');
        d.className = 'lb-slide';
        d.innerHTML = `<img src="${src}">`;
        return d;
      };
      
      // Agregar slides con duplicados para loop infinito
      lbCarousel.appendChild(makeSlide(urls[N - 1]));
      urls.forEach(src => lbCarousel.appendChild(makeSlide(src)));
      lbCarousel.appendChild(makeSlide(urls[0]));
      
      lbCount = N;
      lbIdx = startIdx + 1;
      lbCarousel.style.transition = 'none';
      lbCarousel.style.transform = `translateX(-${100 * lbIdx}%)`;
      lightbox.classList.add('open');
    }

    // Función para mover slides del lightbox
    function lbMove(to, animate = true) {
      lbCarousel.style.transition = animate ? 'transform .7s ease-in-out' : 'none';
      lbIdx = to;
      lbCarousel.style.transform = `translateX(-${100 * lbIdx}%)`;
    }

    // Event listeners del lightbox
    lbCarousel.addEventListener('transitionend', () => {
      if (lbIdx === 0) {
        lbMove(lbCount, false);
      } else if (lbIdx === lbCount + 1) {
        lbMove(1, false);
      }
    });
    
    lbPrev.onclick = () => lbMove(lbIdx - 1);
    lbNext.onclick = () => lbMove(lbIdx + 1);
    lbClose.onclick = e => {
      e.preventDefault();
      lightbox.classList.remove('open');
    };

    // Exponer función globalmente para uso externo
    window.openLightbox = openLightbox;
  }

  
  // ========================================
  // 4. CARRUSELES DE PROYECTOS
  // ========================================
  document.querySelectorAll('.bounce-carousel, .fade-carousel').forEach(wrapper => {
    const carousel = wrapper.querySelector('.carousel');
    if (!carousel) return;

    // ---- VERSIÓN MÓVIL ----
    if (isMobile) {
      const slides = Array.from(carousel.querySelectorAll('.slide'));
      let idx = 0;
      
      // Mostrar solo primera slide inicialmente
      slides.forEach((s, i) => {
        s.style.display = (i === 0) ? 'block' : 'none';
      });

      // Botones de navegación móvil
      const prevBtn = wrapper.querySelector('.carousel-nav.prev');
      const nextBtn = wrapper.querySelector('.carousel-nav.next');
      
      if (prevBtn) {
        prevBtn.onclick = () => {
          if (idx > 0) {
            slides[idx].style.display = 'none';
            idx -= 1;
            slides[idx].style.display = 'block';
          }
        };
      }
      
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (idx < slides.length - 1) {
            slides[idx].style.display = 'none';
            idx += 1;
            slides[idx].style.display = 'block';
          }
        };
      }

      // Gestos táctiles (swipe)
      let startX = 0;
      let dx = 0;
      let moving = false;
      
      carousel.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          moving = true;
        }
      });
      
      carousel.addEventListener('touchmove', e => {
        if (!moving) return;
        dx = e.touches[0].clientX - startX;
      }, { passive: true });
      
      carousel.addEventListener('touchend', () => {
        moving = false;
        if (dx > 70 && idx > 0) {
          slides[idx].style.display = 'none';
          idx -= 1;
          slides[idx].style.display = 'block';
        } else if (dx < -70 && idx < slides.length - 1) {
          slides[idx].style.display = 'none';
          idx += 1;
          slides[idx].style.display = 'block';
        }
        dx = 0;
      });
    }
    
    // ---- VERSIÓN DESKTOP ----
    else {
      
      // CARRUSEL TIPO BOUNCE
      if (wrapper.classList.contains('bounce-carousel')) {
        let slides = Array.from(carousel.children);
        let N = slides.length;
        
        // Agregar slides duplicadas para loop infinito
        if (carousel.children.length === N) {
          carousel.appendChild(slides[0].cloneNode(true));
          carousel.insertBefore(slides[N - 1].cloneNode(true), carousel.firstChild);
          slides = Array.from(carousel.children);
        }
        
        let idx = 1;
        let dir = 1;
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(-${100 * idx}%)`;
        
        // Función para avanzar/retroceder
        function step() {
          idx += dir;
          if (idx > N) {
            dir = -1;
            idx = N - 1;
          } else if (idx < 1) {
            dir = 1;
            idx = 2;
          }
          carousel.style.transition = 'transform 1s cubic-bezier(0.25,0.1,0.25,1)';
          carousel.style.transform = `translateX(-${100 * idx}%)`;
        }
        
        // Auto-play
        let auto = setInterval(step, 3000);
        
        // Pausar en hover
        wrapper.addEventListener('mouseenter', () => clearInterval(auto));
        wrapper.addEventListener('mouseleave', () => auto = setInterval(step, 3000));
        
        // Botones de navegación
        wrapper.querySelector('.carousel-nav.prev').onclick = () => {
          clearInterval(auto);
          dir = -1;
          step();
        };
        wrapper.querySelector('.carousel-nav.next').onclick = () => {
          clearInterval(auto);
          dir = 1;
          step();
        };

        // Abrir lightbox al hacer click en slide
        Array.from(carousel.querySelectorAll('.slide')).forEach((sl, i) => {
          sl.onclick = () => {
            const imageUrls = Array.from(carousel.querySelectorAll('.slide'))
              .map(s => s.querySelector('img').src);
            window.openLightbox(imageUrls, i);
          };
        });
      }
      
      // CARRUSEL TIPO FADE
      if (wrapper.classList.contains('fade-carousel')) {
        const slides = Array.from(carousel.children);
        let idx = 0;
        
        // Activar primera slide
        slides.forEach(s => s.classList.remove('active'));
        slides[0].classList.add('active');
        
        // Función para cambiar slide con fade
        function stepFade() {
          slides[idx].classList.remove('active');
          idx = (idx + 1) % slides.length;
          slides[idx].classList.add('active');
        }
        
        // Auto-play fade
        let autoFade = setInterval(stepFade, 3000);
        
        // Pausar en hover
        wrapper.addEventListener('mouseenter', () => clearInterval(autoFade));
        wrapper.addEventListener('mouseleave', () => autoFade = setInterval(stepFade, 3000));
        
        // Botones de navegación fade
        wrapper.querySelector('.carousel-nav.prev').onclick = () => {
          clearInterval(autoFade);
          slides[idx].classList.remove('active');
          idx = (idx - 1 + slides.length) % slides.length;
          slides[idx].classList.add('active');
        };
        
        wrapper.querySelector('.carousel-nav.next').onclick = () => {
          clearInterval(autoFade);
          slides[idx].classList.remove('active');
          idx = (idx + 1) % slides.length;
          slides[idx].classList.add('active');
        };
        
        // Lightbox para slides fade
        slides.forEach((sl, i) => {
          sl.onclick = () => {
            const imageUrls = slides.map(s => s.querySelector('img').src);
            window.openLightbox(imageUrls, i);
          };
        });
      }
    }
  });

  
  // ========================================
  // 5. IMÁGENES INDIVIDUALES PARA LIGHTBOX
  // ========================================
  document.querySelectorAll('.single-img').forEach(img => {
    if (!isMobile) {
      img.addEventListener('click', () => {
        window.openLightbox([img.src], 0);
      });
    }
  });
  
});


// ========================================
// 6. GALERÍA PRINCIPAL MÓVIL
// ========================================
document.addEventListener("DOMContentLoaded", function() {
  
  // Array de imágenes con sus descripciones
  const images = [
    {
      src: "https://i.imgur.com/GlaO5F9.jpeg",
      caption: "Holomate es un controlador MIDI portátil y experimental. Lanzado como una edición limitada de 50 unidades, es compatible con Holomate Play y Ableton Live."
    },
    {
      src: "https://i.imgur.com/xtpM5d4.jpeg",
      caption: "Holomate es un controlador MIDI portátil y experimental. Lanzado como una edición limitada de 50 unidades, es compatible con Holomate Play y Ableton Live."
    },
    {
      src: "https://i.imgur.com/HhU3bUH.jpeg",
      caption: "Holomate es un controlador MIDI portátil y experimental. Lanzado como una edición limitada de 50 unidades, es compatible con Holomate Play y Ableton Live."
    }
  ];
  
  // Elementos del DOM
  const imgTag = document.querySelector(".gallery-img");
  const captionTag = document.querySelector(".gallery-caption");
  const prevBtn = document.querySelector(".gallery-arrow.left");
  const nextBtn = document.querySelector(".gallery-arrow.right");
  
  let idx = 0;
  
  // Función para mostrar imagen y descripción
  function show(n) {
    imgTag.src = images[n].src;
    imgTag.alt = images[n].caption;
    captionTag.textContent = images[n].caption;
  }
  
  // Mostrar primera imagen
  show(idx);
  
  // Event listeners para navegación
  prevBtn.onclick = () => {
    idx = (idx - 1 + images.length) % images.length;
    show(idx);
  };
  
  nextBtn.onclick = () => {
    idx = (idx + 1) % images.length;
    show(idx);
  };
  
});