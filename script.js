// script.js
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.matchMedia('(max-width:600px)').matches;

  // 1) Footer clock
  function updateClock() {
    const now = new Date(),
          hh  = String(now.getHours()).padStart(2,'0'),
          mm  = String(now.getMinutes()).padStart(2,'0'),
          ss  = String(now.getSeconds()).padStart(2,'0');
    const clock = document.getElementById('clock');
    if (clock) clock.textContent = `[${hh}:${mm}:${ss}]`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // 2) Lightbox (solo desktop)
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbCarousel = lightbox.querySelector('.lb-carousel'),
          lbPrev     = lightbox.querySelector('.lb-nav.prev'),
          lbNext     = lightbox.querySelector('.lb-nav.next'),
          lbClose    = lightbox.querySelector('.close');
    let lbIdx = 0, lbCount = 0;

    function openLightbox(urls, startIdx = 0) {
      if (isMobile) return;
      lbCarousel.innerHTML = '';
      const N = urls.length;
      const makeSlide = src => {
        const d = document.createElement('div');
        d.className = 'lb-slide';
        d.innerHTML = `<img src="${src}">`;
        return d;
      };
      lbCarousel.appendChild(makeSlide(urls[N-1]));
      urls.forEach(src => lbCarousel.appendChild(makeSlide(src)));
      lbCarousel.appendChild(makeSlide(urls[0]));
      lbCount = N;
      lbIdx = startIdx + 1;
      lbCarousel.style.transition = 'none';
      lbCarousel.style.transform  = `translateX(-${100*lbIdx}%)`;
      lightbox.classList.add('open');
    }

    function lbMove(to, animate = true) {
      lbCarousel.style.transition = animate ? 'transform .7s ease-in-out' : 'none';
      lbIdx = to;
      lbCarousel.style.transform = `translateX(-${100*lbIdx}%)`;
    }

    lbCarousel.addEventListener('transitionend', () => {
      if (lbIdx === 0)          lbMove(lbCount, false);
      else if (lbIdx === lbCount + 1) lbMove(1, false);
    });
    lbPrev.onclick = () => lbMove(lbIdx - 1);
    lbNext.onclick = () => lbMove(lbIdx + 1);
    lbClose.onclick = e => {
      e.preventDefault();
      lightbox.classList.remove('open');
    };

    // Exponer para debug
    window.openLightbox = openLightbox;
  }

  // 3) Inicialización de carousels (desktop + mobile)
  document.querySelectorAll('.bounce-carousel, .fade-carousel').forEach(wrapper => {
    const carousel = wrapper.querySelector('.carousel');
    if (!carousel) return;

    // ---- MÓVIL: swipe y flechas ----
    if (isMobile) {
      const slides = Array.from(carousel.querySelectorAll('.slide'));
      let idx = 0;
      slides.forEach((s, i) => s.style.display = (i===0) ? 'block' : 'none');

      const prevBtn = wrapper.querySelector('.carousel-nav.prev');
      const nextBtn = wrapper.querySelector('.carousel-nav.next');
      prevBtn && (prevBtn.onclick = () => {
        if (idx > 0) {
          slides[idx].style.display = 'none';
          idx -= 1;
          slides[idx].style.display = 'block';
        }
      });
      nextBtn && (nextBtn.onclick = () => {
        if (idx < slides.length-1) {
          slides[idx].style.display = 'none';
          idx += 1;
          slides[idx].style.display = 'block';
        }
      });

      let startX=0, dx=0, moving=false;
      carousel.addEventListener('touchstart', e => {
        if (e.touches.length===1) { startX=e.touches[0].clientX; moving=true; }
      });
      carousel.addEventListener('touchmove', e => {
        if (!moving) return;
        dx = e.touches[0].clientX - startX;
      }, {passive:true});
      carousel.addEventListener('touchend', () => {
        moving=false;
        if (dx>70 && idx>0) {
          slides[idx].style.display='none'; idx-=1; slides[idx].style.display='block';
        } else if (dx<-70 && idx<slides.length-1) {
          slides[idx].style.display='none'; idx+=1; slides[idx].style.display='block';
        }
        dx=0;
      });
    }
    // ---- DESKTOP: bounce y fade ----
    else {
      // Bounce
      if (wrapper.classList.contains('bounce-carousel')) {
        let slides = Array.from(carousel.children), N=slides.length;
        if (carousel.children.length===N) {
          carousel.appendChild(slides[0].cloneNode(true));
          carousel.insertBefore(slides[N-1].cloneNode(true), carousel.firstChild);
          slides = Array.from(carousel.children);
        }
        let idx=1, dir=1;
        carousel.style.transition='none';
        carousel.style.transform=`translateX(-${100*idx}%)`;
        function step() {
          idx+=dir;
          if(idx> N){dir=-1;idx=N-1;}
          else if(idx<1){dir=1;idx=2;}
          carousel.style.transition='transform 1s cubic-bezier(0.25,0.1,0.25,1)';
          carousel.style.transform=`translateX(-${100*idx}%)`;
        }
        let auto=setInterval(step,3000);
        wrapper.addEventListener('mouseenter',()=>clearInterval(auto));
        wrapper.addEventListener('mouseleave',()=>auto=setInterval(step,3000));
        wrapper.querySelector('.carousel-nav.prev').onclick=()=>{clearInterval(auto);dir=-1;step();};
        wrapper.querySelector('.carousel-nav.next').onclick=()=>{clearInterval(auto);dir=1;step();};

        // Lightbox
        Array.from(carousel.querySelectorAll('.slide')).forEach((sl,i)=>
          sl.onclick=()=>window.openLightbox(
            Array.from(carousel.querySelectorAll('.slide')).map(s=>s.querySelector('img').src),
            i
          )
        );
      }
      // Fade
      if (wrapper.classList.contains('fade-carousel')) {
        const slides = Array.from(carousel.children);
        let idx=0;
        slides.forEach(s=>s.classList.remove('active'));
        slides[0].classList.add('active');
        function stepFade() {
          slides[idx].classList.remove('active');
          idx=(idx+1)%slides.length;
          slides[idx].classList.add('active');
        }
        let autoFade=setInterval(stepFade,3000);
        wrapper.addEventListener('mouseenter',()=>clearInterval(autoFade));
        wrapper.addEventListener('mouseleave',()=>autoFade=setInterval(stepFade,3000));
        wrapper.querySelector('.carousel-nav.prev').onclick=()=>{
          clearInterval(autoFade);
          slides[idx].classList.remove('active');
          idx=(idx-1+slides.length)%slides.length;
          slides[idx].classList.add('active');
        };
        wrapper.querySelector('.carousel-nav.next').onclick=()=>{
          clearInterval(autoFade);
          slides[idx].classList.remove('active');
          idx=(idx+1)%slides.length;
          slides[idx].classList.add('active');
        };
        slides.forEach((sl,i)=>
          sl.onclick=()=>window.openLightbox(slides.map(s=>s.querySelector('img').src),i)
        );
      }
    }
  });

  // 4) Single‑image lightbox (desktop)
  document.querySelectorAll('.single-img').forEach(img=>{
    if(!isMobile) img.addEventListener('click',()=>window.openLightbox([img.src],0));
  });
});

// 5) Galería única mobile
document.addEventListener("DOMContentLoaded", function(){
  const images = [
    {src:"https://i.imgur.com/Z9bt17d.jpeg", caption:"Holomate – diseño y prototipo de interfaz midi de bolsillo (2024)"},
    {src:"https://i.imgur.com/RLKjpin.jpeg", caption:"Vista lateral del prototipo y circuito"},
    {src:"https://i.imgur.com/Z9bt17d.jpeg", caption:"Pruebas de interacción: diseño de experiencia, hardware y software"}
  ];
  const imgTag      = document.querySelector(".gallery-img");
  const captionTag  = document.querySelector(".gallery-caption");
  const prevBtn     = document.querySelector(".gallery-arrow.left");
  const nextBtn     = document.querySelector(".gallery-arrow.right");
  let idx = 0;
  function show(n){
    imgTag.src = images[n].src;
    imgTag.alt = images[n].caption;
    captionTag.textContent = images[n].caption;
  }
  show(idx);
  prevBtn.onclick = ()=>{ idx = (idx-1+images.length)%images.length; show(idx); };
  nextBtn.onclick = ()=>{ idx = (idx+1)%images.length; show(idx); };
});
