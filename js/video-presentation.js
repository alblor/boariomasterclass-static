document.addEventListener('DOMContentLoaded', () => {
    const heroSectionContainer = document.querySelector('.hero-section-container');
    const masterclassInfoContainer = document.querySelector('.masterclass-info-container');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const galleryDotsContainer = document.querySelector('.gallery-dots-container');
    const videoPromptSection = document.querySelector('.video-prompt-section');
    const videoPromptBanner = document.querySelector('.video-prompt-banner');
    const bottomBar = document.querySelector('.bottom-bar'); // Added footer reference

    const videoPresentationSection = document.getElementById('video-presentation-section');
    const gradientOverlay = videoPresentationSection ? videoPresentationSection.querySelector('.video-presentation-gradient-overlay') : null;
    const heroContent = heroSectionContainer ? heroSectionContainer.querySelector('.hero-content') : null;
    const siteTitleContainer = heroSectionContainer ? heroSectionContainer.querySelector('.title-container') : null;
    const pentagramSVG = heroSectionContainer ? heroSectionContainer.querySelector('.pentagram-svg') : null;
    const decorativeNotes = heroSectionContainer ? heroSectionContainer.querySelectorAll('.musical-note-svg') : [];

    // --- NEW/MODIFIED FOR SCROLL EFFECTS ---
    const pageBackground = document.querySelector('.page-background'); // Main scrolling background
    const lightModeBanner = document.getElementById('light-mode-scroll-banner'); // Specific banner for light mode
    const darkModeScrollOverlay = document.getElementById('dark-mode-scroll-overlay'); // New dark mode overlay
    const initialPageHeight = document.documentElement.scrollHeight; // Page height BEFORE video section is shown
    const initialScrollableArea = Math.max(0, initialPageHeight - window.innerHeight); // Initial scrollable distance
    // --- END NEW/MODIFIED ---

    let isScrollingActive = false;
    let videoSectionRevealed = false;
    let isVideoFunctionalityEnabled = true; // New flag to control video functionality
    const scrollThreshold = 200; // Pixels to scroll before full transition
    let hideVideoSectionTimeout = null; // Timeout to hide video section after revert

    // Check initial state
    function checkInitialState() {
        // Check if website is already expanded
        if (document.body.classList.contains('site-expanding') || 
            localStorage.getItem('boarioMasterclassState') === 'expanded') {
            isVideoFunctionalityEnabled = false;
            // Hide video section and scroll prompt
            if (videoPresentationSection) {
                videoPresentationSection.style.display = 'none';
            }
            if (videoPromptSection) {
                videoPromptSection.style.display = 'none';
            }
            return false;
        }
        return true;
    }

    // Initialize based on state
    isVideoFunctionalityEnabled = checkInitialState();

    // Disable video functionality when website is expanded
    window.addEventListener('websiteExpanded', () => {
        isVideoFunctionalityEnabled = false;
        // Hide video section and scroll prompt if they're visible
        if (videoPresentationSection) {
            videoPresentationSection.style.display = 'none';
            videoPresentationSection.classList.remove('visible');
        }
        if (videoPromptSection) {
            videoPromptSection.style.display = 'none';
        }

        // --- RESET SCROLL EFFECTS ON EXPAND --- 
        if (pageBackground) {
            pageBackground.style.filter = '';
            pageBackground.style.animation = ''; // Resume pulsing animation
        }
        if (lightModeBanner) {
            lightModeBanner.classList.remove('visible');
        }
        if (darkModeScrollOverlay) { // Reset dark mode overlay
            darkModeScrollOverlay.classList.remove('visible');
            darkModeScrollOverlay.style.opacity = 0;
        }
        // --- END RESET ---

        // Reset states
        isScrollingActive = false;
        videoSectionRevealed = false;
        // Remove scroll event listener
        window.removeEventListener('scroll', handleScroll);
    });

    function updateHeroElementsOpacity(scrollProgress) {
        // Fade out elements that are not part of the fixed view
        const opacity = Math.max(0, 1 - scrollProgress * 2); // Faster fade for these elements
        if (masterclassInfoContainer) masterclassInfoContainer.style.opacity = opacity;
        if (learnMoreBtn) learnMoreBtn.style.opacity = opacity;
        if (galleryDotsContainer) galleryDotsContainer.style.opacity = opacity;
        if (videoPromptSection) videoPromptSection.style.opacity = opacity;

        // Window box (masterclass-info-container and other elements in hero-content but not title)
        // The SVG overlay elements (pentagram, notes) should fade with heroContent
        if (heroContent && !siteTitleContainer.contains(heroContent)) { // Ensure heroContent is not the title itself
            Array.from(heroContent.children).forEach(child => {
                if (child !== siteTitleContainer && !child.classList.contains('svg-overlay') && child !== videoPromptSection && child !== learnMoreBtn && child !== galleryDotsContainer && child !== masterclassInfoContainer) {
                    child.style.opacity = opacity;
                }
            });
        }
        if (pentagramSVG) pentagramSVG.style.opacity = Math.max(0, 1 - scrollProgress * 1.5);
        decorativeNotes.forEach(note => note.style.opacity = Math.max(0, 1 - scrollProgress * 1.5));
    }

    function handleScroll() {
        // Exit early if video functionality is disabled
        if (!isVideoFunctionalityEnabled) return;

        const scrollY = window.scrollY;
        // Use the initial scrollable area for progress calculation, or viewport height if no scroll initially
        const scrollableHeightForProgress = initialScrollableArea > 0 ? initialScrollableArea : window.innerHeight;
        const scrollProgress = Math.min(1, scrollY / scrollableHeightForProgress);

        // Activate scrolling state (adds helper classes & ensures video section occupies layout)
        if (scrollProgress > 0 && !isScrollingActive) {
            // User scrolled down again: clear pending hide timeout
            if (hideVideoSectionTimeout) clearTimeout(hideVideoSectionTimeout);
            isScrollingActive = true;
            if (heroSectionContainer) heroSectionContainer.classList.add('scrolling-active');
            if (videoPresentationSection) videoPresentationSection.style.display = 'flex';

            // Pause background pulse animation when scroll starts
            if (pageBackground) {
                pageBackground.style.animationPlayState = 'paused';
            }
        }

        // Update hero elements opacity based on scroll
        updateHeroElementsOpacity(scrollProgress);

        const currentTheme = document.documentElement.getAttribute('data-theme');

        if (currentTheme === 'dark') {
            // DARK MODE: Dim the main page background AND show dark overlay
            if (pageBackground) {
                // Cap brightness to 0.35 minimum for visibility
                const minBrightness = 0.35;
                const brightnessValue = Math.max(minBrightness, 1 - 0.65 * scrollProgress); // Dim from 1 to 0.35
                pageBackground.style.filter = `brightness(${brightnessValue}) saturate(0.7)`;
            }
            if (darkModeScrollOverlay) {
                // Use CSS variable for max opacity
                const cssMaxOpacity = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dark-mode-scroll-overlay-max-opacity')) || 0.45;
                const overlayOpacity = Math.min(cssMaxOpacity, scrollProgress * cssMaxOpacity);
                darkModeScrollOverlay.style.opacity = overlayOpacity;
                darkModeScrollOverlay.classList.toggle('visible', overlayOpacity > 0.01);
            }
            if (lightModeBanner) { // Ensure light banner is hidden
                lightModeBanner.classList.remove('visible');
                lightModeBanner.style.opacity = 0;
            }
        } else {
            // LIGHT MODE: Show the dedicated light mode banner
            if (lightModeBanner) {
                lightModeBanner.style.opacity = scrollProgress; // Fade in banner with scroll
                lightModeBanner.classList.toggle('visible', scrollProgress > 0.01); // Use class for visibility state management
            }
            if (darkModeScrollOverlay) { // Ensure dark overlay is hidden
                darkModeScrollOverlay.classList.remove('visible');
                darkModeScrollOverlay.style.opacity = 0;
            }
            if (pageBackground) pageBackground.style.filter = ''; // Ensure no brightness filter on main bg in light mode
        }

        // Gradient overlay animation (for video section)
        if (gradientOverlay) {
            const gradientHeight = Math.min(60, scrollProgress * 60); // Max 60% height
            const gradientOpacity = Math.min(0.7, scrollProgress * 0.7); // Max 0.7 opacity
            gradientOverlay.style.height = `${gradientHeight}%`;
            gradientOverlay.style.opacity = gradientOpacity;
        }

        // Reveal video section when the hero section has fully scrolled out of view
        const heroOutOfView = heroSectionContainer && heroSectionContainer.getBoundingClientRect().bottom <= 0;

        if (heroOutOfView && !videoSectionRevealed) {
            if (videoPresentationSection) {
                videoPresentationSection.classList.add('visible');
                document.body.classList.add('video-open');
                if (bottomBar) bottomBar.classList.add('footer-hidden-by-video'); // Hide footer
                // Scroll to the top of the video section for user visibility
                setTimeout(() => {
                    videoPresentationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100); // 100ms delay, can be adjusted
            }
            videoSectionRevealed = true;
        }

        // Handle scrolling back up (hide video section again when hero reappears)
        if (!heroOutOfView && videoSectionRevealed) {
            if (videoPresentationSection) {
                videoPresentationSection.classList.remove('visible');
                document.body.classList.remove('video-open');
                videoPresentationSection.style.display = 'none';  // Hide immediately to avoid overlay
                // Note: Footer remains hidden until scrolled fully to top
            }
            videoSectionRevealed = false;
        }

        if (scrollProgress <= 0 && isScrollingActive) {
            // Fully reset when scrolled back to top
            isScrollingActive = false;
            if (heroSectionContainer) heroSectionContainer.classList.remove('scrolling-active');
            updateHeroElementsOpacity(0);
            if (gradientOverlay) {
                gradientOverlay.style.height = '0%';
                gradientOverlay.style.opacity = '0';
            }
            // Reset background effects
            if (pageBackground) {
                pageBackground.style.filter = '';
                pageBackground.style.animationPlayState = 'running'; // Resume pulsing animation
            }
            if (lightModeBanner) {
                lightModeBanner.classList.remove('visible');
                lightModeBanner.style.opacity = 0;
            }
            if (darkModeScrollOverlay) { // Reset dark mode overlay
                darkModeScrollOverlay.classList.remove('visible');
                darkModeScrollOverlay.style.opacity = 0;
            }
            if (videoPresentationSection) {
                // Remove visible class to play revert transition
                videoPresentationSection.classList.remove('visible');
                document.body.classList.remove('video-open');
                // After transition ends (~0.8s), hide section and show footer
                clearTimeout(hideVideoSectionTimeout); // Clear any existing timeout
                hideVideoSectionTimeout = setTimeout(() => {
                    if (videoPresentationSection) videoPresentationSection.style.display = 'none';
                    if (bottomBar) bottomBar.classList.remove('footer-hidden-by-video'); // Show footer
                }, 800); // Delay matches video section hide logic
            }
        }
    }

    // Only add scroll listener if video functionality is enabled
    if (isVideoFunctionalityEnabled) {
        window.addEventListener('scroll', handleScroll);
    }

    // Video player logic
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const videoId = button.dataset.videoId;
            const video = document.getElementById(videoId);
            if (video) {
                if (video.paused || video.ended) {
                    // Pause other videos if any are playing
                    document.querySelectorAll('video').forEach(v => {
                        if (v !== video && !v.paused) {
                            v.pause();
                            const otherButton = document.querySelector(`.play-button[data-video-id="${v.id}"]`);
                            if (otherButton) otherButton.style.display = 'flex';
                        }
                    });
                    // Enable native controls for universal fallback
                    video.setAttribute('controls', '');
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    });

    // Add event listeners to videos themselves for play/pause and to manage button visibility
    document.querySelectorAll('.video-player video').forEach(video => {
        const playButton = document.querySelector(`.play-button[data-video-id="${video.id}"]`);

        // Click on video to toggle play/pause
        video.addEventListener('click', () => {
            if (video.hasAttribute('controls')) return;  // Skip custom handling when native controls are active
            if (video.paused || video.ended) {
                // Pause other videos if any are playing
                document.querySelectorAll('video').forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        const otherButton = document.querySelector(`.play-button[data-video-id="${v.id}"]`);
                        if (otherButton) otherButton.style.display = 'flex';
                    }
                });
                // Enable native controls and reload metadata for universal fallback
                video.setAttribute('controls', '');
                video.play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            if (playButton) playButton.style.display = 'none';
            video.classList.add('playing');
        });

        video.addEventListener('pause', () => {
            if (playButton) playButton.style.display = 'flex';
            video.classList.remove('playing');
        });

        video.addEventListener('ended', () => {
            if (playButton) playButton.style.display = 'flex';
            video.classList.remove('playing');
            video.currentTime = 0; // Optional: Reset video to start
        });
    });

    // Initial setup for play button visibility based on video state (e.g., if browser preloads and pauses)
    document.querySelectorAll('.video-player video').forEach(video => {
        const playButton = document.querySelector(`.play-button[data-video-id="${video.id}"]`);
        if (playButton) {
            if (video.paused || video.ended) {
                playButton.style.display = 'flex';
                video.classList.remove('playing');
            } else {
                playButton.style.display = 'none';
                video.classList.add('playing');
            }
        }
    });

    // Ensure hero content is above the video section initially if there's overlap concern
    if (heroSectionContainer) heroSectionContainer.style.zIndex = '5';
    if (videoPresentationSection) videoPresentationSection.style.zIndex = '1'; 

    // Call scroll handler once to set initial states if page loads scrolled
    // handleScroll(); // Might not be needed if videoPromptSection CSS animation handles its own intro

    // Listen for theme changes and update overlays immediately
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                // Re-apply scroll logic to update overlays
                handleScroll();
            }
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // iOS Safari fallback: hide custom play buttons and enable native controls
    const isiOS = /iP(ad|hone|od)/.test(navigator.platform) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isiOS) {
        document.querySelectorAll('.play-button').forEach(btn => btn.style.display = 'none');
        document.querySelectorAll('.video-player video').forEach(video => {
            video.setAttribute('controls', '');
        });
    }

    // Add click event to video prompt banner
    if (videoPromptBanner) {
        videoPromptBanner.addEventListener('click', () => {
            smoothScrollToVideoPresentation();
        });

        // Add keyboard accessibility
        videoPromptBanner.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                smoothScrollToVideoPresentation();
            }
        });

        // Make it focusable for accessibility
        videoPromptBanner.setAttribute('tabindex', '0');
        videoPromptBanner.setAttribute('role', 'button');
        videoPromptBanner.setAttribute('aria-label', 'Scroll to video presentation section');
    }

    // Smooth scroll function to video presentation section
    function smoothScrollToVideoPresentation() {
        if (!videoPresentationSection) return;

        // Add a subtle button press animation
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

        // Smooth scroll with easing
        const startTime = performance.now();
        
        function scrollStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const newPosition = currentPosition + (distance * easeOutCubic);
            
            window.scrollTo(0, newPosition);
            
            if (progress < 1) {
                requestAnimationFrame(scrollStep);
            } else {
                // Force trigger scroll handler to ensure everything is properly updated
                setTimeout(() => {
                    handleScroll();
                    // Double-check that we're at the right position
                    const finalPosition = window.pageYOffset;
                    const videoRect = videoPresentationSection.getBoundingClientRect();
                    
                    // If the video section title isn't well positioned, make a small adjustment
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
}); 