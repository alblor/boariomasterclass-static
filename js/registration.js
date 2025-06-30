/**
 * BoarioMasterclass Registration Form Handler
 * Enhanced with custom dropdowns, reCAPTCHA integration and improved backend connectivity
 * Connects to Firebase Cloud Functions backend with comprehensive error handling
 */

// Environment detection for emulator vs production
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '5002';

// Only log in development mode
const debugLog = (...args) => {
    if (isLocalhost) {
        console.log(...args);
    }
};

const debugError = (...args) => {
    if (isLocalhost) {
        console.error(...args);
    }
};

const debugWarn = (...args) => {
    if (isLocalhost) {
        console.warn(...args);
    }
};

// Firebase configuration - environment aware
// Production configuration from Firebase Console
const firebaseConfig = {
    apiKey: isLocalhost ? "demo-api-key" : "AIzaSyC6CkmL27m8yA3dBs0XZZXyn4jMzMI1yc",
    authDomain: "boariomasterclass-web.firebaseapp.com", 
    projectId: "boariomasterclass-web",
    storageBucket: "boariomasterclass-web.appspot.com",
    messagingSenderId: "821294767604",
    appId: isLocalhost ? "1:821294767604:web:demo-app-id" : "1:821294767604:web:boario-web-app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();

// Configure functions for correct region and emulator connection
if (isLocalhost) {
    // Development mode: Connect to emulators
    debugLog('🛠️ Development mode: Connecting to Firebase emulators');
    debugLog('🔧 Functions emulator: localhost:5001');
    
    // Connect to Functions emulator
    functions.useEmulator('localhost', 5001);
    
    // Set region for functions (critical for callable functions)
    // Note: firebase.functions() already defaults to us-central1, but our functions are in europe-west3
} else {
    // Production mode - connect to actual Firebase services
    debugLog('🚀 Production mode: Connecting to Firebase services in europe-west3');
}

// Get functions instance for the correct region
// For europe-west3 region (where our functions are deployed)
const functionsRegion = firebase.app().functions('europe-west3');

// If in emulator mode, connect regional functions to emulator too
if (isLocalhost) {
    functionsRegion.useEmulator('localhost', 5001);
}

// reCAPTCHA site key (use test key for development)
const RECAPTCHA_SITE_KEY = isLocalhost ? 
    '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' : // Test key for localhost
    '6LcqWOopAAAAAEIJPVGEzh-2vWbPUFTR9ioYhcGj'; // Production key

/**
 * Custom Select Dropdown Component
 * Handles the modern dropdown functionality matching the language selector design
 */
class CustomSelectDropdown {
    constructor(selectId, customSelectId, customMenuId, options = {}) {
        this.originalSelect = document.getElementById(selectId);
        this.customButton = document.getElementById(customSelectId);
        this.customMenu = document.getElementById(customMenuId);
        this.selectedValue = '';
        this.isOpen = false;
        this.options = options;
        
        debugLog(`🔧 CustomSelectDropdown for ${selectId}:`, {
            originalSelect: !!this.originalSelect,
            customButton: !!this.customButton,
            customMenu: !!this.customMenu
        });
        
        if (this.originalSelect && this.customButton && this.customMenu) {
            this.init();
        } else {
            debugError(`❌ Missing elements for ${selectId} dropdown`);
        }
    }
    
    init() {
        // Set up event listeners
        this.customButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            debugLog(`Click event fired on ${this.originalSelect.id} button`);
            this.toggle();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.customButton.contains(e.target) && !this.customMenu.contains(e.target)) {
                this.close();
            }
        });
        
        // Handle keyboard navigation
        this.customButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
        
        // Sync with original select changes
        this.originalSelect.addEventListener('change', () => {
            this.updateCustomFromOriginal();
        });
    }
    
    populateOptions(items) {
        debugLog(`📝 Populating ${this.originalSelect.id} with ${items.length} items`);
        
        // Clear existing options
        this.customMenu.innerHTML = '';
        
        // Add new options
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'menuitem');
            li.setAttribute('data-value', item.value);
            li.textContent = item.text;

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOption(item.value, item.text);
            });
            this.customMenu.appendChild(li);

        });
        
        // Also update the original select
        this.originalSelect.innerHTML = '<option value="">Seleziona...</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.text;
            this.originalSelect.appendChild(option);
        });
        
        debugLog(`✅ Populated ${this.originalSelect.id}: ${this.customMenu.children.length} options in menu`);
    }
    
    selectOption(value, text) {
        this.selectedValue = value;
        
        // Update custom button display
        const textSpan = this.customButton.querySelector('.custom-select-text');
        textSpan.textContent = text;
        textSpan.classList.remove('placeholder');
        
        // Update original select
        this.originalSelect.value = value;
        
        // Trigger change event on original select
        const changeEvent = new Event('change', { bubbles: true });
        this.originalSelect.dispatchEvent(changeEvent);
        
        // Update selected state in menu
        this.customMenu.querySelectorAll('li').forEach(li => {
            li.classList.remove('selected');
            if (li.getAttribute('data-value') === value) {
                li.classList.add('selected');
            }
        });
        
        // Clear any error state
        this.clearError();
        
        // Close dropdown
        this.close();
    }
    
    updateCustomFromOriginal() {
        const value = this.originalSelect.value;
        const selectedOption = this.originalSelect.querySelector(`option[value="${value}"]`);
        
        if (selectedOption && value) {
            const textSpan = this.customButton.querySelector('.custom-select-text');
            textSpan.textContent = selectedOption.textContent;
            textSpan.classList.remove('placeholder');
            this.selectedValue = value;
        } else {
            this.reset();
        }
    }
    
    reset() {
        const textSpan = this.customButton.querySelector('.custom-select-text');
        textSpan.textContent = this.options.placeholder || 'Seleziona...';
        textSpan.classList.add('placeholder');
        this.selectedValue = '';
        this.originalSelect.value = '';
        
        // Clear selected state in menu
        this.customMenu.querySelectorAll('li').forEach(li => {
            li.classList.remove('selected');
        });
    }
    
    toggle() {
        debugLog(`🔄 Toggle dropdown - currently ${this.isOpen ? 'open' : 'closed'}`);
        
        // Force a reflow in Safari before toggling
        void this.customMenu.offsetHeight;
        
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.customButton.setAttribute('aria-expanded', 'true');
        this.customMenu.classList.add('active');
        this.isOpen = true;
        
        // Add active class to wrapper for Safari z-index fix
        const wrapper = this.customButton.closest('.custom-select-wrapper');
        if (wrapper) {
            wrapper.classList.add('dropdown-active');
        }
        
        // Close other open dropdowns
        document.querySelectorAll('.custom-select-menu.active').forEach(menu => {
            if (menu !== this.customMenu) {
                menu.classList.remove('active');
                const button = menu.parentElement.querySelector('.custom-select-button');
                if (button) {
                    button.setAttribute('aria-expanded', 'false');
                }
                // Remove active class from other wrappers
                const otherWrapper = menu.closest('.custom-select-wrapper');
                if (otherWrapper) {
                    otherWrapper.classList.remove('dropdown-active');
                }
            }
        });
    }
    
    close() {
        this.customButton.setAttribute('aria-expanded', 'false');
        this.customMenu.classList.remove('active');
        this.isOpen = false;
        
        // Remove active class from wrapper
        const wrapper = this.customButton.closest('.custom-select-wrapper');
        if (wrapper) {
            wrapper.classList.remove('dropdown-active');
        }
    }
    
    setError() {
        this.customButton.classList.add('error');
    }
    
    clearError() {
        this.customButton.classList.remove('error');
    }
    
    getValue() {
        return this.selectedValue;
    }
    
    setValue(value) {
        const option = this.originalSelect.querySelector(`option[value="${value}"]`);
        if (option) {
            this.selectOption(value, option.textContent);
        }
    }
}

/**
 * Enhanced Registration Form Handler Class
 * Handles form submission, validation, reCAPTCHA, and backend integration with custom dropdowns
 */
class RegistrationFormHandler {
    constructor() {
        this.form = document.getElementById('registration-form');
        this.submitButton = document.getElementById('submit-btn');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        
        // Form validation state
        this.validationErrors = new Map();
        
        // Teacher data storage
        this.teachersData = null;
        this.instrumentTeacherMap = {};
        
        // Custom dropdown instances
        this.dropdowns = {};
        
        // Email validation state
        this.emailValidationTimeout = null;
        this.lastValidatedEmail = null;
        this.lastEmailValidationResult = null;
        this.isEmailValidationInProgress = false;
        
        // 1️⃣ Initialize custom dropdown components first so they are ready for population
        this.initializeCustomDropdowns();

        // 2️⃣ Load teacher data and populate dropdowns once available
        this.loadTeachersData().then(() => {
            // Dropdowns already instantiated
            this.initializeEventListeners();
            this.initializeRecaptcha();
        }).catch((err) => {
            debugError('⚠️ Continuing initialization after teacher data load failure', err);
            // Ensure the form remains functional even without teacher data
            this.useFallbackTeacherData();
            this.initializeEventListeners();
            this.initializeRecaptcha();
        });
    }

    /**
     * Initialize custom dropdown components
     */
    initializeCustomDropdowns() {
        debugLog('🎛️ Initializing custom dropdowns...');
        
        // Initialize custom dropdowns
        this.dropdowns.instrument = new CustomSelectDropdown(
            'instrument', 
            'instrument-select', 
            'instrument-menu',
            { placeholder: 'Seleziona strumento...' }
        );
        
        this.dropdowns.teacher = new CustomSelectDropdown(
            'teacherName', 
            'teacher-select', 
            'teacher-menu',
            { placeholder: 'Seleziona docente...' }
        );
        
        this.dropdowns.accommodation = new CustomSelectDropdown(
            'needsAccommodation', 
            'accommodation-select', 
            'accommodation-menu',
            { placeholder: 'Seleziona...' }
        );
        
        // Populate static accommodation options immediately
        if (this.dropdowns.accommodation) {
            this.dropdowns.accommodation.populateOptions([
                { value: 'true', text: 'Sì, ho bisogno di alloggio' },
                { value: 'false', text: 'No, ho già alloggio' }
            ]);
        }
        
        // Set up instrument to teacher filtering
        if (this.dropdowns.instrument && this.dropdowns.teacher) {
            document.getElementById('instrument').addEventListener('change', () => {
                this.filterTeachersByInstrument();
            });
        }
        
        debugLog('✅ Custom dropdowns initialized:', Object.keys(this.dropdowns));
    }

    /**
     * Load teachers data from JSON file
     */
    async loadTeachersData() {
        try {
            debugLog('📚 Loading teachers data from JSON...');
            const response = await fetch('/data/teachers-schedule.json');
            if (!response.ok) {
                throw new Error(`Failed to load teachers data: ${response.status}`);
            }
            
            this.teachersData = await response.json();
            debugLog('✅ Teachers data loaded:', this.teachersData);
            
            // Build instrument-teacher mapping
            this.instrumentTeacherMap = {};
            const uniqueInstruments = new Set();
            
            this.teachersData.teachers.forEach(teacher => {
                // Add to instrument mapping
                if (!this.instrumentTeacherMap[teacher.instrument]) {
                    this.instrumentTeacherMap[teacher.instrument] = [];
                }
                this.instrumentTeacherMap[teacher.instrument].push(teacher.teacherName);
                uniqueInstruments.add(teacher.instrument);
            });
            
            debugLog('📋 Instrument-Teacher mapping:', this.instrumentTeacherMap);
            
            // Populate the dropdowns
            this.populateInstrumentDropdown(Array.from(uniqueInstruments).sort());
            this.populateTeacherDropdown();
            
        } catch (error) {
            debugError('❌ Failed to load teachers data:', error);
            this.showError('Errore nel caricamento dei dati dei docenti. Ricarica la pagina e riprova.');
            
            // Fallback to static data if JSON fails to load
            this.useFallbackTeacherData();
        }
    }

    /**
     * Populate instrument dropdown
     */
    populateInstrumentDropdown(instruments) {
        if (!this.dropdowns.instrument) return;
        
        const items = instruments.map(instrument => ({
            value: instrument,
            text: instrument.charAt(0).toUpperCase() + instrument.slice(1)
        }));
        
        this.dropdowns.instrument.populateOptions(items);
    }

    /**
     * Populate teacher dropdown
     */
    populateTeacherDropdown() {
        if (!this.dropdowns.teacher) return;
        
        // Add all teachers sorted by name
        const allTeachers = this.teachersData.teachers
            .sort((a, b) => a.teacherName.localeCompare(b.teacherName));
        
        const items = allTeachers.map(teacher => ({
            value: teacher.teacherName,
            text: `${teacher.teacherName} (${teacher.instrument.charAt(0).toUpperCase() + teacher.instrument.slice(1)})`
        }));
        
        this.dropdowns.teacher.populateOptions(items);
    }

    /**
     * Filter teachers by selected instrument
     */
    filterTeachersByInstrument() {
        const selectedInstrument = document.getElementById('instrument').value;
        
        if (!selectedInstrument || !this.dropdowns.teacher) {
            // Show all teachers if no instrument selected
            this.populateTeacherDropdown();
            return;
        }
        
        // Filter teachers for the selected instrument
        const filteredTeachers = this.teachersData.teachers
            .filter(teacher => teacher.instrument === selectedInstrument)
            .sort((a, b) => a.teacherName.localeCompare(b.teacherName));
        
        const items = filteredTeachers.map(teacher => ({
            value: teacher.teacherName,
            text: teacher.teacherName
        }));
        
        this.dropdowns.teacher.populateOptions(items);
        
        // Reset teacher selection
        this.dropdowns.teacher.reset();
        
        debugLog(`🎯 Filtered teachers for ${selectedInstrument}:`, filteredTeachers.map(t => t.teacherName));
    }

    /**
     * Use fallback teacher data if JSON fails to load
     */
    useFallbackTeacherData() {
        debugWarn('⚠️ Using fallback teacher data');
        
        // Fallback data based on current static implementation
        this.instrumentTeacherMap = {
            'canto': ['Magdalena Aparta'],
            'clarinetto': ['Alessandro Travaglini'],
            'viola': ['Alessia Travaglini'],
            'chitarra': ['Luca Trabucchi', 'Liliana Pesaresi'],
            'violino': ['Gianmaria Bellisario', 'Anna Minella', 'Roberto Ranfaldi'],
            'violoncello': ['Claudio Pasceri'],
            'tromba': ['Alberto Brini'],
            'pianoforte': []
        };
        
        // Create fallback teacher data structure
        this.teachersData = { teachers: [] };
        Object.entries(this.instrumentTeacherMap).forEach(([instrument, teachers]) => {
            teachers.forEach(teacher => {
                this.teachersData.teachers.push({ teacherName: teacher, instrument });
            });
        });
        
        // Populate dropdowns with fallback data
        const instruments = Object.keys(this.instrumentTeacherMap).sort();
        this.populateInstrumentDropdown(instruments);
        this.populateTeacherDropdown();
    }

    /**
     * Validate email address using Zeruh API
     */
    async validateEmailAddress(email) {
        if (!email || !this.isValidEmail(email)) {
            this.hideEmailValidation();
            return null;
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        
        // Don't validate the same email multiple times
        if (normalizedEmail === this.lastValidatedEmail) {
            return null;
        }

        try {
            this.isEmailValidationInProgress = true;
            this.showEmailValidationChecking();
            
            debugLog('🔍 Validating email:', normalizedEmail);
            
            // Call the backend validation function
            const validateEmailFunction = functionsRegion.httpsCallable('validateEmailAddress');
            const result = await validateEmailFunction({
                email: normalizedEmail,
                userIp: this.getUserIP() // Optional, will be determined by backend if not provided
            });
            
            debugLog('✅ Email validation result:', result.data);
            
            this.lastValidatedEmail = normalizedEmail;
            this.lastEmailValidationResult = result.data;
            this.displayEmailValidationResult(result.data);
            
            return result.data;
            
        } catch (error) {
            debugError('❌ Email validation error:', error);
            this.showEmailValidationError('Unable to validate email address at the moment. You can continue with registration.');
            return null;
        } finally {
            this.isEmailValidationInProgress = false;
        }
    }

    /**
     * Show email validation checking state
     */
    showEmailValidationChecking() {
        const validationDiv = document.getElementById('email-validation-result');
        if (!validationDiv) return;
        
        validationDiv.className = 'email-validation-result checking';
        validationDiv.innerHTML = 'Verifying email address...';
        validationDiv.style.display = 'block';
    }

    /**
     * Display email validation result
     */
    displayEmailValidationResult(result) {
        const validationDiv = document.getElementById('email-validation-result');
        if (!validationDiv) return;

        if (result.isValid) {
            this.showEmailValidationSuccess(result);
        } else {
            this.showEmailValidationWarning(result);
        }
    }

    /**
     * Show successful email validation
     */
    showEmailValidationSuccess(result) {
        const validationDiv = document.getElementById('email-validation-result');
        
        let content = `<div>${result.message}</div>`;
        
        // Add details for transparency
        if (result.details && result.details.provider) {
            content += `<div class="email-validation-details">
                <span class="detail-item"><span class="label">Provider:</span> ${result.details.provider}</span>
                <span class="detail-item"><span class="label">Score:</span> ${result.score}/100</span>
            </div>`;
        }
        
        validationDiv.className = 'email-validation-result valid';
        validationDiv.innerHTML = content;
        validationDiv.style.display = 'block';
    }

    /**
     * Show email validation warning/error
     */
    showEmailValidationWarning(result) {
        const validationDiv = document.getElementById('email-validation-result');
        
        let content = `<div>${result.message}</div>`;
        
        // Add suggestion if available
        if (result.details && result.details.suggestion) {
            content += `<div class="email-validation-suggestion">
                Did you mean: <span class="suggestion-link" onclick="registrationHandler.applySuggestion('${result.details.suggestion}')">${result.details.suggestion}</span>?
            </div>`;
        }
        
        // Add additional details for transparency
        if (result.details) {
            const details = [];
            if (result.details.isDisposable) details.push('Temporary/Disposable');
            if (result.details.isFree) details.push('Free Provider');
            if (result.details.isRole) details.push('Role Account');
            
            if (details.length > 0) {
                content += `<div class="email-validation-details">
                    <span class="detail-item"><span class="label">Issues:</span> ${details.join(', ')}</span>
                    <span class="detail-item"><span class="label">Score:</span> ${result.score}/100</span>
                </div>`;
            }
        }
        
        validationDiv.className = 'email-validation-result invalid';
        validationDiv.innerHTML = content;
        validationDiv.style.display = 'block';
    }

    /**
     * Show email validation error (service unavailable)
     */
    showEmailValidationError(message) {
        const validationDiv = document.getElementById('email-validation-result');
        if (!validationDiv) return;
        
        validationDiv.className = 'email-validation-result warning';
        validationDiv.innerHTML = message;
        validationDiv.style.display = 'block';
    }

    /**
     * Hide email validation result
     */
    hideEmailValidation() {
        const validationDiv = document.getElementById('email-validation-result');
        if (!validationDiv) return;
        
        validationDiv.style.display = 'none';
        validationDiv.innerHTML = '';
        validationDiv.className = 'email-validation-result';
    }

    /**
     * Check email validation result before allowing form submission
     * @param {string} currentEmail - The email currently in the form
     * @returns {string|null} Error message if email is invalid, null if valid
     */
    checkEmailValidationBeforeSubmission(currentEmail) {
        // Normalize the current email for comparison
        const normalizedCurrentEmail = currentEmail.toLowerCase().trim();
        
        // If no validation has been performed for this email, it's suspicious
        if (!this.lastEmailValidationResult || this.lastValidatedEmail !== normalizedCurrentEmail) {
            return 'L\'indirizzo email deve essere validato prima dell\'invio. Attendi il completamento della verifica.';
        }

        // If email validation failed (score 0 or explicitly invalid)
        if (!this.lastEmailValidationResult.isValid) {
            const result = this.lastEmailValidationResult;
            
            // Check specific reasons for invalidity
            if (result.score === 0) {
                return 'L\'indirizzo email inserito non è valido (punteggio di qualità: 0/100). ' +
                       'Inserisci un indirizzo email valido e funzionante.';
            }
            
            if (result.isDisposable) {
                return 'Gli indirizzi email temporanei o usa-e-getta non sono accettati. ' +
                       'Utilizza un indirizzo email permanente.';
            }
            
            if (result.isUndeliverable) {
                return 'L\'indirizzo email inserito non può ricevere messaggi. ' +
                       'Verifica che sia corretto e funzionante.';
            }
            
            // Generic invalid email message
            return 'L\'indirizzo email inserito non è valido. Inserisci un indirizzo email corretto.';
        }

        // Email is valid, allow submission
        return null;
    }

    /**
     * Apply suggested email correction
     */
    applySuggestion(suggestion) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = suggestion;
            this.lastValidatedEmail = null; // Reset to trigger new validation
            this.validateEmailAddress(suggestion);
        }
    }

    /**
     * Get user IP (if available from browser, otherwise backend will determine it)
     */
    getUserIP() {
        // This is optional - the backend can determine the IP from the request
        // For now, we'll let the backend handle it
        return null;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        if (!this.form || !this.submitButton) {
            debugError('❌ Registration form elements not found');
            return;
        }

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmission();
        });

        // Birth date change for minor detection
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) {
            birthDateInput.addEventListener('change', (e) => {
                this.handleBirthDateChange(e.target.value);
            });
        }

        // Clear errors on input (no blur validation for unified banner approach)
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Only clear errors when user starts typing/changing
            input.addEventListener('input', () => this.clearFieldError(input));
            input.addEventListener('change', () => this.clearFieldError(input));
        });

        // Email validation with debouncing
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const email = e.target.value.trim();
                
                // Clear the timeout if user is still typing
                if (this.emailValidationTimeout) {
                    clearTimeout(this.emailValidationTimeout);
                }
                
                // Hide validation if email is empty or invalid format
                if (!email || !this.isValidEmail(email)) {
                    this.hideEmailValidation();
                    return;
                }
                
                // Debounce validation to avoid too many API calls
                this.emailValidationTimeout = setTimeout(() => {
                    if (!this.isEmailValidationInProgress) {
                        this.validateEmailAddress(email);
                    }
                }, 1000); // Wait 1 second after user stops typing
            });
            
            emailInput.addEventListener('blur', (e) => {
                const email = e.target.value.trim();
                if (email && this.isValidEmail(email) && email !== this.lastValidatedEmail) {
                    // Validate immediately on blur if not already validating
                    if (!this.isEmailValidationInProgress) {
                        this.validateEmailAddress(email);
                    }
                }
            });
        }

        // Instrument change for teacher filtering
        const instrumentSelect = document.getElementById('instrument');
        const teacherSelect = document.getElementById('teacherName');
        if (instrumentSelect && teacherSelect) {
            instrumentSelect.addEventListener('change', () => {
                this.filterTeachersByInstrument();
            });
        }

        debugLog('✅ Registration form initialized successfully');
    }

    /**
     * Initialize reCAPTCHA
     */
    async initializeRecaptcha() {
        try {
            // Wait for reCAPTCHA to load
            if (typeof grecaptcha === 'undefined') {
                debugLog('⏳ Waiting for reCAPTCHA to load...');
                setTimeout(() => this.initializeRecaptcha(), 100);
                return;
            }

            await grecaptcha.ready(() => {
                debugLog('✅ reCAPTCHA initialized successfully');
            });
        } catch (error) {
            debugWarn('⚠️ reCAPTCHA initialization failed:', error);
            // Continue without reCAPTCHA for development
        }
    }

    /**
     * Get reCAPTCHA token
     */
    async getRecaptchaToken() {
        try {
            if (typeof grecaptcha === 'undefined') {
                debugWarn('⚠️ reCAPTCHA not available, skipping verification');
                return null;
            }

            const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {
                action: 'registration_submit'
            });
            
            debugLog('✅ reCAPTCHA token obtained');
            return token;
        } catch (error) {
            debugWarn('⚠️ reCAPTCHA token generation failed:', error);
            return null;
        }
    }

    /**
     * Handle birth date change to show/hide parent field
     */
    handleBirthDateChange(birthDate) {
        const parentGroup = document.getElementById('parentGroup');
        const parentNameInput = document.getElementById('parentName');
        
        if (!parentGroup || !parentNameInput) return;

        const isMinor = this.isMinor(birthDate);
        
        if (isMinor) {
            parentGroup.style.display = 'block';
            parentNameInput.required = true;
            parentNameInput.closest('.form-group').querySelector('label').classList.add('required');
        } else {
            parentGroup.style.display = 'none';
            parentNameInput.required = false;
            parentNameInput.value = '';
            parentNameInput.closest('.form-group').querySelector('label').classList.remove('required');
        }
    }

    /**
     * Collect form data for submission
     */
    collectFormData() {
        // Safari-compatible data collection without optional chaining
        const getElementValue = (id) => {
            const el = document.getElementById(id);
            return el ? (el.value ? el.value.trim() : '') : '';
        };
        
        const getElementChecked = (id) => {
            const el = document.getElementById(id);
            return el ? el.checked : false;
        };
        
        const getElementRawValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        
        const data = {
            firstName: getElementValue('firstName'),
            lastName: getElementValue('lastName'),
            email: getElementValue('email').toLowerCase(),
            phone: getElementValue('phone'),
            birthDate: getElementRawValue('birthDate'),
            birthPlace: getElementValue('birthPlace'),
            homeAddress: getElementValue('homeAddress'),
            homeCity: getElementValue('homeCity'),
            codiceFiscale: getElementValue('codiceFiscale').toUpperCase(),
            parentName: getElementValue('parentName'),
            instrument: getElementRawValue('instrument'),
            teacherName: getElementRawValue('teacherName'),
            accompanistPieces: getElementValue('accompanistPieces'),
            needsAccommodation: getElementRawValue('needsAccommodation') === 'true',
            hasReadRegulations: getElementChecked('hasReadRegulations'),
            consentDataProcessing: getElementChecked('consentDataProcessing'),
            consentMarketing: getElementChecked('consentMarketing'),
            year: new Date().getFullYear(),
            language: 'it'
        };

        // Convert birth date to ISO format for backend
        if (data.birthDate) {
            data.birthDate = new Date(data.birthDate).toISOString();
        }

        return data;
    }

    /**
     * Validate individual field
     * @param {HTMLElement} field - The field to validate
     * @param {boolean} showFieldErrors - Whether to show individual field errors (default: false for unified banner)
     */
    validateField(field, showFieldErrors = false) {
        const fieldName = field.name;
        const value = field.type === 'select-one' ? field.value : (field.value ? field.value.trim() : '');
        const errors = [];

        // Clear previous errors only if showing field errors
        if (showFieldErrors) {
            this.clearFieldError(field);
        }

        // Required field validation
        if (field.hasAttribute('required') && (!value || value === '')) {
            const label = this.getFieldLabel(fieldName);
            debugLog('🔍 Field validation: ' + fieldName + ' -> ' + label);
            errors.push(label + ' è obbligatorio');
        }

        // Specific field validations
        switch (fieldName) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    errors.push('Inserisci un indirizzo email valido');
                }
                break;
            
            case 'codiceFiscale':
                if (value && !this.isValidCodiceFiscale(value)) {
                    errors.push('Il codice fiscale non è valido');
                }
                break;
            
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    errors.push('Inserisci un numero di telefono valido');
                }
                break;
            
            case 'birthDate':
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    if (birthDate >= today) {
                        errors.push('La data di nascita deve essere nel passato');
                    }
                    if (today.getFullYear() - birthDate.getFullYear() > 100) {
                        errors.push('La data di nascita non sembra corretta');
                    }
                }
                break;
                

        }

        if (errors.length > 0) {
            // Only set field error if showFieldErrors is true
            if (showFieldErrors) {
                this.setFieldError(field, errors[0]);
            }
            this.validationErrors.set(fieldName, errors[0]);
        } else {
            this.validationErrors.delete(fieldName);
        }

        return errors.length === 0;
    }

    /**
     * Validate all form data
     */
    validateFormData(data) {
        const errors = [];

        // Clear all previous validation errors and field error states
        this.validationErrors.clear();
        
        // Clear all field error states for unified banner approach
        const formFields = this.form.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            this.clearFieldError(field);
        });

        // Validate all fields (without showing individual errors)
        formFields.forEach(field => {
            this.validateField(field, false); // false = don't show field errors
        });

        // Additional cross-field validations
        if (this.isMinor(data.birthDate) && !data.parentName) {
            errors.push('È richiesto il nome del genitore/tutore per i minorenni');
        }

        if (!data.hasReadRegulations) {
            errors.push('Devi accettare il regolamento della masterclass');
        }

        if (!data.consentDataProcessing) {
            errors.push('Devi acconsentire al trattamento dei dati personali');
        }

        // Combine field errors with cross-field errors
        const allErrors = [...this.validationErrors.values(), ...errors];
        return allErrors;
    }

    /**
     * Handle form submission with enhanced error handling and reCAPTCHA
     */
    async handleSubmission() {
        try {
            this.setLoadingState(true);
            this.clearMessages();

            debugLog('🚀 Starting registration submission...');

            // Collect and validate form data
            const formData = this.collectFormData();
            const validationErrors = this.validateFormData(formData);

            if (validationErrors.length > 0) {
                this.showError(validationErrors, 'Errori di validazione');
                return;
            }

            // Check email validation result before submission
            const emailValidationError = this.checkEmailValidationBeforeSubmission(formData.email);
            if (emailValidationError) {
                this.showError([emailValidationError], 'Email non valida');
                return;
            }

            // Get reCAPTCHA token
            const recaptchaToken = await this.getRecaptchaToken();
            if (recaptchaToken) {
                formData.recaptchaToken = recaptchaToken;
            }

            debugLog('✅ Form data validated, submitting to backend...');

            // Submit to Firebase Cloud Function
            const submitRegistration = functionsRegion.httpsCallable('submitRegistration');
            const result = await submitRegistration(formData);

            debugLog('✅ Backend response received:', result.data);

            if (result.data.success) {
                this.showSuccess(
                    '<div style="text-align: center;">' +
                        '<h3 style="color: #2e7d32; margin-bottom: 1rem;">🎉 Iscrizione Inviata con Successo!</h3>' +
                        '<p><strong>Controlla la tua email</strong> per il link di verifica dello stato.</p>' +
                        '<p>Ti abbiamo inviato una conferma all\'indirizzo: <strong>' + formData.email + '</strong></p>' +
                        '<p style="font-size: 0.9rem; color: #666;">' +
                            'ID Iscrizione: <code>' + result.data.registrationId.substring(0, 8) + '...</code>' +
                        '</p>' +
                        '<div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">' +
                            '<p style="margin: 0; font-size: 0.9rem;">' +
                                '<strong>Prossimi passi:</strong><br>' +
                                '1. Controlla la tua casella di posta (anche lo spam)<br>' +
                                '2. Clicca sul link per seguire lo stato della tua candidatura<br>' +
                                '3. Le candidature vengono valutate manualmente dai nostri organizzatori<br>' +
                                '4. Riceverai una notifica via email appena avremo una risposta' +
                            '</p>' +
                        '</div>' +
                    '</div>'
                );
                
                // Reset form after successful submission
                this.form.reset();
                this.handleBirthDateChange(''); // Reset parent field visibility
                
                // Reset all custom dropdowns to their initial state
                this.resetCustomDropdowns();
                
                // Clear any email validation state
                this.hideEmailValidation();
                this.lastValidatedEmail = null;
                this.lastEmailValidationResult = null;
                
                // Scroll to success message
                this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            } else {
                throw new Error(result.data.message || 'Errore durante l\'invio dell\'iscrizione');
            }

        } catch (error) {
            debugError('❌ Registration submission error:', error);
            
            let errorMessage = 'Si è verificato un errore durante l\'invio dell\'iscrizione. Riprova più tardi.';
            
            // Handle specific error types
            if (error.code === 'functions/unauthenticated') {
                errorMessage = 'Errore di autenticazione. Ricarica la pagina e riprova.';
            } else if (error.code === 'functions/unavailable') {
                errorMessage = 'Il servizio è temporaneamente non disponibile. Riprova tra qualche minuto.';
            } else if (error.code === 'functions/deadline-exceeded') {
                errorMessage = 'La richiesta è andata in timeout. Controlla la tua connessione e riprova.';
            } else if (error.code === 'functions/already-exists') {
                errorMessage = 'Attenzione: Esiste già un\'iscrizione per questa email o codice fiscale per l\'anno 2025. ' +
                             'Se pensi si tratti di un errore, contattaci all\'email: boariomasterclass@gmail.com';
            } else if (error.code === 'functions/resource-exhausted') {
                errorMessage = 'Troppe richieste. Attendi qualche minuto prima di riprovare.';
            } else if (error.code === 'functions/invalid-argument') {
                errorMessage = 'Alcuni dati inseriti non sono validi. Controlla tutti i campi e riprova.';
            } else if (error.message) {
                // Extract meaningful error messages from backend
                if (error.message.includes('duplicate') || 
                    error.message.includes('esiste già') || 
                    error.message.includes('Un\'iscrizione per questa email') ||
                    error.message.includes('email or codice fiscale esiste già')) {
                    errorMessage = 'Attenzione: Esiste già un\'iscrizione per questa email o codice fiscale per l\'anno 2025. ' +
                                 'Se pensi si tratti di un errore, contattaci all\'email: boariomasterclass@gmail.com';
                } else if (error.message.includes('validation') || error.message.includes('Validation failed')) {
                    errorMessage = 'Alcuni dati inseriti non sono validi. Controlla tutti i campi e riprova.';
                } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
                    errorMessage = 'Troppe richieste. Attendi qualche minuto prima di riprovare.';
                } else if (error.message.includes('minor') || error.message.includes('genitore')) {
                    errorMessage = 'Per i candidati minorenni è obbligatorio specificare il nome del genitore/tutore.';
                } else if (error.message.includes('functions/internal') || 
                          error.message === 'internal' || 
                          error.code === 'functions/internal') {
                    // Handle generic internal errors - likely validation or duplicate issues
                    errorMessage = 'Si è verificato un problema durante la verifica dei dati. ' +
                                 'Potrebbe trattarsi di un\'iscrizione duplicata o di dati non validi. ' +
                                 'Se il problema persiste, contattaci all\'email: boariomasterclass@gmail.com';
                } else {
                    // Use the backend error message if it's user-friendly
                    errorMessage = error.message;
                }
            }
            
            this.showError([
                errorMessage,
                'Se il problema persiste, contattaci all\'email: boariomasterclass@gmail.com'
            ], 'Errore durante l\'invio dell\'iscrizione');
            
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Set loading state for form with enhanced UI feedback
     */
    setLoadingState(loading) {
        if (!this.submitButton) return;

        this.submitButton.disabled = loading;
        
        if (loading) {
            this.submitButton.classList.add('loading');
            this.submitButton.innerHTML = '<span class="spinner"></span>Invio in corso...';
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.innerHTML = '<span class="spinner"></span>Invia Iscrizione';
        }
        
        // Disable/enable form inputs during submission
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    /**
     * Set field error state - enhanced for custom dropdowns
     */
    setFieldError(field, message) {
        field.classList.add('error');
        field.title = message;
        
        // Handle error styling for custom dropdowns
        if (field.type === 'select-one' && field.style.display === 'none') {
            // This is a hidden select with custom dropdown
            const fieldName = field.name;
            if (fieldName === 'instrument' && this.dropdowns.instrument) {
                this.dropdowns.instrument.setError();
            } else if (fieldName === 'teacherName' && this.dropdowns.teacher) {
                this.dropdowns.teacher.setError();
            } else if (fieldName === 'needsAccommodation' && this.dropdowns.accommodation) {
                this.dropdowns.accommodation.setError();
            }
        }
    }

    /**
     * Clear field error state - enhanced for custom dropdowns
     */
    clearFieldError(field) {
        field.classList.remove('error');
        field.title = '';
        
        // Handle error clearing for custom dropdowns
        if (field.type === 'select-one' && field.style.display === 'none') {
            // This is a hidden select with custom dropdown
            const fieldName = field.name;
            if (fieldName === 'instrument' && this.dropdowns.instrument) {
                this.dropdowns.instrument.clearError();
            } else if (fieldName === 'teacherName' && this.dropdowns.teacher) {
                this.dropdowns.teacher.clearError();
            } else if (fieldName === 'needsAccommodation' && this.dropdowns.accommodation) {
                this.dropdowns.accommodation.clearError();
            }
        }
    }

    /**
     * Show unified error banner with professional structure
     * @param {string|Array} messages - Single message string or array of error messages
     * @param {string} title - Optional title for the error banner
     */
    showError(messages, title = 'Si sono verificati i seguenti errori') {
        if (!this.errorMessage) return;

        // Handle both string and array inputs
        const errorList = Array.isArray(messages) ? messages : 
                        typeof messages === 'string' && messages.includes('<br>') ? 
                        messages.split('<br>').map(msg => msg.replace(/^•\s*/, '').trim()).filter(msg => msg && !msg.match(/^<\/?strong>/)) :
                        [messages];

        // Build professional error banner HTML
        const errorHTML = `
            <div class="error-title">${title}</div>
            <ul class="error-list">
                ${errorList.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;

        this.errorMessage.innerHTML = errorHTML;
        this.errorMessage.classList.add('show');
        this.successMessage.classList.remove('show');
        
        // Scroll to error message with smooth animation
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest' 
        });
        
        // Focus on first invalid field if available
        const firstErrorField = this.form.querySelector('.error');
        if (firstErrorField) {
            setTimeout(() => {
                firstErrorField.focus();
            }, 500);
        }
    }

    /**
     * Show success message with enhanced styling
     */
    showSuccess(message) {
        if (!this.successMessage) return;

        this.successMessage.innerHTML = message;
        this.successMessage.classList.add('show');
        this.errorMessage.classList.remove('show');
        
        // Scroll to success message
        this.successMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest' 
        });
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.errorMessage) this.errorMessage.classList.remove('show');
        if (this.successMessage) this.successMessage.classList.remove('show');
    }

    /**
     * Reset all custom dropdowns to their initial state
     * This ensures that after successful form submission, all dropdowns are properly cleared
     */
    resetCustomDropdowns() {
        debugLog('🔄 Resetting all custom dropdowns...');
        
        // Reset all dropdown instances
        Object.keys(this.dropdowns).forEach(dropdownKey => {
            if (this.dropdowns[dropdownKey] && typeof this.dropdowns[dropdownKey].reset === 'function') {
                this.dropdowns[dropdownKey].reset();
                debugLog(`✅ Reset dropdown: ${dropdownKey}`);
            }
        });
        
        // After resetting instrument, teacher dropdown should be cleared and disabled
        // since no instrument is selected
        if (this.dropdowns.teacher) {
            this.dropdowns.teacher.populateOptions([]);
            this.dropdowns.teacher.customButton.disabled = true;
            this.dropdowns.teacher.customButton.classList.add('disabled');
            
            const teacherTextSpan = this.dropdowns.teacher.customButton.querySelector('.custom-select-text');
            if (teacherTextSpan) {
                teacherTextSpan.textContent = 'Prima seleziona uno strumento';
                teacherTextSpan.classList.add('placeholder');
            }
        }
        
        debugLog('✅ All custom dropdowns reset successfully');
    }

    /**
     * Enhanced validation utility functions
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Comprehensive Codice Fiscale validation based on official Italian government rules
     * Source: https://www.studioaleo.it/struttura-codice-fiscale.html
     * 
     * Structure: AAABBB##C##D###E
     * AAA: 3 letters for surname (cognome)
     * BBB: 3 letters for name (nome)  
     * ##: 2 digits for birth year
     * C: 1 letter for birth month (A=Gen, B=Feb, C=Mar, D=Apr, E=Mag, H=Giu, L=Lug, M=Ago, P=Set, R=Ott, S=Nov, T=Dic)
     * ##: 2 digits for birth day + gender (M: 01-31, F: 41-71)
     * D###: 4 chars for birth place (1 letter + 3 digits)
     * E: 1 control character
     */
    isValidCodiceFiscale(cf) {
        if (!cf || typeof cf !== 'string') {
            return false;
        }

        // Convert to uppercase and remove spaces
        const cleanCF = cf.toUpperCase().replace(/\s/g, '');
        
        // Check basic format: 16 characters, correct pattern
        const basicPattern = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
        if (!basicPattern.test(cleanCF)) {
            return false;
        }

        // Extract components for detailed validation
        const surname = cleanCF.substring(0, 3);
        const name = cleanCF.substring(3, 6);
        const year = cleanCF.substring(6, 8);
        const month = cleanCF.substring(8, 9);
        const day = cleanCF.substring(9, 11);
        const place = cleanCF.substring(11, 15);
        const control = cleanCF.substring(15, 16);

        // Validate month code (official Italian months)
        const validMonths = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        if (!validMonths.includes(month)) {
            return false;
        }

        // Validate day + gender code (01-31 for males, 41-71 for females)
        const dayNum = parseInt(day, 10);
        if (dayNum < 1 || (dayNum > 31 && dayNum < 41) || dayNum > 71) {
            return false;
        }

        // Validate birth place format (1 letter + 3 digits)
        const placePattern = /^[A-Z][0-9]{3}$/;
        if (!placePattern.test(place)) {
            return false;
        }

        // Validate control character using official algorithm
        if (!this.validateCodiceFiscaleControlChar(cleanCF)) {
            return false;
        }

        return true;
    }

    /**
     * Validate Codice Fiscale control character using official Italian algorithm
     * Based on D.M. n° 345 del 23/12/1976 - Articolo 7
     */
    validateCodiceFiscaleControlChar(cf) {
        const first15 = cf.substring(0, 15);
        const providedControl = cf.substring(15, 16);

        // Conversion tables for odd positions (1st, 3rd, 5th, etc.)
        const oddConversion = {
            'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19,
            'J': 21, 'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8,
            'S': 12, 'T': 14, 'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23,
            '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21
        };

        // Conversion tables for even positions (2nd, 4th, 6th, etc.)
        const evenConversion = {
            'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8,
            'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17,
            'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25,
            '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
        };

        // Control character conversion table
        const controlConversion = {
            0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I',
            9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q',
            17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z'
        };

        let sum = 0;

        // Calculate sum using official conversion tables
        for (let i = 0; i < 15; i++) {
            const char = first15.charAt(i);
            const position = i + 1; // 1-based position

            if (position % 2 === 1) {
                // Odd position (1st, 3rd, 5th, etc.)
                sum += oddConversion[char] || 0;
            } else {
                // Even position (2nd, 4th, 6th, etc.)
                sum += evenConversion[char] || 0;
            }
        }

        // Calculate remainder and get control character
        const remainder = sum % 26;
        const calculatedControl = controlConversion[remainder];

        return calculatedControl === providedControl;
    }

    isValidPhone(phone) {
        const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/;
        return phoneRegex.test(phone);
    }

    isMinor(birthDate) {
        if (!birthDate) return false;
        
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return (age - 1) < 18;
        }
        return age < 18;
    }

    getFieldLabel(field) {
        const labels = {
            firstName: 'Nome',
            lastName: 'Cognome',
            email: 'Email',
            phone: 'Telefono',
            birthDate: 'Data di Nascita',
            birthPlace: 'Luogo di Nascita',
            homeAddress: 'Indirizzo di Residenza',
            homeCity: 'Città di Residenza',
            codiceFiscale: 'Codice Fiscale',
            instrument: 'Strumento',
            teacherName: 'Docente Preferito',
            parentName: 'Nome del Genitore/Tutore',
            needsAccommodation: 'Necessità Alloggio'
        };
        return labels[field] || field;
    }
}

/**
 * Initialize form handler when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    debugLog('🎵 BoarioMasterclass Registration Form - Initializing...');
    // Make the handler globally accessible for suggestion click functionality
    window.registrationHandler = new RegistrationFormHandler();
}); 