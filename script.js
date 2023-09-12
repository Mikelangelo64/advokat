const vevet = new Vevet.Application({
  tablet: 1199,
  phone: 899,
  prefix: 'v-',
  viewportResizeTimeout: 100,
  easing: [0.25, 0.1, 0.25, 1],
});

vevet.pageLoad.onLoaded(() => {
  //scrollBarInit
  const scrollBarInit = () => {
    let scrollBar;
    if (!vevet.isMobile) {
      scrollBar = new Vevet.ScrollBar({ container: window });
    }

    return scrollBar;
  };

  scrollBarInit();

  //swipers
  const swipersInit = () => {
    const sliders = {};

    const swiperBanner = new Swiper('.slider-banner.swiper', {
      // If we need pagination
      pagination: {
        el: '.banner .banner__slider__controls .slider-banner-pagination',
        clickable: true,
      },

      // Navigation arrows
      navigation: {
        nextEl: '.banner .banner__slider__controls .slider-banner-next',
        prevEl: '.banner .banner__slider__controls .slider-banner-prev',
      },

      slidesPerView: 1,
      spaceBetween: 30,
    });

    const swiperProductThumb = new Swiper('.product-slider-thumb.swiper', {
      slidesPerView: 4,
      spaceBetween: 18,
      freeMode: true,
      watchSlidesProgress: true,

      breakpoints: {
        550: {
          slidesPerView: 5,
          spaceBetween: 24,
        },
      },
    });

    const swiperProduct = new Swiper('.product-slider.swiper', {
      // Navigation arrows
      navigation: {
        nextEl: '.product .product__slider__controls .slider-product-next',
        prevEl: '.product .product__slider__controls .slider-product-prev',
      },

      slidesPerView: 1,
      spaceBetween: 30,
      thumbs: {
        swiper: swiperProductThumb,
      },
    });

    const swiperCatqalog = new Swiper('.catalog-slider.swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      breakpoints: {
        550: {
          slidesPerView: 2,
        },
        900: {
          slidesPerView: 3,
        },
      },
    });

    sliders.banner = swiperBanner;
    sliders.product = swiperProduct;
    sliders.catalog = swiperCatqalog;
    return sliders;
  };

  swipersInit();

  //popups
  const useOutsideClick = (element, callback) => {
    const listener = (event) => {
      if (!element.contains(event.target) && event.which === 1) {
        callback();
      }
    };

    document.addEventListener('mousedown', listener);
  };

  const useOnEscape = (callback) => {
    window.addEventListener('keydown', (evt) => {
      if (evt.keyCode === 27) {
        callback();
      }
    });
  };

  const renderModalAnimation = ({
    progress,
    easing,
    parent,
    overlay,
    scroll,
    additional,
  }) => {
    if (parent) {
      const element = parent;
      element.style.display = `${progress > 0 ? 'flex' : 'none'}`;
      element.style.opacity = `${progress > 0 ? 1 : 0}`;
    }

    if (overlay) {
      const element = overlay;
      element.style.opacity = `${easing}`;
    }

    if (scroll) {
      const element = scroll;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(1 - easing) * 2}rem)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }

    if (additional) {
      const element = additional;
      element.style.opacity = `${easing}`;
      if (parent.classList.contains('popup-menu')) {
        element.style.transform = `translateX(${(1 - easing) * 2}rem)`;
      } else {
        element.style.transform = `translateY(${(1 - easing) * 2}rem)`;
      }
    }
  };

  const makeTimelinePopup = (
    popupParent,
    popupScroll,
    popupOverlay,
    popupAdditional
  ) => {
    if (!popupParent || !popupScroll) {
      return undefined;
    }

    const timeline = new Vevet.Timeline({
      duration: 600,
      easing: [0.25, 0.1, 0.25, 1],
    });
    timeline.addCallback('start', () => {
      if (!timeline.isReversed) {
        document.querySelector('html').classList.add('lock');
        document.querySelector('body').classList.add('lock');
        popupParent.classList.add('_opened');
      }
    });

    timeline.addCallback('progress', ({ progress, easing }) => {
      renderModalAnimation({
        parent: popupParent,
        scroll: popupScroll,
        overlay: popupOverlay,
        additional: popupAdditional,
        progress,
        easing,
      });
    });

    timeline.addCallback('end', () => {
      if (timeline.isReversed) {
        document.querySelector('html').classList.remove('lock');
        document.querySelector('body').classList.remove('lock');
        popupParent.classList.remove('_opened');
      }
    });

    return timeline;
  };

  const popupsInit = () => {
    const dataArr = [];
    const popupArr = document.querySelectorAll('.popup');

    if (popupArr.length === 0) {
      return [];
    }

    popupArr.forEach((item) => {
      const popup = item;
      if (!popup) {
        return;
      }

      const popupName = popup.dataset.popupname;
      const popupParent = popup;
      const popupScroll = popup.querySelector('.popup__scroll');
      const popupOverlay = popup.querySelector('.popup__overlay');
      const popupWrapper = popup.querySelector('.popup__wrapper');
      const popupAdditional = popup.querySelector('.popup__additional');

      if (
        (!popupName, !popupParent, !popupScroll, !popupOverlay, !popupWrapper)
      ) {
        return;
      }

      const openBtns = document.querySelectorAll(`[data-popup="${popupName}"]`);
      const isThanksPopup = popupName === '_popup-thanks';
      // console.log(openBtns);
      const closeBtns = popup.querySelectorAll('.popup__close, .popup__back');
      const timeline = makeTimelinePopup(
        popupParent,
        popupScroll,
        popupOverlay,
        popupAdditional
      );

      if ((openBtns.length === 0 && !isThanksPopup) || closeBtns.length === 0) {
        return;
      }

      openBtns.forEach((openBtn) => {
        openBtn.addEventListener('click', (evt) => {
          evt.preventDefault();
          dataArr.forEach(
            ({ popup: popupActive, timeline: timelineActive }) => {
              if (
                popupActive.classList.contains('_opened') &&
                popupActive.dataset.popupname !== popupName
              ) {
                timelineActive.reverse();
              }
            }
          );
          timeline.play();
        });
      });

      closeBtns.forEach((closeBtn) => {
        closeBtn.addEventListener('click', () => {
          timeline.reverse();
        });
      });

      useOutsideClick(popupWrapper, () => {
        if (popup.classList.contains('_opened')) {
          timeline.reverse();
          document.querySelector('html').classList.remove('lock');
          document.querySelector('body').classList.remove('lock');
        }
      });

      dataArr.push({
        popup,
        timeline,
        openBtns,
        closeBtns,
        isThanksPopup,
      });
    });

    useOnEscape(() => {
      dataArr.forEach(({ popup, timeline }) => {
        if (popup.classList.contains('_opened')) {
          timeline.reverse();
          document.querySelector('html').classList.remove('lock');
          document.querySelector('body').classList.remove('lock');
        }
      });
    });

    return dataArr;
  };

  const popups = popupsInit();

  //anchors
  const closePopupsHandler = (popupArr) => {
    if (popupArr.length === 0) {
      return;
    }

    popupArr.forEach(({ timeline, openBtns }) => {
      if (timeline && timeline.progress > 0) {
        timeline.reverse();

        openBtns.forEach((openBtn) => {
          openBtn.classList.remove('_opened');
        });
      }
    });
  };

  const scrollHandler = (link, headerHeight, popupArr) => {
    const sectionName = link.dataset.goto;
    if (!sectionName) {
      return;
    }

    const section = document.querySelector(`${sectionName}`);
    if (!section) {
      return;
    }

    link.addEventListener('click', (evt) => {
      evt.preventDefault();

      closePopupsHandler(popupArr);

      window.scrollTo({
        top: section.offsetTop - headerHeight,
        behavior: 'smooth',
      });
    });
  };

  const anchorsInit = (headerHeight, popupArr) => {
    const links = Array.from(document.querySelectorAll('.anchor'));

    if (links.length === 0) {
      return;
    }

    links.forEach((link) => {
      scrollHandler(link, headerHeight, popupArr);
    });
  };

  anchorsInit(0, popups);

  //wpc7
  const formArr = document.querySelectorAll('form');
  if (formArr.length !== 0) {
    // formArr.forEach((form) => {
    //   form.addEventListener('submit', (evt) => {
    //     evt.preventDefault();
    //     popups.forEach(({ timeline, isThanksPopup }) => {
    //       if (isThanksPopup) {
    //         timeline.play();
    //       } else {
    //         timeline.reverse();
    //       }
    //     });
    //   });
    // });

    document.addEventListener(
      'wpcf7mailsent',
      function () {
        popups.forEach(({ timeline, isThanksPopup }) => {
          if (isThanksPopup) {
            timeline.play();
          } else {
            timeline.reverse();
          }
        });
      },
      false
    );
  }
});
