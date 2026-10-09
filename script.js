/* =========================================
   Mobile Navigation
========================================= */

(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');

    if (!toggle || !nav) {
        return;
    }

    function setMenuState(isOpen) {
        nav.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', function () {
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';

        setMenuState(!isOpen);
    });

    nav.addEventListener('click', function (event) {
        var link = event.target.closest('a');

        if (link) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });
})();


/* =========================================
   Count-Up Animation
========================================= */

(function () {
    var counters = document.querySelectorAll('[data-count]');

    if (!counters.length) {
        return;
    }

    var reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    function animateCounter(element) {
        var target = parseInt(
            element.getAttribute('data-count'),
            10
        );

        var suffix = element.getAttribute('data-suffix') || '';
        var duration = 1800;
        var startTime = null;

        function update(timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }

            var progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            var easedProgress =
                1 - Math.pow(1 - progress, 3);

            element.textContent =
                Math.round(target * easedProgress) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        element.textContent = '0' + suffix;

        requestAnimationFrame(update);
    }

    if (
        reduceMotion ||
        !('IntersectionObserver' in window)
    ) {
        return;
    }

    var observer = new IntersectionObserver(
        function (entries, observerInstance) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observerInstance.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.6
        }
    );

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
})();


/* =========================================
   Selected Work
   Filter Tabs + Mobile Slick Slider
========================================= */

(function () {
    var tabs = document.querySelectorAll('.work-tab');
    var grid = document.querySelector('.work-grid');
    var cards = document.querySelectorAll('.work-card');

    if (!tabs.length || !grid || !cards.length) {
        return;
    }

    var mobileQuery = window.matchMedia(
        '(max-width: 768px)'
    );

    function initSlider() {
        if (!mobileQuery.matches) {
            return;
        }

        if (!$(grid).hasClass('slick-initialized')) {
            $(grid).slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
                infinite: false,
                adaptiveHeight: true,

                prevArrow:
                    '<button type="button" class="work-slider-prev" aria-label="Previous">←</button>',

                nextArrow:
                    '<button type="button" class="work-slider-next" aria-label="Next">→</button>'
            });
        }
    }

    function destroySlider() {
        if ($(grid).hasClass('slick-initialized')) {
            $(grid).slick('unslick');
        }
    }

    function applyFilter(filter) {
        destroySlider();

        cards.forEach(function (card) {
            var category =
                card.getAttribute('data-category') || '';

            var categories = category.split(' ');

            var shouldShow =
                filter === 'all' ||
                categories.indexOf(filter) !== -1;

            card.hidden = !shouldShow;
        });

        initSlider();
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var filter =
                tab.getAttribute('data-filter');

            tabs.forEach(function (item) {
                var isActive = item === tab;

                item.classList.toggle(
                    'is-active',
                    isActive
                );

                item.setAttribute(
                    'aria-pressed',
                    String(isActive)
                );
            });

            applyFilter(filter);
        });
    });

    cards.forEach(function (card) {
        card.addEventListener('click', function (event) {
            if (card.getAttribute('href') === '#') {
                event.preventDefault();
            }
        });
    });

    initSlider();

    mobileQuery.addEventListener(
        'change',
        function () {
            if (mobileQuery.matches) {
                initSlider();
            } else {
                destroySlider();
            }
        }
    );
})();


/* =========================================
   Reviews Masonry (jQuery)
========================================= */

$(function () {
    var $grid = $('.reviews-masonry');

    if (!$grid.length) {
        return;
    }

    var $cards = $grid.children('.masonry-card');
    var currentCols = 0;
    var resizeTimer;

    function getColumnCount() {
        var width = $(window).width();

        if (width > 1200) {
            return 4;
        }

        if (width > 992) {
            return 3;
        }

        if (width > 600) {
            return 2;
        }

        return 1;
    }

    function buildMasonry(force) {
        var cols = getColumnCount();

        if (!force && cols === currentCols) {
            return;
        }

        currentCols = cols;

        $cards.detach();
        $grid.empty();

        var $columns = [];

        for (var i = 0; i < cols; i++) {
            var $col = $('<div class="masonry-column"></div>');

            $columns.push($col);
            $grid.append($col);
        }

        $cards.each(function () {
            var $shortest = $columns[0];

            $.each($columns, function (index, $col) {
                if ($col.height() < $shortest.height()) {
                    $shortest = $col;
                }
            });

            $shortest.append(this);
        });

        $grid.addClass('is-ready');
    }

    buildMasonry(true);

    $(window).on('load', function () {
        buildMasonry(true);
    });

    $(window).on('resize', function () {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function () {
            buildMasonry(false);
        }, 150);
    });
});


/* =========================================
   Job Success Bar (jQuery)
========================================= */

$(function () {
    var $fill = $('.job-bar-fill');
    var $number = $('.job-bar-number');

    if (!$fill.length) {
        return;
    }

    var target = parseInt(
        $fill.attr('data-value'),
        10
    );

    var reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
        $fill.css('width', target + '%');
        $number.text(target);

        return;
    }

    $number.text(0);

    $({ value: 0 }).animate(
        { value: target },
        {
            duration: 1800,
            easing: 'swing',

            step: function (now) {
                $fill.css('width', now + '%');
                $number.text(Math.round(now));
            },

            complete: function () {
                $fill.css('width', target + '%');
                $number.text(target);
            }
        }
    );
});


/* =========================================
   Project Card: Tap to Reveal
========================================= */

$(function () {
    if (!window.matchMedia('(hover: none)').matches) {
        return;
    }

    $(document).on(
        'click',
        '.project-media',
        function () {
            $(this)
                .closest('.project-card')
                .toggleClass('is-open');
        }
    );
});


/* =========================================
   Process Timeline (Scroll Driven)
========================================= */

(function () {
    var timeline =
        document.querySelector('.process-timeline');

    if (!timeline) {
        return;
    }

    var line =
        timeline.querySelector('.process-line');

    var fill =
        timeline.querySelector('.process-line-fill');

    var steps =
        Array.prototype.slice.call(
            timeline.querySelectorAll('.process-step')
        );

    if (!line || !fill || !steps.length) {
        return;
    }

    var mobileQuery =
        window.matchMedia('(max-width: 768px)');

    var reduceMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

    var vertical = false;
    var startPos = 0;
    var length = 0;
    var offsets = [];
    var ticking = false;

    timeline.classList.add('is-js');

    function layout() {
        vertical = mobileQuery.matches;

        var centers = steps.map(function (step) {
            var number =
                step.querySelector('.process-number');

            return vertical
                ? step.offsetTop +
                      number.offsetTop +
                      number.offsetHeight / 2
                : step.offsetLeft +
                      number.offsetLeft +
                      number.offsetWidth / 2;
        });

        var firstStep = steps[0];

        var firstNumber =
            firstStep.querySelector('.process-number');

        var cross = vertical
            ? firstStep.offsetLeft +
              firstNumber.offsetLeft +
              firstNumber.offsetWidth / 2
            : firstStep.offsetTop +
              firstNumber.offsetTop +
              firstNumber.offsetHeight / 2;

        startPos = centers[0];

        length =
            centers[centers.length - 1] -
            startPos;

        offsets = centers.map(function (center) {
            return center - startPos;
        });

        if (vertical) {
            line.style.left =
                cross - 1 + 'px';

            line.style.top =
                startPos + 'px';

            line.style.width = '2px';
            line.style.height =
                length + 'px';

            fill.style.transformOrigin =
                'top center';
        } else {
            line.style.left =
                startPos + 'px';

            line.style.top =
                cross - 1 + 'px';

            line.style.width =
                length + 'px';

            line.style.height = '2px';

            fill.style.transformOrigin =
                'left center';
        }
    }

    function update() {
        ticking = false;

        var viewportHeight =
            window.innerHeight;

        var rect =
            timeline.getBoundingClientRect();

        var raw;
        var filled;

        if (reduceMotion) {
            raw = 1;
            filled = length;
        } else if (vertical) {
            raw =
                viewportHeight * 0.6 -
                rect.top -
                startPos;

            filled = Math.max(
                0,
                Math.min(length, raw)
            );
        } else {
            var progress =
                (viewportHeight * 0.85 -
                    rect.top) /
                (viewportHeight * 0.4);

            raw = progress;

            filled =
                Math.max(
                    0,
                    Math.min(1, progress)
                ) * length;
        }

        var ratio =
            length > 0
                ? filled / length
                : 0;

        fill.style.transform = vertical
            ? 'scaleY(' + ratio + ')'
            : 'scaleX(' + ratio + ')';

        steps.forEach(function (step, index) {
            var isActive =
                reduceMotion ||
                (raw >= 0 &&
                    filled >= offsets[index] - 1);

            step.classList.toggle(
                'is-active',
                isActive
            );
        });
    }

    function requestUpdate() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    function refresh() {
        layout();
        update();
    }

    window.addEventListener(
        'scroll',
        requestUpdate,
        { passive: true }
    );

    window.addEventListener(
        'resize',
        refresh
    );

    window.addEventListener(
        'load',
        refresh
    );

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener(
            'change',
            refresh
        );
    }

    refresh();
})();


/* =========================================
   View More / View Less Projects
========================================= */

document.addEventListener(
    'DOMContentLoaded',
    function () {
        var viewAllBtn =
            document.getElementById(
                'view-all-projects-btn'
            );

        var projectCards =
            document.querySelectorAll(
                '.work-grid .work-card'
            );

        if (
            !viewAllBtn ||
            !projectCards.length
        ) {
            return;
        }

        viewAllBtn.addEventListener(
            'click',
            function (event) {
                event.preventDefault();

                var isExpanded =
                    viewAllBtn.classList.contains(
                        'is-expanded'
                    );

                projectCards.forEach(
                    function (card, index) {
                        if (index >= 6) {
                            card.classList.toggle(
                                'is-visible',
                                !isExpanded
                            );
                        }
                    }
                );

                viewAllBtn.classList.toggle(
                    'is-expanded',
                    !isExpanded
                );

                if (!isExpanded) {
                    viewAllBtn.innerHTML =
                        'View Less <span aria-hidden="true">↑</span>';
                } else {
                    viewAllBtn.innerHTML =
                        'View More <span aria-hidden="true">→</span>';
                }
            }
        );
    }
);