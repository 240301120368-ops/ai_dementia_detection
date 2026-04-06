document.addEventListener('DOMContentLoaded', function () {
    // --- Constants ---
    const backendUrl = 'http://localhost:8000';

    // --- State ---
    let state = {
        token: localStorage.getItem('neurocare-token') || null,
        temp_token: null, // For 2FA flow
        user: null,
    };

    // --- DOM Elements ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const mobileLoginSignupBtn = document.getElementById('mobile-login-signup-btn');
    const userMenu = document.getElementById('user-menu');
    const logoutBtn = document.getElementById('logout-btn');

    // Modals
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal');
    const closeSignupModalBtn = document.getElementById('close-signup-modal');
    const showSignupLink = document.getElementById('show-signup-link');
    const showLoginLink = document.getElementById('show-login-link');

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const signupPasswordInput = document.getElementById('signup-password');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const signupSuccess = document.getElementById('signup-success');

    // Forgot Password Modal
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const closeForgotPasswordModalBtn = document.getElementById('close-forgot-password-modal');
    const showForgotPasswordLink = document.getElementById('show-forgot-password-link');
    const backToLoginLink = document.getElementById('back-to-login-link');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const forgotError = document.getElementById('forgot-error');
    const forgotSuccess = document.getElementById('forgot-success');

    // Password requirements UI
    const passwordRequirements = document.getElementById('password-requirements');
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    // Analysis
    const analysisForm = document.getElementById('analysis-form');
    const audioFileInput = document.getElementById('audio-file');
    const fileUploadText = document.getElementById('file-upload-text');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsLoading = document.getElementById('results-loading');
    const resultsContent = document.getElementById('results-content');
    const resultLabel = document.getElementById('result-label');
    const resultScore = document.getElementById('result-score');

    // Delete Account Elements
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // 2FA Elements
    const status2FAEnabled = document.getElementById('2fa-status-enabled');
    const status2FADisabled = document.getElementById('2fa-status-disabled');
    const enable2FABtn = document.getElementById('enable-2fa-btn');
    const showDisable2FAModalBtn = document.getElementById('show-disable-2fa-modal-btn');
    
    const setup2FAModal = document.getElementById('2fa-setup-modal');
    const closeSetup2FAModalBtn = document.getElementById('close-2fa-setup-modal');
    const qrCodeImg = document.getElementById('qr-code-img');
    const enable2FAForm = document.getElementById('2fa-enable-form');
    const enable2FAError = document.getElementById('2fa-enable-error');

    const disable2FAModal = document.getElementById('2fa-disable-modal');
    const closeDisable2FAModalBtn = document.getElementById('close-2fa-disable-modal');
    const disable2FAForm = document.getElementById('2fa-disable-form');
    const disable2FAError = document.getElementById('2fa-disable-error');

    const login2FAModal = document.getElementById('2fa-login-modal');
    const closeLogin2FAModalBtn = document.getElementById('close-2fa-login-modal');
    const verifyLoginForm = document.getElementById('2fa-verify-login-form');
    
    // New elements for camera and questionnaire
    const startCameraBtn = document.getElementById('start-camera-btn');
    const submitQuestionnaireBtn = document.getElementById('submit-questionnaire-btn');
    const crosshairLabel = document.querySelector('label[for="audio-file"]');


    // --- Functions ---

    const updateUIForLoginState = () => {
        if (state.token && state.user) {
            loginSignupBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userMenu.classList.add('lg:flex');
        } else {
            loginSignupBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
            userMenu.classList.remove('lg:flex');
        }

        // Update 2FA status on dashboard
        if (status2FAEnabled && status2FADisabled) {
            if (state.user && state.user.is_2fa_enabled) {
                status2FAEnabled.classList.remove('hidden');
                status2FADisabled.classList.add('hidden');
            } else {
                status2FAEnabled.classList.add('hidden');
                status2FADisabled.classList.remove('hidden');
            }
        }
    };

    const fetchCurrentUser = async () => {
        if (!state.token) return;
        try {
            const response = await fetch(`${backendUrl}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                },
            });
            if (!response.ok) {
                throw new Error('Session expired');
            }
            state.user = await response.json();
            updateUIForLoginState();
        } catch (error) {
            // Token is invalid, clear it
            state.token = null;
            state.user = null;
            localStorage.removeItem('neurocare-token');
            updateUIForLoginState();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const formData = new FormData(loginForm);

        try {
            const response = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Login failed.');
            }

            if (data.two_fa_required) {
                // 2FA is needed, store temp token and show 2FA modal
                state.temp_token = data.temp_token;
                loginModal.classList.add('hidden');
                login2FAModal.classList.replace('hidden', 'flex');
            } else {
                // No 2FA, complete login
                state.token = data.access_token;
                localStorage.setItem('neurocare-token', state.token);
                await fetchCurrentUser();
                loginModal.classList.add('hidden');
                loginForm.reset();
            }

        } catch (error) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        signupError.classList.add('hidden');
        signupSuccess.classList.add('hidden');

        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            signupError.textContent = 'Passwords do not match.';
            signupError.classList.remove('hidden');
            return;
        }

        const payload = {
            full_name: document.getElementById('signup-name').value,
            email: document.getElementById('signup-email').value,
            password: password,
        };

        try {
            const response = await fetch(`${backendUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Signup failed');
            }
            signupSuccess.textContent = 'Account created! Please log in.';
            signupSuccess.classList.remove('hidden');
            signupForm.reset();
        } catch (error) {
            signupError.textContent = error.message;
            signupError.classList.remove('hidden');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        forgotError.classList.add('hidden');
        forgotSuccess.classList.add('hidden');

        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
        const email = document.getElementById('forgot-email').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch(`${backendUrl}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            // The backend always returns a 200 OK for this endpoint for security.
            // We just display the message it sends.
            forgotSuccess.textContent = data.message;
            forgotSuccess.classList.remove('hidden');
            forgotPasswordForm.reset();
        } catch (error) {
            // This would be a network error or server down, not a 4xx error.
            forgotError.textContent = "Could not connect to the server. Please try again later.";
            forgotError.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        }
    };

    const validatePasswordRealtime = (inputElement) => {
        if (!inputElement) return; // Guard clause

        const password = inputElement.value;
        const validations = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const updateRequirement = (element, isValid) => {
            if (!element) return;
            if (isValid) {
                element.classList.remove('invalid');
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
                element.classList.add('invalid');
            }
        };

        updateRequirement(reqLength, validations.length);
        updateRequirement(reqUppercase, validations.uppercase);
        updateRequirement(reqLowercase, validations.lowercase);
        updateRequirement(reqNumber, validations.number);
        updateRequirement(reqSpecial, validations.special);
    };

    const handleVerify2FALogin = async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('2fa-login-error');
        errorEl.classList.add('hidden');

        const otpCode = document.getElementById('2fa-login-code').value;

        try {
            const response = await fetch(`${backendUrl}/login/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp_token: state.temp_token, otp_code: otpCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || '2FA verification failed.');
            }

            // 2FA successful, complete login
            state.token = data.access_token;
            state.temp_token = null;
            localStorage.setItem('neurocare-token', state.token);
            await fetchCurrentUser();
            login2FAModal.classList.replace('flex', 'hidden');
            verifyLoginForm.reset();
            loginForm.reset();

        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
    };

    const handleEnable2FASetup = async () => {
        try {
            const response = await fetch(`${backendUrl}/2fa/setup`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Could not start 2FA setup.');
            }

            // Use an external API to generate the QR code from the URI
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otp_uri)}`;
            setup2FAModal.classList.replace('hidden', 'flex');

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleEnable2FAVerify = async (e) => {
        e.preventDefault();
        enable2FAError.classList.add('hidden');
        const otpCode = document.getElementById('2fa-setup-code').value;

        try {
            const response = await fetch(`${backendUrl}/2fa/enable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({ otp_code: otpCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to enable 2FA.');
            }

            alert('2FA enabled successfully!');
            setup2FAModal.classList.replace('flex', 'hidden');
            await fetchCurrentUser(); // Refresh user state to update UI

        } catch (error) {
            enable2FAError.textContent = error.message;
            enable2FAError.classList.remove('hidden');
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        disable2FAError.classList.add('hidden');
        const password = document.getElementById('2fa-disable-password').value;

        try {
            const response = await fetch(`${backendUrl}/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({ password: password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to disable 2FA.');
            }
            alert('2FA disabled successfully.');
            disable2FAModal.classList.replace('flex', 'hidden');
            await fetchCurrentUser(); // Refresh user state
        } catch (error) {
            disable2FAError.textContent = error.message;
            disable2FAError.classList.remove('hidden');
        }
    };

    const handleLogout = () => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('neurocare-token');
        // On the main page, this just updates the UI. On dashboard, we should redirect.
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        } else {
            updateUIForLoginState();
        }
    };

    const handleAnalysis = async (e) => {
        e.preventDefault();
        
        const file = audioFileInput.files[0];
        if (!file) {
            alert('Please select an audio file first.');
            return;
        }

        resultsContainer.classList.remove('hidden');
        resultsLoading.classList.remove('hidden');
        resultsContent.classList.add('hidden');

        const formData = new FormData();
        // The backend expects 'name', 'age', and scores.
        // Since the form only has a file, we'll send some dummy data.
        formData.append('name', 'Anonymous');
        formData.append('age', 0);
        formData.append('memory_score', 5); // Placeholder
        formData.append('recall_score', 5); // Placeholder
        formData.append('attention_score', 5); // Placeholder


        try {
            const response = await fetch(`${backendUrl}/api/analysis/submit`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Analysis failed.');
            }

            // Display a simple success message and link to the dashboard
            resultsLoading.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            resultLabel.textContent = 'Success';
            resultScore.innerHTML = `Analysis complete. <a href="/dashboard.html" class="font-bold underline">View Dashboard</a>`;

        } catch (error) {
            resultsLoading.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            resultLabel.textContent = 'Error';
            resultScore.textContent = error.message;
        }
    };

    const renderAssessmentHistory = (assessments) => {
        const container = document.getElementById('assessment-history-container');
        const loadingEl = document.getElementById('history-loading');
        const emptyEl = document.getElementById('history-empty');

        loadingEl.classList.add('hidden');

        if (!assessments || assessments.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }

        assessments.forEach(assessment => {
            const date = new Date(assessment.timestamp).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const time = new Date(assessment.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
            });

            const riskColor = assessment.risk_label === 'High Risk' ? 'text-red-600' : 'text-green-600';

            const card = `
                <div class="bg-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p class="text-sm text-gray-500">${date} at ${time}</p>
                        <p class="text-xl font-bold ${riskColor} mt-1">${assessment.risk_label}</p>
                    </div>
                    <div class="bg-brand-cyan p-4 rounded-lg text-center w-full md:w-auto">
                        <p class="text-sm text-gray-600">Cognitive Speech Score</p>
                        <p class="text-2xl font-bold text-brand-teal">${(assessment.speech_score * 100).toFixed(1)}%</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });
    };

    const fetchAssessmentHistory = async () => {
        if (!state.token) {
            // If not logged in, redirect to home page to log in
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/assessments/me`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch assessment history.');
            }

            const assessments = await response.json();
            renderAssessmentHistory(assessments);

        } catch (error) {
            console.error(error);
            const container = document.getElementById('assessment-history-container');
            const loadingEl = document.getElementById('history-loading');
            loadingEl.classList.add('hidden');
            container.innerHTML = `<p class="text-center text-red-500">Could not load your history. Please try again later.</p>`;
        }
    };
    
    const handleStartCamera = () => {
        // Placeholder for starting the camera and facial expression analysis
        alert('Facial expression analysis feature is not yet implemented.');
    };

    const handleSubmitQuestionnaire = () => {
        // Placeholder for submitting the questionnaire
        alert('Thank you for your feedback!');
    };


    // --- Event Listeners ---

    // Mobile Menu
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // Modals
    const openLogin = () => { signupModal.classList.add('hidden'); loginModal.classList.remove('hidden'); loginModal.classList.add('flex'); };
    const openSignup = () => { loginModal.classList.add('hidden'); signupModal.classList.remove('hidden'); signupModal.classList.add('flex'); };
    loginSignupBtn.addEventListener('click', openLogin);
    mobileLoginSignupBtn.addEventListener('click', openLogin);
    closeLoginModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
    closeSignupModalBtn.addEventListener('click', () => signupModal.classList.add('hidden'));
    showSignupLink.addEventListener('click', openSignup);
    showLoginLink.addEventListener('click', openLogin); 
    if (closeLogin2FAModalBtn) {
        closeLogin2FAModalBtn.addEventListener('click', () => login2FAModal.classList.replace('flex', 'hidden'));
    }

    // Forgot Password Modal Listeners
    const openForgotPassword = () => { loginModal.classList.add('hidden'); forgotPasswordModal.classList.remove('hidden'); forgotPasswordModal.classList.add('flex'); };
    showForgotPasswordLink.addEventListener('click', openForgotPassword);
    closeForgotPasswordModalBtn.addEventListener('click', () => forgotPasswordModal.classList.add('hidden'));
    backToLoginLink.addEventListener('click', () => { forgotPasswordModal.classList.add('hidden'); openLogin(); });

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    if (verifyLoginForm) {
        verifyLoginForm.addEventListener('submit', handleVerify2FALogin);
    }
    logoutBtn.addEventListener('click', handleLogout);
    analysisForm.addEventListener('submit', handleAnalysis);
    
    // New Event Listeners
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', handleStartCamera);
    }
    if (submitQuestionnaireBtn) {
        submitQuestionnaireBtn.addEventListener('click', handleSubmitQuestionnaire);
    }


    // Real-time password validation
    if (signupPasswordInput) {
        signupPasswordInput.addEventListener('focus', () => {
            if (passwordRequirements) passwordRequirements.classList.remove('hidden');
            validatePasswordRealtime(signupPasswordInput);
        });
        signupPasswordInput.addEventListener('input', () => validatePasswordRealtime(signupPasswordInput));
    }

    // File Input
    audioFileInput.addEventListener('change', () => {
        if (audioFileInput.files.length > 0) {
            fileUploadText.textContent = audioFileInput.files[0].name;
            analyzeBtn.disabled = false;
        } else {
            fileUploadText.innerHTML = `<span class="font-semibold">Click to upload</span> or drag and drop`;
            analyzeBtn.disabled = true;
        }
    });

    const handleDeleteAccount = async () => {
        if (!state.token) {
            alert('You must be logged in to delete your account.');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to delete account.');
            }

            // On successful deletion, log out and redirect
            alert('Your account has been permanently deleted.');
            handleLogout();

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // --- Initialization ---
    const init = async () => {
        await fetchCurrentUser();

        // Check if we are on the dashboard page
        if (window.location.pathname.includes('dashboard.html')) {
            fetchAssessmentHistory();
            // Add logout functionality for dashboard page header
            const dashboardLogoutBtn = document.getElementById('logout-btn');
            const mobileDashboardLogoutBtn = document.getElementById('mobile-logout-btn');
            if (dashboardLogoutBtn) dashboardLogoutBtn.addEventListener('click', handleLogout);
            if (mobileDashboardLogoutBtn) mobileDashboardLogoutBtn.addEventListener('click', handleLogout);
            
            // Handle mobile menu on dashboard
            const dashboardMenuBtn = document.getElementById('menu-btn');
            const dashboardMobileMenu = document.getElementById('mobile-menu');
            if(dashboardMenuBtn) dashboardMenuBtn.addEventListener('click', () => dashboardMobileMenu.classList.toggle('hidden'));

            // Account Deletion Listeners
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', () => deleteConfirmModal.classList.replace('hidden', 'flex'));
                cancelDeleteBtn.addEventListener('click', () => deleteConfirmModal.classList.replace('flex', 'hidden'));
                confirmDeleteBtn.addEventListener('click', handleDeleteAccount);
            }

            // 2FA Listeners
            if (enable2FABtn) enable2FABtn.addEventListener('click', handleEnable2FASetup);
            if (closeSetup2FAModalBtn) closeSetup2FAModalBtn.addEventListener('click', () => setup2FAModal.classList.replace('flex', 'hidden'));
            if (enable2FAForm) enable2FAForm.addEventListener('submit', handleEnable2FAVerify);
            if (showDisable2FAModalBtn) {
                showDisable2FAModalBtn.addEventListener('click', () => disable2FAModal.classList.replace('hidden', 'flex'));
                closeDisable2FAModalBtn.addEventListener('click', () => disable2FAModal.classList.replace('flex', 'hidden'));
                disable2FAForm.addEventListener('submit', handleDisable2FA);
            }
        }

        // Check if we are on the reset password page
        if (window.location.pathname.includes('reset-password.html')) {
            const resetPasswordForm = document.getElementById('reset-password-form');
            const passwordInput = document.getElementById('reset-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const resetError = document.getElementById('reset-error');
            const resetSuccess = document.getElementById('reset-success');
            const passwordRequirements = document.getElementById('password-requirements');
    
            // Real-time validation for the new password field
            passwordInput.addEventListener('focus', () => {
                passwordRequirements.classList.remove('hidden');
                validatePasswordRealtime(passwordInput);
            });
            passwordInput.addEventListener('input', () => validatePasswordRealtime(passwordInput));
    
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                resetError.classList.add('hidden');
                resetSuccess.classList.add('hidden');
    
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
    
                if (!token) {
                    resetError.textContent = 'No reset token found. Please use the link from your email.';
                    resetError.classList.remove('hidden');
                    return;
                }
    
                if (passwordInput.value !== confirmPasswordInput.value) {
                    resetError.textContent = 'Passwords do not match.';
                    resetError.classList.remove('hidden');
                    return;
                }
    
                try {
                    const response = await fetch(`${backendUrl}/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: token, password: passwordInput.value }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.detail || 'Failed to reset password.');
                    }
                    resetSuccess.innerHTML = 'Password reset successfully! <a href="index.html" class="font-bold underline">Click here to log in.</a>';
                    resetSuccess.classList.remove('hidden');
                    resetPasswordForm.reset();
                } catch (error) {
                    resetError.textContent = error.message;
                    resetError.classList.remove('hidden');
                }
            });
        }
    };

    init();

    if (crosshairLabel) {
        crosshairLabel.addEventListener('click', () => {
            crosshairLabel.classList.add('clicked');
            setTimeout(() => {
                crosshairLabel.classList.remove('clicked');
            }, 300); // Duration of the animation
        });
    }
});
