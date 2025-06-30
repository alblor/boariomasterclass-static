// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const siteTitleSpans = document.querySelectorAll('.site-title span');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const galleryDotsContainer = document.querySelector('.gallery-dots-container .gallery-dots');
    const currentYearSpan = document.getElementById('current-year');
    const headerYearSpan = document.getElementById('header-year');
    const langBtn = document.getElementById('lang-btn');
    const currentLangDisplay = document.getElementById('current-lang-display');
    const languageMenu = document.getElementById('language-menu');
    const langMenuItems = languageMenu ? Array.from(languageMenu.querySelectorAll('li[data-lang]')) : []; // Convert to Array
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIconSun = themeToggleBtn ? themeToggleBtn.querySelector('.theme-sun-icon') : null;
    const themeIconMoon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-moon-icon') : null;
    const controlsToAnimate = document.querySelectorAll('.language-selector-wrapper, .theme-switch-wrapper, .gallery-dots-container');
    const htmlElement = document.documentElement;
    const currentGlobalYear = new Date().getFullYear(); // Make current year globally accessible in this scope

    // Mobile Menu Elements
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const sideMenuLinks = document.querySelectorAll('.side-menu-nav a');

    // Mobile Menu Functions
    function openMenu() {
        sideMenu.classList.add('open');
        menuOverlay.classList.add('open');
        menuButton.classList.add('active');
        menuButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    }

    function closeMenuFn() {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
        menuButton.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    // Setup Mobile Menu Event Listeners
    if (menuButton) {
        menuButton.addEventListener('click', openMenu);
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', closeMenuFn);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenuFn);
    }

    // Smooth scroll to top function
    function smoothScrollToTop() {
        // Using requestAnimationFrame for smooth scrolling with easing
        const scrollToTop = () => {
            const c = document.documentElement.scrollTop || document.body.scrollTop;
            if (c > 0) {
                // Calculate scroll distance with easing (smooth start and end)
                // Increased speed by changing divisor from 10 to 5
                const scrollStep = Math.max(c / 5, 1);
                window.requestAnimationFrame(scrollToTop);
                window.scrollTo(0, c - scrollStep);
            }
        };
        window.requestAnimationFrame(scrollToTop);
    }

    // Close menu when clicking on a link in the side menu
    if (sideMenuLinks.length > 0) {
        sideMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Close the menu
                closeMenuFn();
                
                // Get the target section id from the href
                const targetId = link.getAttribute('href').substring(1); // Remove the '#'
                
                // Mark section as visited and check registration
                visitedSections.add(targetId);
                checkAndShowRegistration();
                // Remove any page overlay
                ensureOverlayRemoved();
                
                // Transition to the new section
                switchSection(targetId);
                
                // Update URL hash
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, null, `#${targetId}`);
                }
                
                // Prevent default link behavior
                e.preventDefault();
            });
        });
    }

    // Handle escape key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
            closeMenuFn();
        }
    });

    // Global variable to track visited sections
    const visitedSections = new Set();
    
    // Function to check if all required sections have been visited and show registration button
    function checkAndShowRegistration() {
        const requiredSections = ['about', 'faculty', 'rules'];
        const allVisited = requiredSections.every(section => visitedSections.has(section));
        
        // Show register button in top bar if all sections are visited
        const registerButtonWrapper = document.querySelector('.register-button-wrapper');
        const registerButton = document.getElementById('register-button');
        
        if (registerButtonWrapper && registerButton && allVisited) {
            console.log('All required sections visited, showing registration button');
            
            // If button is already visible, don't show overlay again
            if (registerButtonWrapper.style.display === 'block' && registerButton.classList.contains('active')) {
                // Button already visible, just ensure the overlay is removed
                ensureOverlayRemoved();
                return;
            }
            
            // Create overlay element if it doesn't exist
            let overlay = document.querySelector('.page-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'page-overlay';
                document.body.appendChild(overlay);
                
                // Position overlay correctly based on top bar height
                const topBar = document.querySelector('.top-bar');
                if (topBar) {
                    const topBarHeight = topBar.offsetHeight;
                    const topBarOffset = topBar.offsetTop + topBarHeight;
                    overlay.style.top = `${topBarOffset}px`;
                    overlay.style.height = `calc(100% - ${topBarOffset}px)`;
                }
            }

            // Show button and activate overlay
            registerButtonWrapper.style.display = 'block';
            
            // Small delay to ensure DOM updates before animations
            setTimeout(() => {
                registerButton.classList.add('active');
                overlay.classList.add('active');
                
                // Remove overlay class after animation completes
                setTimeout(() => {
                    overlay.classList.remove('active');
                }, 4000);
            }, 100);
        }
    }
    
    // Debug function - can be triggered from console by calling showRegistrationBanner()
    window.showRegistrationBanner = function() {
        visitedSections.add('about');
        visitedSections.add('faculty');
        visitedSections.add('rules');
        visitedSections.add('venue');
        checkAndShowRegistration();
        console.log('Debug: Registration button should now be visible');
    };
    
    // --- Roman Numeral Converter ---
    function toRoman(num) {
        if (isNaN(num) || num < 1 || num > 3999) return String(num); // Basic validation
        const romanNumerals = [
            { value: 1000, numeral: 'M' }, { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },  { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },  { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },   { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },   { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },    { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];
        let result = '';
        for (let i = 0; i < romanNumerals.length; i++) {
            while (num >= romanNumerals[i].value) {
                result += romanNumerals[i].numeral;
                num -= romanNumerals[i].value;
            }
        }
        return result;
    }

    // --- Copyright Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = currentGlobalYear;
    }
    if (headerYearSpan) {
        headerYearSpan.textContent = currentGlobalYear;
    }
    
    // Update year in all header title variants
    const headerYearScroll = document.getElementById('header-year-scroll');
    const headerYearAbbrev = document.getElementById('header-year-abbrev');
    
    if (headerYearScroll) {
        headerYearScroll.textContent = currentGlobalYear;
    }
    if (headerYearAbbrev) {
        headerYearAbbrev.textContent = currentGlobalYear;
    }

    // Enhanced Header Title Management
    function updateHeaderTitleDisplay() {
        const registerButtonWrapper = document.querySelector('.register-button-wrapper');
        const isRegisterButtonVisible = registerButtonWrapper && 
            registerButtonWrapper.style.display === 'block';
        
        const headerTitle = document.querySelector('.header-title');
        const scrollContainer = document.querySelector('.header-title-scroll-container');
        const abbreviatedTitle = document.querySelector('.header-title-abbreviated');
        
        if (!headerTitle || !scrollContainer || !abbreviatedTitle) return;
        
        const screenWidth = window.innerWidth;
        
        // Reset all displays
        headerTitle.style.display = '';
        scrollContainer.style.display = 'none';
        abbreviatedTitle.style.display = 'none';
        
        if (isRegisterButtonVisible) {
            if (screenWidth <= 380) {
                // Very small screens: show abbreviated title
                headerTitle.style.display = 'none';
                abbreviatedTitle.style.display = 'flex';
            } else if (screenWidth <= 600) {
                // Medium-small screens: show scrolling text
                headerTitle.style.display = 'none';
                scrollContainer.style.display = 'block';
                
                // Start scrolling animation
                const scrollingText = scrollContainer.querySelector('.header-title-scrolling');
                if (scrollingText) {
                    scrollingText.style.animationPlayState = 'running';
                }
            }
            // For larger screens, keep the normal title visible
        }
    }

    // Initialize header title display
    updateHeaderTitleDisplay();
    
    // Update on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeaderTitleDisplay, 150);
    });
    
    // Update when register button visibility changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                mutation.target.classList.contains('register-button-wrapper')) {
                setTimeout(updateHeaderTitleDisplay, 100);
            }
        });
    });
    
    const registerButtonWrapper = document.querySelector('.register-button-wrapper');
    if (registerButtonWrapper) {
        observer.observe(registerButtonWrapper, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }

    // Update the Schema.org Event dates to use the current year
    function updateSchemaOrgDates() {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
            try {
                const schemaData = JSON.parse(schemaScript.textContent);
                // Update event name if it contains a year
                if (schemaData.name && schemaData.name.includes('BoarioMasterclass')) {
                    schemaData.name = `BoarioMasterclass ${currentGlobalYear}`;
                }
                // Update the start date year
                if (schemaData.startDate) {
                    schemaData.startDate = schemaData.startDate.replace(/^\d{4}/, currentGlobalYear);
                }
                // Update the end date year
                if (schemaData.endDate) {
                    schemaData.endDate = schemaData.endDate.replace(/^\d{4}/, currentGlobalYear);
                }
                // Update valid from date
                if (schemaData.offers && schemaData.offers.validFrom) {
                    schemaData.offers.validFrom = schemaData.offers.validFrom.replace(/^\d{4}/, currentGlobalYear);
                }
                // Write back the updated schema
                schemaScript.textContent = JSON.stringify(schemaData, null, 2);
            } catch (error) {
                console.warn('Error updating Schema.org dates:', error);
            }
        }
    }

    // --- Localization ---
    let currentLanguage = 'it'; // Set initial thought to Italian

    async function getIPInfo() {
        // THIS IS A PLACEHOLDER FOR ACTUAL IP GEOLOCATION
        // In a real scenario, you'd use a service.
        // Example:
        // try {
        //     const response = await fetch('https://ipapi.co/json/'); // Or your chosen service
        //     if (!response.ok) throw new Error('IP API fetch failed');
        //     const data = await response.json();
        //     return data.country_code; // e.g., 'IT', 'US'
        // } catch (error) {
        //     console.warn("IP Geolocation failed:", error.message);
        //     return null;
        // }
        console.warn("IP Geolocation is simulated. Using browser language for Italian check.");
        return null; // Simulate failure or no service
    }

    async function getInitialLanguage() {
        // First check URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && translations[urlLang]) {
            // Save to localStorage for persistence
            localStorage.setItem('boarioMasterclassLang', urlLang);
            return urlLang;
        }
        
        // Then check localStorage
        const storedLang = localStorage.getItem('boarioMasterclassLang');
        if (storedLang && translations[storedLang]) {
            return storedLang;
        }
        
        // Otherwise, detect browser/system language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('en')) {
            return 'en';
        }
        
        // Default to Italian if no match
        return 'it';
    }

    function applyTranslations(lang) {
        if (!translations[lang]) {
            console.warn(`Translations not found for language: ${lang}`);
            return;
        }
        currentLanguage = lang; // Update global current language state
        htmlElement.setAttribute('lang', lang);

        // Update text content of elements with data-translate-key
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.dataset.translateKey;
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            } else {
                console.warn(`Translation key "${key}" not found for language "${lang}".`);
            }
        });

        // Update alt attributes for elements with data-translate-alt
        document.querySelectorAll('[data-translate-alt]').forEach(element => {
            const key = element.dataset.translateAlt;
            if (translations[lang][key]) {
                element.setAttribute('alt', translations[lang][key]);
            }
        });
        
        // Update aria-label attributes for elements with data-translate-aria-label
        document.querySelectorAll('[data-translate-aria-label]').forEach(element => {
            const key = element.dataset.translateAriaLabel;
            if (translations[lang][key]) {
                element.setAttribute('aria-label', translations[lang][key]);
            }
        });
        
        // Update meta tags with data-translate-meta
        document.querySelectorAll('meta[data-translate-meta]').forEach(element => {
            const key = element.dataset.translateMeta;
            if (translations[lang][key]) {
                element.setAttribute('content', translations[lang][key]);
            }
        });
        
        // Update title attributes for elements with data-translate-title
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.dataset.translateTitle;
            if (translations[lang][key]) {
                element.setAttribute('title', translations[lang][key]);
            }
        });
        
        // Update bio modal content if it's currently open
        const bioModal = document.getElementById('bio-modal');
        if (bioModal && bioModal.classList.contains('show')) {
            // Get the current teacher and URL from the modal title
            const bioModalTitle = document.getElementById('bio-modal-title');
            const teacherName = bioModalTitle.textContent.split(':')[1]?.trim();
            
            if (teacherName) {
                // Find the teacher's data URL by searching in curriculumData
                let teacherUrl = null;
                if (window.curriculumData) {
                    for (const url in window.curriculumData) {
                        if (window.curriculumData[url].teacherName.replace('_', ' ') === teacherName ||
                            teacherName.includes(window.curriculumData[url].teacherName.replace('_', ' '))) {
                            teacherUrl = url;
                            break;
                        }
                    }
                    
                    // If found, update the content with the translated version
                    if (teacherUrl && window.curriculumData[teacherUrl]) {
                        const bioContent = document.getElementById('bio-content');
                        const teacherData = window.curriculumData[teacherUrl];
                        const contentToShow = teacherData[lang] || teacherData['it']; // Fallback to Italian
                        
                        if (bioContent) {
                            bioContent.innerHTML = contentToShow;
                        }
                    }
                }
            }
        }

        // Update language display in the UI
        if (currentLangDisplay) {
            currentLangDisplay.textContent = lang.toUpperCase();
        }
        langMenuItems.forEach(item => {
            item.classList.toggle('selected-lang', item.dataset.lang === lang);
        });
        
        // Update the URL query parameter without page reload
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        // Update Open Graph locale meta tags
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        const ogLocaleAlt = document.querySelector('meta[property="og:locale:alternate"]');
        
        if (ogLocale && ogLocaleAlt) {
            if (lang === 'en') {
                ogLocale.setAttribute('content', 'en_US');
                ogLocaleAlt.setAttribute('content', 'it_IT');
            } else if (lang === 'it') {
                ogLocale.setAttribute('content', 'it_IT');
                ogLocaleAlt.setAttribute('content', 'en_US');
            }
        }
        
        // Store the selected language in localStorage
        localStorage.setItem('boarioMasterclassLang', lang);
    }

    async function initializeLocalization() {
        const initialLang = await getInitialLanguage();
        applyTranslations(initialLang);
    }


    // --- Title Animation Stagger ---
    const staggerDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-stagger-delay').trim().replace('s','')) * 1000;
    siteTitleSpans.forEach((span, index) => {
        span.style.animationDelay = `${index * staggerDelay}ms`;
    });
    const totalTitleAnimationTime = (siteTitleSpans.length * staggerDelay) + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-animation-duration').trim().replace('s','')) * 1000);

    // --- Delayed Controls Appearance ---
    setTimeout(() => {
        if (learnMoreBtn) { learnMoreBtn.classList.remove('hidden-control'); }
        
        // Make language selector and theme toggle immediately visible
        document.querySelector('.language-selector-wrapper')?.classList.remove('hidden-control');
        document.querySelector('.theme-switch-wrapper')?.classList.remove('hidden-control');
    }, totalTitleAnimationTime);

    const additionalControlsDelay = 300;
    setTimeout(() => {
        // Only animate gallery dots, as language and theme are already visible
        const galleryDots = document.querySelector('.gallery-dots-container');
        if (galleryDots) galleryDots.classList.remove('hidden-control');
    }, totalTitleAnimationTime + additionalControlsDelay);

    // --- Background Photo Gallery ---
    const heroGallery = document.querySelector('.hero-gallery-background');
    const galleryImageDivs = heroGallery ? Array.from(heroGallery.querySelectorAll('.gallery-image')) : [];
    const galleryImageFilenames = [ 'images/gallery-image1.jpg', 'images/gallery-image2.jpg', 'images/gallery-image3.jpg', 'images/gallery-image4.jpg' ];
    galleryImageDivs.forEach((imgDiv, index) => {
        if (galleryImageFilenames[index]) { imgDiv.style.backgroundImage = `url('${galleryImageFilenames[index]}')`; }
    });
    let currentImageIndex = 0;
    let galleryInterval;
    function setupDots() {
        if (galleryImageDivs.length > 0 && galleryDotsContainer) {
            galleryDotsContainer.innerHTML = '';
            galleryImageDivs.forEach((_, index) => {
                const dot = document.createElement('span'); dot.classList.add('dot'); dot.dataset.index = index;
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => { stopGalleryAutoPlay(); showImage(index); startGalleryAutoPlay(7000); });
                galleryDotsContainer.appendChild(dot);
            });
        }
    }
    const dots = () => galleryDotsContainer ? galleryDotsContainer.querySelectorAll('.dot') : [];
    function showImage(index) {
        if (galleryImageDivs.length === 0) return;
        galleryImageDivs.forEach((img, i) => img.classList.toggle('active', i === index));
        if (dots().length > 0) { dots().forEach((dot, i) => dot.classList.toggle('active', i === index)); }
        currentImageIndex = index;
    }
    function nextImage() {
        if (galleryImageDivs.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % galleryImageDivs.length;
        showImage(currentImageIndex);
    }
    function startGalleryAutoPlay(intervalTime = 6000) { if (galleryImageDivs.length > 1) { galleryInterval = setInterval(nextImage, intervalTime); } }
    function stopGalleryAutoPlay() { clearInterval(galleryInterval); }
    if (galleryImageDivs.length > 0) { setupDots(); if (galleryImageDivs[0]) showImage(0); startGalleryAutoPlay(); }

    // --- Dark/Light Theme Switch ---
    function updateThemeIcons(theme) {
        if (!themeIconSun || !themeIconMoon) return;
        themeIconSun.style.display = theme === 'dark' ? 'none' : 'block';
        themeIconMoon.style.display = theme === 'dark' ? 'block' : 'none';
    }
    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        updateThemeIcons(theme);
        localStorage.setItem('boarioMasterclassTheme', theme);
    }
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('boarioMasterclassTheme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
        themeToggleBtn.addEventListener('click', () => {
            applyTheme(htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    // --- Language Selector Event Listener ---
    if (langBtn && languageMenu) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
            langBtn.setAttribute('aria-expanded', String(!isExpanded));
            languageMenu.classList.toggle('active-menu', !isExpanded);
        });
        langMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = item.dataset.lang;
                const currentLang = currentLanguage;
                
                if (selectedLang && selectedLang !== currentLang) {
                    // Apply translations directly on the client side
                    applyTranslations(selectedLang);
                    
                    // Update URL with a query parameter for bookmarking but without navigation
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('lang', selectedLang);
                    window.history.replaceState({}, '', currentUrl);
                }
                
                langBtn.setAttribute('aria-expanded', 'false');
                languageMenu.classList.remove('active-menu');
            });
        });
        document.addEventListener('click', (e) => {
            if (langBtn && languageMenu && !langBtn.contains(e.target) && !languageMenu.contains(e.target)) {
                if (langBtn.getAttribute('aria-expanded') === 'true') {
                    langBtn.setAttribute('aria-expanded', 'false');
                    languageMenu.classList.remove('active-menu');
                }
            }
        });
    }

    // --- "Learn More" Button Action ---
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            // Trigger the website expansion
            expandWebsite();
        });
    }

    // --- Website Expansion Function ---
    function expandWebsite() {
        const body = document.body;
        const navContainer = document.querySelector('.nav-container');
        const fullWebsiteContent = document.querySelector('.full-website-content');
        const contentSections = document.querySelectorAll('.content-section');
        const siteTitleInHero = document.querySelector('.hero-section-container .site-title'); 
        const masterclassInfoContainer = document.querySelector('.masterclass-info-container');
        const registrationBanner = document.querySelector('.registration-banner');

        // If already expanding, don't do it again
        if (body.classList.contains('site-expanding')) return;
        
        // If mobile menu is open, close it
        if (sideMenu && sideMenu.classList.contains('open')) {
            closeMenuFn();
        }

        // Add expanding class to body
        body.classList.add('site-expanding');
        localStorage.setItem('boarioMasterclassState', 'expanded'); // Store state

        // Dispatch custom event to notify other modules
        window.dispatchEvent(new Event('websiteExpanded'));

        // Initialize registration banner display but keep it invisible
        if (registrationBanner) {
            registrationBanner.style.display = 'flex';
        }

        // Timing sequence for animations
        setTimeout(() => {
            if (navContainer) navContainer.classList.remove('hidden');
            setTimeout(() => {
                if (navContainer) navContainer.classList.add('visible');
            }, 100); // Nav appears quickly after being unhidden
        }, 800); // Show nav after bars expand (0.8s)

        // Show registration banner with smooth animation after initial expansion
        setTimeout(() => {
            if (registrationBanner) {
                registrationBanner.classList.add('animate-in');
            }
        }, 1500); // Show banner at 1.5s, before content appears

        // Show the main website content after nav and banner appear (2.3s)
        setTimeout(() => {
            if (fullWebsiteContent) {
                fullWebsiteContent.classList.remove('hidden');
                fullWebsiteContent.classList.add('visible');
            }
        }, 2300); // Show content after nav and banner appear (2.3s)

        // Show only the about section by default and hide others
        const aboutSection = document.getElementById('about');
        contentSections.forEach((section) => {
            if (section.id === 'about') {
                section.classList.add('visible');
                // Update navigation state
                const currentSectionName = document.querySelector('.current-section-name');
                if (currentSectionName) {
                    currentSectionName.textContent = section.querySelector('h2').textContent;
                }
                // Track section view
                if (!visitedSections.has('about')) {
                    visitedSections.add('about');
                    checkAndShowRegistration();
                }
            } else {
                section.classList.remove('visible');
            }
        });

        // Activate highlighter after other main animations are likely complete
        setTimeout(() => {
            if (siteTitleInHero) {
                siteTitleInHero.classList.add('highlighter-active');
            }
        }, 2500); // Activate highlighter at 2.5s

        // Make masterclass info visible after highlighter animation starts or is about to finish
        setTimeout(() => {
            if (masterclassInfoContainer) {
                masterclassInfoContainer.classList.add('visible');
            }
        }, 3000); // Start info fade-in at 3.0s

        // Update URL hash
        history.pushState('', document.title, window.location.pathname + window.location.search + '#about');
        
        // Stop gallery auto-rotation
        stopGalleryAutoPlay();
    }

    // Check if social image exists and apply fallback if needed
    function checkSocialImage() {
        const socialImagePath = '/images/social-share.jpg';
        
        // Function to update all meta tags with a new image path
        function updateSocialImageTags(newPath) {
            document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(tag => {
                tag.setAttribute('content', window.location.origin + newPath);
            });
        }
        
        // Try to load the image to see if it exists
        const img = new Image();
        img.onerror = function() {
            // Image doesn't exist, use logo or other fallback
            console.warn('Social share image not found, using fallback');
            updateSocialImageTags('/logo.svg');
        };
        img.src = socialImagePath;
    }
    
    // --- Initialize on Page Load ---
    async function initializePage() {
        await initializeLocalization();
        // Update Schema.org data with current year
        updateSchemaOrgDates();
        // Check social image exists
        checkSocialImage();
        
        // Other initializations can go here

        // Populate dynamic masterclass info
        const editionNumberEl = document.getElementById('edition-number');
        const currentEventYearEl = document.getElementById('current-event-year');
        
        if (editionNumberEl) {
            const baseEdition = 16; // XVI is 2025
            const baseYear = 2025;
            const calculatedEdition = baseEdition + (currentGlobalYear - baseYear);
            editionNumberEl.textContent = toRoman(calculatedEdition);
        }
        if (currentEventYearEl) {
            currentEventYearEl.textContent = currentGlobalYear;
        }

        // Handle footer animation completion to prevent brown overlay
        const bottomBar = document.querySelector('.bottom-bar');
        if (bottomBar) {
            // Add animation-complete class after footer animation finishes
            // Footer animation: 1.5s delay + 1.2s duration = 2.7s total
            setTimeout(() => {
                bottomBar.classList.add('animation-complete');
            }, 2800); // Small buffer after animation completes
        }

        // Check for expanded state on load
        if (localStorage.getItem('boarioMasterclassState') === 'expanded' && window.location.hash === '#about') {
            // Directly set the expanded state without full animation sequence if reloading expanded page
            document.body.classList.add('site-expanding');
            document.body.classList.add('site-expanded-immediately'); // New class to bypass some transitions
            
            const navContainer = document.querySelector('.nav-container');
            const fullWebsiteContent = document.querySelector('.full-website-content');
            const contentSections = document.querySelectorAll('.content-section');
            const siteTitleInHero = document.querySelector('.hero-section-container .site-title');
            const masterclassInfoContainer = document.querySelector('.masterclass-info-container');
            const registrationBanner = document.querySelector('.registration-banner');

            // Dispatch event to notify other modules
            window.dispatchEvent(new Event('websiteExpanded'));

            if (navContainer) { 
                navContainer.classList.remove('hidden');
                navContainer.classList.add('visible');
            }
            
            // Keep registration banner visible when directly loading in expanded state
            if (registrationBanner) {
                registrationBanner.style.display = 'flex';
                registrationBanner.classList.add('animate-in');
            }
            
            if (fullWebsiteContent) {
                fullWebsiteContent.classList.remove('hidden');
                fullWebsiteContent.classList.add('visible');
            }
            contentSections.forEach(section => section.classList.add('visible'));
            
            // Apply highlighter immediately if state is already expanded
            if (siteTitleInHero) {
                // Add a small delay to ensure the ::after pseudo-element is ready after DOM re-flow
                setTimeout(() => siteTitleInHero.classList.add('highlighter-active'), 50);
            }
            // Make masterclass info visible immediately on direct load to expanded state
            if (masterclassInfoContainer) {
                setTimeout(() => masterclassInfoContainer.classList.add('visible'), 100); // Small delay for consistency
            }
            // Potentially scroll to #about or the relevant section if not already handled by hash
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                // aboutSection.scrollIntoView({ behavior: 'smooth' }); // Optional: if direct jump by hash isn't enough
            }
        } else if (window.location.hash === '#about') {
            // If hash is #about but not stored as expanded, maybe trigger full expansion
            if(localStorage.getItem('boarioMasterclassState') !== 'expanded') {
               expandWebsite(); // If user lands on #about URL directly
            } else {
                 // This case means: localStorage IS expanded, but hash is #about - this is handled by the first 'if' block.
                 // However, if site-expanded-immediately is NOT added, we might need to manually trigger info visibility here.
                 // This else is likely redundant if the first if correctly handles direct load to #about with stored state.
                 const masterclassInfoContainer = document.querySelector('.masterclass-info-container');
                 if (masterclassInfoContainer && !masterclassInfoContainer.classList.contains('visible')) {
                    setTimeout(() => masterclassInfoContainer.classList.add('visible'), 100); 
                 }
            }
        } else {
            // Clear state if not expanded and no relevant hash
            localStorage.removeItem('boarioMasterclassState');
        }
    }

    initializePage();

    // Add overlay removal to setupNavigationLinks
    function setupNavigationLinks() {
        const navLinks = document.querySelectorAll('.nav-list a');
        const contentSections = document.querySelectorAll('.content-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                // Mark section as visited and check registration
                visitedSections.add(targetId);
                checkAndShowRegistration();
                // Remove any page overlay
                ensureOverlayRemoved();

                // Transition to the new section with fade
                switchSection(targetId);

                // Update URL hash
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, null, `#${targetId}`);
                }
            });
        });
    }

    // Setup navigation after a small delay to ensure DOM is ready
    setTimeout(setupNavigationLinks, 1000);

    // Add section navigation arrows functionality
    function setupSectionNavigation() {
        // Include all sections in the navigation, except program which is hidden
        const validSectionIds = ['about', 'faculty', 'rules', 'venue', 'contact'];
        const sections = validSectionIds.map(id => document.getElementById(id)).filter(Boolean);
        const prevArrow = document.querySelector('.nav-arrow.prev');
        const nextArrow = document.querySelector('.nav-arrow.next');
        const currentSectionName = document.querySelector('.current-section-name');
        
        let currentIndex = 0; // Start with the first section
        
        function updateNavigation() {
            // Update the arrows' disabled state
            prevArrow.classList.toggle('disabled', currentIndex === 0);
            nextArrow.classList.toggle('disabled', currentIndex === sections.length - 1);
            
            // Update the current section indicator
            const currentSection = sections[currentIndex];
            const sectionTitle = currentSection ? currentSection.querySelector('h2').textContent : '';
            currentSectionName.textContent = sectionTitle;
            
            // Animate the text change
            currentSectionName.style.opacity = '0';
            currentSectionName.style.transform = 'translateY(5px)';
            setTimeout(() => {
                currentSectionName.style.opacity = '1';
                currentSectionName.style.transform = 'translateY(0)';
            }, 300);
        }
        
        function goToSection(index) {
            if (index >= 0 && index < sections.length) {
                currentIndex = index;
                const targetId = sections[currentIndex].id;
                // Mark section as visited and check registration
                visitedSections.add(targetId);
                checkAndShowRegistration();
                // Remove any page overlay
                ensureOverlayRemoved();
                // Transition to the target section with fade
                switchSection(targetId);
                // Update URL hash
                if (window.history && window.history.pushState) {
                    window.history.pushState(null, null, `#${targetId}`);
                }
                // Update navigation UI
                updateNavigation();
            }
        }
        
        // Handle click events for navigation arrows
        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                if (currentIndex > 0) {
                    goToSection(currentIndex - 1);
                }
            });
        }
        
        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                if (currentIndex < sections.length - 1) {
                    goToSection(currentIndex + 1);
                }
            });
        }
        
        // Initialize based on current hash (if any)
        function initializeNavigation() {
            if (!sections.length) return;
            
            const hash = window.location.hash;
            const targetId = hash ? hash.substring(1) : null;
            
            if (targetId && validSectionIds.includes(targetId)) {
                // Find the index of the target section
                const targetIndex = sections.findIndex(section => section.id === targetId);
                if (targetIndex !== -1) {
                    currentIndex = targetIndex;
                }
            }
            
            // Show the current section and mark it as visited
            goToSection(currentIndex);
        }
        
        // Initialize
        setTimeout(initializeNavigation, 300);
    }
    
    // Add keyboard navigation for the sections
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Only respond to keyboard events when site is expanded
            if (!document.body.classList.contains('site-expanding')) return;
            
            if (event.key === 'ArrowLeft') {
                document.querySelector('.nav-arrow.prev')?.click();
            } else if (event.key === 'ArrowRight') {
                document.querySelector('.nav-arrow.next')?.click();
            }
        });
    }

    // Setup arrow navigation after the website is expanded
    setTimeout(() => {
        setupSectionNavigation();
        setupKeyboardNavigation();
    }, 1500);

    // Hotel carousel functionality
    function setupHotelCarousel() {
        const track = document.querySelector('.carousel-track');
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const dotsContainer = document.querySelector('.carousel-dots');
        
        if (!track || slides.length === 0) return;
        
        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', () => { moveToSlide(i); resetInterval(); });
            dotsContainer.appendChild(dot);
        });
        
        const dots = Array.from(document.querySelectorAll('.carousel-dot'));
        let currentIndex = 0;
        let interval;
        let isPaused = false;
        
        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            track.style.transform = `translateX(-${index * 100}%)`;
            
            // Update active dot
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }
        
        function nextSlide() {
            if (!isPaused) {
                moveToSlide(currentIndex + 1);
            }
        }
        
        function resetInterval() {
            clearInterval(interval);
            interval = setInterval(nextSlide, 5000);
        }
        
        // Pause on hover
        track.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        
        track.addEventListener('mouseleave', () => {
            isPaused = false;
        });
        
        // Start the carousel
        resetInterval();
    }

    // Setup hotel carousel after the page has initialized
    setTimeout(setupHotelCarousel, 1500);

    // Handle registration button and consent modal
    function setupRegistrationProcess() {
        const registerButton = document.getElementById('register-button');
        const consentModal = document.getElementById('consent-modal');
        const consentAccept = document.getElementById('consent-accept');
        const consentDecline = document.getElementById('consent-decline');
        const consentClose = document.getElementById('consent-modal-close');
        
        // Registration form URL - using local registration page
        const registrationUrl = "registration.html";
        
        // Show consent modal when registration button is clicked
        if (registerButton) {
            registerButton.addEventListener('click', () => {
                if (consentModal) {
                    consentModal.classList.add('show');
                }
            });
        }
        
        // Handle accept button click
        if (consentAccept) {
            consentAccept.addEventListener('click', () => {
                // Redirect to local registration form
                window.location.href = registrationUrl;
                // Close the modal
                if (consentModal) {
                    consentModal.classList.remove('show');
                    consentModal.classList.add('closing');
                    setTimeout(() => {
                        consentModal.classList.remove('closing');
                    }, 500);
                }
            });
        }
        
        // Handle decline and close button clicks
        if (consentDecline || consentClose) {
            const closeModal = () => {
                if (consentModal) {
                    consentModal.classList.remove('show');
                    consentModal.classList.add('closing');
                    setTimeout(() => {
                        consentModal.classList.remove('closing');
                    }, 500);
                }
            };
            
            if (consentDecline) consentDecline.addEventListener('click', closeModal);
            if (consentClose) consentClose.addEventListener('click', closeModal);
        }
    }
    
    // Call setup function after DOM content is loaded
    setTimeout(setupRegistrationProcess, 1000);

    // Handle back button / hash changes to collapse site or change section
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '' || window.location.hash === '#') {
            if (document.body.classList.contains('site-expanding')) {
                document.body.classList.remove('site-expanding');
                document.body.classList.remove('site-expanded-immediately');
                localStorage.removeItem('boarioMasterclassState');
                
                const siteTitleInHero = document.querySelector('.hero-section-container .site-title');
                if (siteTitleInHero) {
                    siteTitleInHero.classList.remove('highlighter-active');
                }
                const masterclassInfoContainer = document.querySelector('.masterclass-info-container');
                if (masterclassInfoContainer) {
                    masterclassInfoContainer.classList.remove('visible');
                }
                const registrationBanner = document.querySelector('.registration-banner');
                if (registrationBanner) {
                    registrationBanner.style.display = 'none';
                }
                
                // Ensure overlay is removed when collapsing site
                ensureOverlayRemoved();
            }
        } else if (document.body.classList.contains('site-expanding')) {
            // When hash changes but site is already expanded, show only the relevant section
            const contentSections = document.querySelectorAll('.content-section');
            const targetId = window.location.hash.substring(1);
            
            // Smooth scroll to top
            smoothScrollToTop();
            
            // Ensure overlay is removed when changing sections
            ensureOverlayRemoved();
            
            contentSections.forEach(section => {
                section.classList.remove('visible');
            });
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.classList.add('visible');
                }, 300);
            }
        }
    });

    // Curriculum functionality moved to curriculum.js

    // Function to format the director info for mobile views by adding a line break
    function formatDirectorInfoForMobile() {
        const directorText = document.querySelector('.footer-section:first-child span[data-translate-key="copyrightText"]');
        
        if (directorText) {
            // Check if we need to add this functionality (only on smaller screens)
            const addLineBreak = window.innerWidth <= 768;
            
            if (addLineBreak) {
                // Get the current text content
                const currentText = directorText.textContent;
                
                // See if it contains "- Direttore" or similar pattern
                if (currentText.includes("- Direttore")) {
                    // Split the text at the hyphen
                    const parts = currentText.split("- Direttore");
                    
                    // Clear the element and add the parts with a line break
                    directorText.innerHTML = `${parts[0]}<br>- Direttore${parts[1]}`;
                }
            } else {
                // Ensure the original text is restored if screen size increases
                if (directorText.innerHTML.includes("<br>")) {
                    const cleanText = directorText.textContent.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
                    directorText.textContent = cleanText;
                }
            }
        }
    }

    // Add formatter for director info
    formatDirectorInfoForMobile();
    
    // Also run when window resizes
    window.addEventListener('resize', formatDirectorInfoForMobile);

    // Add a function to properly remove the overlay
    function ensureOverlayRemoved() {
        // Find any active page overlay and remove it
        const overlay = document.querySelector('.page-overlay.active');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    const heroContent = document.querySelector('.hero-content');
    const mainContent = document.querySelector('.main-content');
    const topBar = document.querySelector('.top-bar');
    const lightModeScrollBanner = document.getElementById('light-mode-scroll-banner');
    const darkModeScrollOverlay = document.getElementById('dark-mode-scroll-overlay');
    const videoPresentationSection = document.getElementById('video-presentation-section');
    const scrollPromptBanner = document.querySelector('.video-prompt-section');

    // Initial states for elements affected by scroll
    let isSiteExpanded = false;
    let scrollPosition = 0;

    function handleScrollEffects() {
        const darkModeScrollOverlay = document.getElementById('dark-mode-scroll-overlay');
        const videoPresentationSection = document.getElementById('video-presentation-section');
        const scrollPromptBanner = document.querySelector('.video-prompt-section');
        const videoPromptBanner = document.querySelector('.video-prompt-banner');

        // Initial states for elements affected by scroll
        let hasVideoSectionBeenVisible = false;

        // Check if we should show the registration button based on scroll
        function shouldShowRegistrationButton() {
            const scrollPosition = window.pageYOffset;
            const windowHeight = window.innerHeight;
            const threshold = windowHeight * 0.3; // Show after scrolling 30% of viewport height
            return scrollPosition > threshold;
        }

        function handleVideoPromptClick() {
            if (!videoPresentationSection) return;

            // Add button press animation
            if (videoPromptBanner) {
                videoPromptBanner.style.transform = 'translateY(0px) scale(0.95)';
                videoPromptBanner.style.transition = 'all 0.1s ease';
                
                setTimeout(() => {
                    videoPromptBanner.style.transform = '';
                    videoPromptBanner.style.transition = 'all 0.3s ease';
                }, 100);
            }

            // First, ensure the video section is visible so we can get accurate measurements
            if (!videoPresentationSection.classList.contains('visible')) {
                videoPresentationSection.style.display = 'flex';
                videoPresentationSection.classList.add('visible');
            }

            // Calculate position based on visible hero section and video prompt section
            const heroSection = document.querySelector('.hero-section-container');
            const videoPromptSectionEl = document.querySelector('.video-prompt-section');
            
            let targetPosition;
            
            // Calculate based on actual visible elements
            if (heroSection && videoPromptSectionEl) {
                // Position after hero section + video prompt section + small buffer
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                const promptHeight = videoPromptSectionEl.offsetHeight;
                targetPosition = heroBottom + promptHeight + 20; // 20px buffer
            } else if (heroSection) {
                // Fallback: position after hero section
                targetPosition = heroSection.offsetTop + heroSection.offsetHeight + 40;
            } else {
                // Final fallback: scroll based on viewport
                targetPosition = window.innerHeight;
            }

            // Adjust for top bar
            targetPosition -= 80;

            const currentPosition = window.pageYOffset;
            const distance = targetPosition - currentPosition;
            const duration = Math.min(Math.max(Math.abs(distance) / 2, 800), 1500);

            // Perform smooth scroll
            const startTime = performance.now();
            
            function scrollStep(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const newPosition = currentPosition + (distance * easeOutCubic);
                
                window.scrollTo(0, newPosition);
                
                if (progress < 1) {
                    requestAnimationFrame(scrollStep);
                } else {
                    // Force trigger scroll handler and fine-tune position
                    setTimeout(() => {
                        handleScroll();
                        // Double-check positioning
                        const finalPosition = window.pageYOffset;
                        const videoRect = videoPresentationSection.getBoundingClientRect();
                        
                        // Fine-tune if needed
                        if (videoRect.top > 100) {
                            window.scrollTo({
                                top: finalPosition + (videoRect.top - 80),
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                }
            }
            
            requestAnimationFrame(scrollStep);
        }

        // Setup video prompt banner click functionality
        if (videoPromptBanner) {
            videoPromptBanner.addEventListener('click', handleVideoPromptClick);
            
            // Keyboard accessibility
            videoPromptBanner.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVideoPromptClick();
                }
            });

            // Accessibility attributes
            videoPromptBanner.setAttribute('tabindex', '0');
            videoPromptBanner.setAttribute('role', 'button');
            videoPromptBanner.setAttribute('aria-label', 'Scroll to video presentation section');
        }

        // Main scroll handler function
        function handleScroll() {
            if (isHandlingScroll) return;
            isHandlingScroll = true;

            requestAnimationFrame(() => {
                scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.body.scrollHeight;

                // Handle light mode scroll banner opacity (parallax effect)
                if (lightModeScrollBanner && htmlElement.getAttribute('data-theme') === 'light') {
                    // Adjust this factor to control parallax speed and intensity
                    const parallaxFactor = 0.3; 
                    // Start fading out completely once the video section is fully visible or site expanded
                    const fadeOutStart = videoPresentationSection.offsetTop - windowHeight * 0.2; 
                    
                    let opacity;
                    if (isSiteExpanded || scrollPosition > fadeOutStart) {
                        opacity = Math.max(0, 1 - (scrollPosition - fadeOutStart) / (windowHeight * 0.3));
                    } else {
                        opacity = Math.min(0.6, scrollPosition / (windowHeight * 0.7));
                    }
                    lightModeScrollBanner.style.opacity = opacity;
                    lightModeScrollBanner.classList.toggle('visible', opacity > 0);
                } else if (lightModeScrollBanner) {
                    lightModeScrollBanner.style.opacity = '0';
                    lightModeScrollBanner.classList.remove('visible');
                }

                // Handle dark mode scroll overlay opacity
                if (darkModeScrollOverlay) {
                    // Read the max opacity from the CSS custom property
                    const maxOpacity = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--dark-mode-scroll-overlay-max-opacity').trim()) || 0.7;
                    // Make the darkening effect happen over a shorter scroll distance before expansion, longer after.
                    // opacityFactor controls how quickly it reaches maxOpacity. Smaller = faster.
                    const opacityFactor = isSiteExpanded ? 1.2 : 0.8; 
                    let currentOpacity = Math.min(maxOpacity, scrollPosition / (windowHeight * opacityFactor));

                    // If video section is visible, we might want to reduce or remove the overlay
                    const videoSectionTop = videoPresentationSection.offsetTop;
                    const videoSectionHeight = videoPresentationSection.offsetHeight;

                    if (videoPresentationSection.style.display !== 'none' && videoPresentationSection.classList.contains('visible')) {
                        // Example: Start fading out the overlay when video section is halfway into view
                        const videoMidPoint = videoSectionTop + videoSectionHeight / 2 - windowHeight / 2;
                         if (scrollPosition > videoMidPoint) {
                            // Start reducing opacity or set to a lower fixed value if needed
                            // For now, let's ensure it doesn't interfere if video is prominent.
                            // This part might need more nuanced logic based on desired visual outcome.
                            // currentOpacity = Math.max(0, currentOpacity - (scrollPosition - videoMidPoint) / (windowHeight * 0.2));
                        }
                    }
                    
                    darkModeScrollOverlay.style.opacity = currentOpacity;
                    darkModeScrollOverlay.classList.toggle('visible', currentOpacity > 0);
                }

                // Video presentation section reveal
                // ... existing code ...
            });
        }
    }

    // Fade transition when switching sections without overlap
    let switchShowTimer = null;
    function switchSection(targetId) {
        // Cancel any pending fade timers
        clearTimeout(switchShowTimer);

        // Update the navigation box title immediately
        const nextSection = document.getElementById(targetId);
        const navNameEl = document.querySelector('.current-section-name');
        if (navNameEl && nextSection) {
            const heading = nextSection.querySelector('h2');
            if (heading) navNameEl.textContent = heading.textContent;
        }

        // Reset all sections to avoid overlap
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('visible');
            sec.style.transition = '';
            sec.style.opacity = '';
            sec.style.transform = '';
        });

        // If the target exists, scroll and fade it in
        if (nextSection) {
            // Mark visited and remove overlay
            visitedSections.add(targetId);
            checkAndShowRegistration();
            ensureOverlayRemoved();

            // Scroll to top
            smoothScrollToTop();

            // Prepare fade-in
            nextSection.style.opacity = '0';
            nextSection.style.transform = 'translateY(20px)';
            nextSection.classList.add('visible');
            nextSection.getBoundingClientRect(); // trigger reflow
            nextSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            nextSection.style.opacity = '1';
            nextSection.style.transform = 'translateY(0)';

            // Clear inline styles after animation
            switchShowTimer = setTimeout(() => {
                nextSection.style.transition = '';
                nextSection.style.opacity = '';
                nextSection.style.transform = '';
            }, 800);
        }
    }

    // Check if we should show the registration button based on scroll
    function shouldShowRegistrationButton() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const threshold = windowHeight * 0.3; // Show after scrolling 30% of viewport height
        return scrollPosition > threshold;
    }

    function handleScroll() {
        if (isHandlingScroll) return;
        isHandlingScroll = true;

        requestAnimationFrame(() => {
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.body.scrollHeight;

            // Handle light mode scroll banner opacity (parallax effect)
            if (lightModeScrollBanner && htmlElement.getAttribute('data-theme') === 'light') {
                // Adjust this factor to control parallax speed and intensity
                const parallaxFactor = 0.3; 
                // Start fading out completely once the video section is fully visible or site expanded
                const fadeOutStart = videoPresentationSection.offsetTop - windowHeight * 0.2; 
                
                let opacity;
                if (isSiteExpanded || scrollPosition > fadeOutStart) {
                    opacity = Math.max(0, 1 - (scrollPosition - fadeOutStart) / (windowHeight * 0.3));
                } else {
                    opacity = Math.min(0.6, scrollPosition / (windowHeight * 0.7));
                }
                lightModeScrollBanner.style.opacity = opacity;
                lightModeScrollBanner.classList.toggle('visible', opacity > 0);
            } else if (lightModeScrollBanner) {
                lightModeScrollBanner.style.opacity = '0';
                lightModeScrollBanner.classList.remove('visible');
            }

            // Handle dark mode scroll overlay opacity
            if (darkModeScrollOverlay) {
                // Read the max opacity from the CSS custom property
                const maxOpacity = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--dark-mode-scroll-overlay-max-opacity').trim()) || 0.7;
                // Make the darkening effect happen over a shorter scroll distance before expansion, longer after.
                // opacityFactor controls how quickly it reaches maxOpacity. Smaller = faster.
                const opacityFactor = isSiteExpanded ? 1.2 : 0.8; 
                let currentOpacity = Math.min(maxOpacity, scrollPosition / (windowHeight * opacityFactor));

                // If video section is visible, we might want to reduce or remove the overlay
                const videoSectionTop = videoPresentationSection.offsetTop;
                const videoSectionHeight = videoPresentationSection.offsetHeight;

                if (videoPresentationSection.style.display !== 'none' && videoPresentationSection.classList.contains('visible')) {
                    // Example: Start fading out the overlay when video section is halfway into view
                    const videoMidPoint = videoSectionTop + videoSectionHeight / 2 - windowHeight / 2;
                     if (scrollPosition > videoMidPoint) {
                        // Start reducing opacity or set to a lower fixed value if needed
                        // For now, let's ensure it doesn't interfere if video is prominent.
                        // This part might need more nuanced logic based on desired visual outcome.
                        // currentOpacity = Math.max(0, currentOpacity - (scrollPosition - videoMidPoint) / (windowHeight * 0.2));
                    }
                }
                
                darkModeScrollOverlay.style.opacity = currentOpacity;
                darkModeScrollOverlay.classList.toggle('visible', currentOpacity > 0);
            }

            // Video presentation section reveal
            // ... existing code ...
        });
    }
});