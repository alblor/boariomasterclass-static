/**
 * BoarioMasterclass Admin Dashboard - FIXED VERSION
 * Complete rewrite with proper authentication and matching design
 */

// Environment detection for emulator vs production
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port === '5002';

// Debug logging utility
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

// Firebase configuration - CORRECTED to match registration.js
const firebaseConfig = {
    apiKey: isLocalhost ? "demo-api-key" : "AIzaSyC6CkmL27m8yA3dBs0XZZXyn4jMzMI1yc",
    authDomain: "boariomasterclass-web.firebaseapp.com", 
    projectId: "boariomasterclass-web",
    storageBucket: "boariomasterclass-web.appspot.com",
    messagingSenderId: "821294767604",
    appId: isLocalhost ? "1:821294767604:web:demo-app-id" : "1:821294767604:web:boario-web-app"
};

// Initialize Firebase
let functions, functionsRegion;

try {
    firebase.initializeApp(firebaseConfig);
    functions = firebase.functions();
    
    // Configure functions for correct region and emulator connection
    if (isLocalhost) {
        debugLog('🛠️ Development mode: Connecting to Firebase emulators');
        functions.useEmulator('localhost', 5001);
    } else {
        debugLog('🚀 Production mode: Connecting to Firebase services in europe-west3');
    }
    
    // Get functions instance for the correct region (europe-west3)
    functionsRegion = firebase.app().functions('europe-west3');
    
    // If in emulator mode, connect regional functions to emulator too
    if (isLocalhost) {
        functionsRegion.useEmulator('localhost', 5001);
    }
    
} catch (error) {
    debugError('Firebase initialization failed:', error);
}

/**
 * Fixed Admin Dashboard Handler
 */
class AdminDashboardHandler {
    constructor() {
        this.currentPage = 1;
        this.registrationsPerPage = 20;
        this.allRegistrations = [];
        this.filteredRegistrations = [];
        this.currentUser = null;
        this.sessionToken = null;
        
        // UI Elements
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.registrationsSection = document.getElementById('registrations-section');
        this.emptyState = document.getElementById('empty-state');
        this.userInfo = document.getElementById('user-info');
        this.logoutBtn = document.getElementById('logout-btn');
        this.adminNavInfo = document.getElementById('admin-nav-info');
        
        this.init();
    }
    
    async init() {
        try {
            debugLog('🔐 Initializing admin dashboard...');
            
            // Check authentication
            const authResult = await this.checkAuthentication();
            
            if (!authResult.authenticated) {
                this.showError(authResult.reason || 'Accesso non autorizzato');
                return;
            }
            
            this.currentUser = authResult.adminUser;
            this.sessionToken = authResult.sessionToken;
            
            debugLog('✅ Authentication successful:', this.currentUser);
            
            // Update UI with user info
            this.updateUserInfo();
            
            // Load dashboard data
            await this.fetchRegistrations();
            
        } catch (error) {
            debugError('❌ Admin dashboard initialization error:', error);
            this.showError('Errore durante l\'inizializzazione della dashboard. Riprovare o contattare il supporto.');
        }
    }
    
    async checkAuthentication() {
        try {
            // Check for stored session token
            const storedToken = localStorage.getItem('adminSessionToken');
            
            if (storedToken) {
                debugLog('🔍 Validating stored session token...');
                
                const validationResult = await this.validateSession(storedToken);
                if (validationResult.valid) {
                    return {
                        authenticated: true,
                        adminUser: validationResult.adminUser,
                        sessionToken: storedToken
                    };
                } else {
                    debugLog('⚠️ Stored session token invalid, clearing...');
                    localStorage.removeItem('adminSessionToken');
                }
            }
            
            // Check for URL token parameter (from login redirect)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            
            if (urlToken) {
                debugLog('🔍 Validating URL token...');
                
                const validationResult = await this.validateSession(urlToken);
                if (validationResult.valid) {
                    // Store token and clean URL
                    localStorage.setItem('adminSessionToken', urlToken);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    return {
                        authenticated: true,
                        adminUser: validationResult.adminUser,
                        sessionToken: urlToken
                    };
                }
            }
            
            // No valid authentication found
            return {
                authenticated: false,
                reason: 'No valid session or authentication found'
            };
            
        } catch (error) {
            debugError('Authentication check failed:', error);
            return {
                authenticated: false,
                reason: 'Authentication system error'
            };
        }
    }
    
    async validateSession(sessionToken) {
        try {
            if (!functionsRegion) {
                throw new Error('Firebase Functions not initialized');
            }
            
            const validateAdminSession = functionsRegion.httpsCallable('validateAdminSession');
            const result = await validateAdminSession({ sessionToken });
            
            if (result.data.success) {
                return {
                    valid: true,
                    adminUser: result.data.adminUser
                };
            } else {
                return { valid: false };
            }
            
        } catch (error) {
            debugError('Session validation failed:', error);
            return { valid: false };
        }
    }
    
    updateUserInfo() {
        if (this.userInfo && this.currentUser) {
            debugLog('🔧 Updating user info for:', this.currentUser.name);
            
            this.userInfo.innerHTML = `
                <div class="user-details">
                    <span class="user-name">${this.currentUser.name}</span>
                    <span class="user-role">${this.getRoleDisplayName(this.currentUser.role)}</span>
                </div>
            `;
            
            // Show admin navigation info
            if (this.adminNavInfo) {
                debugLog('🔧 Showing admin nav info');
                this.adminNavInfo.style.display = 'flex';
            } else {
                debugLog('⚠️ adminNavInfo element not found');
            }
            
            // Also add logout button to the main admin container as fallback
            this.addLogoutButtonToContainer();
        }
    }
    
    addLogoutButtonToContainer() {
        // Check if logout button already exists in container
        const existingLogout = document.getElementById('main-logout-btn');
        if (existingLogout) return;
        
        // Add logout button to admin title area
        const adminTitle = document.querySelector('.admin-title');
        if (adminTitle && this.currentUser) {
            const logoutContainer = document.createElement('div');
            logoutContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            `;
            
            const userWelcome = document.createElement('div');
            userWelcome.style.cssText = `
                color: var(--text-subtle-color);
                font-size: 0.9rem;
            `;
            userWelcome.innerHTML = `Benvenuto, <strong>${this.currentUser.name}</strong>`;
            
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'main-logout-btn';
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.onclick = () => this.logout();
            logoutBtn.style.cssText = `
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            `;
            logoutBtn.onmouseover = () => {
                logoutBtn.style.background = '#5a6268';
                logoutBtn.style.transform = 'translateY(-1px)';
            };
            logoutBtn.onmouseout = () => {
                logoutBtn.style.background = '#6c757d';
                logoutBtn.style.transform = 'translateY(0)';
            };
            
            logoutContainer.appendChild(userWelcome);
            logoutContainer.appendChild(logoutBtn);
            
            // Insert after admin title
            adminTitle.parentNode.insertBefore(logoutContainer, adminTitle.nextSibling);
        }
    }
    
    getRoleDisplayName(role) {
        const roleNames = {
            'super_admin': 'Super Amministratore',
            'artistic_director': 'Direttore Artistico',
            'admin_director': 'Direttore Amministrativo'
        };
        return roleNames[role] || 'Amministratore';
    }
    
    async fetchRegistrations() {
        try {
            debugLog('📊 Fetching registrations...');
            
            this.showLoading();
            
            if (!functionsRegion) {
                throw new Error('Firebase Functions not initialized');
            }
            
            // Use the new getAdminData callable function
            const getAdminData = functionsRegion.httpsCallable('getAdminData');
            const result = await getAdminData({ 
                sessionToken: this.sessionToken
            });
            
            if (result.data.success) {
                this.allRegistrations = result.data.registrations || [];
                this.filteredRegistrations = [...this.allRegistrations];
                
                debugLog('✅ Registrations loaded:', this.allRegistrations.length);
                
                // Update admin user info if provided
                if (result.data.adminUser && !this.currentUser) {
                    this.currentUser = result.data.adminUser;
                    this.updateUserInfo();
                }
                
                this.updateStatistics();
                this.renderRegistrations();
                this.showRegistrations();
            } else {
                throw new Error(result.data.error || 'Failed to fetch registrations');
            }
            
        } catch (error) {
            debugError('Failed to fetch registrations:', error);
            
            if (error.code === 'unauthenticated' || error.message.includes('unauthenticated') || error.message.includes('unauthorized')) {
                this.showError('Sessione scaduta. Effettua nuovamente il login.');
                this.logout();
            } else {
                this.showError('Errore nel caricamento delle iscrizioni: ' + error.message);
            }
        }
    }
    
    updateStatistics() {
        const stats = {
            total: this.allRegistrations.length,
            pending: this.allRegistrations.filter(r => r.status === 'pending').length,
            approved: this.allRegistrations.filter(r => r.status === 'approved').length,
            rejected: this.allRegistrations.filter(r => r.status === 'rejected').length
        };
        
        document.getElementById('total-registrations').textContent = stats.total;
        document.getElementById('pending-registrations').textContent = stats.pending;
        document.getElementById('approved-registrations').textContent = stats.approved;
        document.getElementById('rejected-registrations').textContent = stats.rejected;
    }
    
    renderRegistrations() {
        const tbody = document.getElementById('registrations-tbody');
        if (!tbody) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.registrationsPerPage;
        const endIndex = startIndex + this.registrationsPerPage;
        const pageRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
        
        if (pageRegistrations.length === 0) {
            this.showEmpty();
            return;
        }
        
        tbody.innerHTML = pageRegistrations.map(registration => this.renderRegistrationRow(registration)).join('');
        
        this.updatePagination();
    }
    
    renderRegistrationRow(registration) {
        const isMinor = registration.birthDate && this.calculateAge(registration.birthDate) < 18;
        const statusClass = `status-${registration.status}`;
        const statusText = {
            'pending': 'In Attesa',
            'approved': 'Approvata',
            'rejected': 'Rifiutata'
        }[registration.status] || registration.status;
        
        return `
            <tr class="registration-row" data-registration-id="${registration.id}" onclick="adminHandler.toggleRegistrationDetails('${registration.id}')">
                <td>
                    <span class="expand-icon">▶</span>
                </td>
                <td>
                    <div class="student-info">
                        ${registration.firstName} ${registration.lastName}
                        ${isMinor ? '<span class="minor-badge">MINORENNE</span>' : ''}
                    </div>
                    <div class="student-meta">
                        ${registration.email} • ${registration.codiceFiscale}
                    </div>
                </td>
                <td>
                    <div class="instrument-info">
                        <strong>${registration.instrument}</strong>
                    </div>
                    <div class="teacher-info">
                        ${registration.teacherName || 'Nessuna preferenza'}
                    </div>
                </td>
                <td>
                    ${this.formatDate(registration.submissionDate)}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="actions-cell" onclick="event.stopPropagation()">
                    ${registration.status === 'pending' ? `
                        <button class="btn btn-approve" onclick="adminHandler.moderateRegistration('${registration.id}', 'approve')">
                            Approva
                        </button>
                        <button class="btn btn-reject" onclick="adminHandler.moderateRegistration('${registration.id}', 'reject')">
                            Rifiuta
                        </button>
                    ` : ''}
                </td>
            </tr>
            <tr class="registration-details" id="details-${registration.id}">
                <td colspan="6">
                    <div class="details-content">
                        ${this.renderRegistrationDetails(registration)}
                        <div class="close-details">
                            <button class="btn" onclick="adminHandler.toggleRegistrationDetails('${registration.id}')">
                                Chiudi Dettagli
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }
    
    renderRegistrationDetails(registration) {
        const isMinor = registration.birthDate && this.calculateAge(registration.birthDate) < 18;
        const age = registration.birthDate ? this.calculateAge(registration.birthDate) : 'Non specificato';
        const needsAccommodation = registration.needsAccommodation === true ? 'Sì' : 
                                  registration.needsAccommodation === false ? 'No' : 'Non specificato';
        
        return `
            <div class="details-grid">
                <!-- Personal Information -->
                <div class="detail-section">
                    <h4>📋 Informazioni Personali</h4>
                    <div class="detail-field">
                        <div class="detail-label">Nome Completo</div>
                        <div class="detail-value">${registration.firstName} ${registration.lastName}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${registration.email}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Telefono</div>
                        <div class="detail-value">${registration.phone || '<span class="empty">Non fornito</span>'}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Data di Nascita</div>
                        <div class="detail-value">${registration.birthDate ? this.formatBirthDate(registration.birthDate) : 'Non specificata'} (${age} anni)</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Luogo di Nascita</div>
                        <div class="detail-value">${registration.birthPlace || '<span class="empty">Non specificato</span>'}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Codice Fiscale</div>
                        <div class="detail-value">${registration.codiceFiscale}</div>
                    </div>
                    ${isMinor ? `
                    <div class="detail-field">
                        <div class="detail-label">Genitore/Tutore</div>
                        <div class="detail-value">${registration.parentName || '<span class="empty">Non specificato</span>'}</div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Address Information -->
                <div class="detail-section">
                    <h4>🏠 Indirizzo di Residenza</h4>
                    <div class="detail-field">
                        <div class="detail-label">Indirizzo</div>
                        <div class="detail-value">${registration.homeAddress || '<span class="empty">Non specificato</span>'}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Città</div>
                        <div class="detail-value">${registration.homeCity || '<span class="empty">Non specificata</span>'}</div>
                    </div>
                </div>
                
                <!-- Musical Information -->
                <div class="detail-section">
                    <h4>🎵 Informazioni Musicali</h4>
                    <div class="detail-field">
                        <div class="detail-label">Strumento</div>
                        <div class="detail-value"><strong>${registration.instrument}</strong></div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Docente Preferito</div>
                        <div class="detail-value">${registration.teacherName || '<span class="empty">Nessuna preferenza</span>'}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Brani per Accompagnatore</div>
                        <div class="detail-value">${registration.accompanistPieces ? 
                            registration.accompanistPieces.split('\n').map(piece => `<div>• ${piece.trim()}</div>`).join('') : 
                            '<span class="empty">Nessun brano specificato</span>'}</div>
                    </div>
                </div>
                
                <!-- Accommodation Information -->
                <div class="detail-section">
                    <h4>🏨 Alloggio</h4>
                    <div class="detail-field">
                        <div class="detail-label">Necessità Alloggio</div>
                        <div class="detail-value">${needsAccommodation}</div>
                    </div>
                </div>
                
                <!-- Registration Status -->
                <div class="detail-section">
                    <h4>📊 Stato Iscrizione</h4>
                    <div class="detail-field">
                        <div class="detail-label">Stato Attuale</div>
                        <div class="detail-value">
                            <span class="status-badge status-${registration.status}">
                                ${{'pending': 'In Attesa', 'approved': 'Approvata', 'rejected': 'Rifiutata'}[registration.status] || registration.status}
                            </span>
                        </div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Data Invio</div>
                        <div class="detail-value">${this.formatDate(registration.submissionDate)}</div>
                    </div>
                    ${registration.moderatedAt ? `
                    <div class="detail-field">
                        <div class="detail-label">Data Moderazione</div>
                        <div class="detail-value">${this.formatDate(registration.moderatedAt)}</div>
                    </div>
                    ` : ''}
                    ${registration.moderatedBy ? `
                    <div class="detail-field">
                        <div class="detail-label">Moderato da</div>
                        <div class="detail-value">${registration.moderatedBy}</div>
                    </div>
                    ` : ''}
                    ${registration.rejectionReason ? `
                    <div class="detail-field">
                        <div class="detail-label">Motivo Rifiuto</div>
                        <div class="detail-value">${registration.rejectionReason}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    toggleRegistrationDetails(registrationId) {
        const row = document.querySelector(`tr[data-registration-id="${registrationId}"]`);
        const detailsRow = document.getElementById(`details-${registrationId}`);
        const expandIcon = row.querySelector('.expand-icon');
        
        if (detailsRow.classList.contains('expanded')) {
            // Collapse
            detailsRow.classList.remove('expanded');
            row.classList.remove('expanded');
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            // Expand
            detailsRow.classList.add('expanded');
            row.classList.add('expanded');
            expandIcon.style.transform = 'rotate(90deg)';
        }
    }
    
    formatBirthDate(birthDate) {
        try {
            // Handle both string and Firestore timestamp formats
            let date;
            if (birthDate && typeof birthDate === 'object' && birthDate.seconds) {
                // Firestore timestamp
                date = new Date(birthDate.seconds * 1000);
            } else if (birthDate) {
                // String or regular Date
                date = new Date(birthDate);
            } else {
                return 'Non specificata';
            }
            
            if (isNaN(date.getTime())) {
                return 'Data non valida';
            }
            
            return date.toLocaleDateString('it-IT');
        } catch (error) {
            return 'Data non valida';
        }
    }
    
    calculateAge(birthDate) {
        try {
            // Handle both string and Firestore timestamp formats
            let birth;
            if (birthDate && typeof birthDate === 'object' && birthDate.seconds) {
                // Firestore timestamp
                birth = new Date(birthDate.seconds * 1000);
            } else if (birthDate) {
                // String or regular Date
                birth = new Date(birthDate);
            } else {
                return 'Non specificato';
            }
            
            if (isNaN(birth.getTime())) {
                return 'Non specificato';
            }
            
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch (error) {
            return 'Non specificato';
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    async moderateRegistration(registrationId, action) {
        try {
            const actionText = action === 'approve' ? 'approvare' : 'rifiutare';
            
            if (!confirm(`Sei sicuro di voler ${actionText} questa iscrizione?`)) {
                return;
            }
            
            debugLog(`📝 Moderating registration ${registrationId}: ${action}`);
            
            const moderateRegistration = functionsRegion.httpsCallable('moderateRegistration');
            const result = await moderateRegistration({
                sessionToken: this.sessionToken,
                registrationId,
                action,
                reason: action === 'reject' ? 'Rejected by admin' : undefined
            });
            
            if (result.data.success) {
                debugLog('✅ Registration moderated successfully');
                
                // Update the registration in our local data
                const registration = this.allRegistrations.find(r => r.id === registrationId);
                if (registration) {
                    registration.status = action === 'approve' ? 'approved' : 'rejected';
                }
                
                // Refresh the display
                this.updateStatistics();
                this.renderRegistrations();
                
                // Show success message
                this.showMessage(`Iscrizione ${action === 'approve' ? 'approvata' : 'rifiutata'} con successo!`, 'success');
                
            } else {
                throw new Error(result.data.error || 'Moderation failed');
            }
            
        } catch (error) {
            debugError('Moderation failed:', error);
            this.showMessage('Errore durante la moderazione: ' + error.message, 'error');
        }
    }
    
    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const instrumentFilter = document.getElementById('instrument-filter').value;
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        
        this.filteredRegistrations = this.allRegistrations.filter(registration => {
            // Status filter
            if (statusFilter !== 'all' && registration.status !== statusFilter) {
                return false;
            }
            
            // Instrument filter
            if (instrumentFilter !== 'all' && registration.instrument !== instrumentFilter) {
                return false;
            }
            
            // Search filter
            if (searchInput) {
                const searchText = `${registration.firstName} ${registration.lastName} ${registration.email} ${registration.codiceFiscale}`.toLowerCase();
                if (!searchText.includes(searchInput)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.currentPage = 1;
        this.renderRegistrations();
    }
    
    clearFilters() {
        document.getElementById('status-filter').value = 'all';
        document.getElementById('instrument-filter').value = 'all';
        document.getElementById('search-input').value = '';
        
        this.filteredRegistrations = [...this.allRegistrations];
        this.currentPage = 1;
        this.renderRegistrations();
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderRegistrations();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredRegistrations.length / this.registrationsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderRegistrations();
        }
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredRegistrations.length / this.registrationsPerPage);
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (pageInfo) {
            pageInfo.textContent = `Pagina ${this.currentPage} di ${totalPages}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }
    }
    
    logout() {
        debugLog('🚪 Logging out...');
        
        // Clear stored session
        localStorage.removeItem('adminSessionToken');
        
        // Optionally call logout function
        if (functionsRegion) {
            try {
                const adminLogout = functionsRegion.httpsCallable('adminLogout');
                adminLogout({ sessionToken: this.sessionToken });
            } catch (error) {
                debugError('Logout function failed:', error);
            }
        }
        
        // Redirect to login
        window.location.href = 'admin-login.html';
    }
    
    retry() {
        window.location.reload();
    }
    
    // UI State Management
    showLoading() {
        this.hideAllStates();
        if (this.loadingState) this.loadingState.style.display = 'block';
    }
    
    showError(message, showLoginLink = false) {
        this.hideAllStates();
        if (this.errorState) {
            this.errorState.style.display = 'block';
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            
            // Show/hide login link
            const loginLink = this.errorState.querySelector('a[href="login.html"]');
            if (loginLink) {
                loginLink.style.display = showLoginLink ? 'inline-block' : 'none';
            }
        }
    }
    
    showRegistrations() {
        this.hideAllStates();
        if (this.registrationsSection) this.registrationsSection.style.display = 'block';
    }
    
    showEmpty() {
        this.hideAllStates();
        if (this.emptyState) this.emptyState.style.display = 'block';
    }
    
    hideAllStates() {
        [this.loadingState, this.errorState, this.registrationsSection, this.emptyState].forEach(element => {
            if (element) element.style.display = 'none';
        });
    }
    
    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `admin-message admin-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize admin dashboard when page loads
let adminHandler;
document.addEventListener('DOMContentLoaded', () => {
    adminHandler = new AdminDashboardHandler();
});

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);