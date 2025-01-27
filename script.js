document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const CONFIG = {
        MAX_VARIATIONS: 1000, // زيادة الحد الأقصى لتوليد عدد أكبر من العناوين
        MIN_VARIATIONS: 1,
        ANIMATION_DELAY: 50,
        TOAST_DURATION: 2000
    };

    // Single Dot Generator
    class SingleDotGenerator {
        constructor(username) {
            this.username = username;
            this.length = username.length;
            this.patterns = new Set();
        }

        generatePatterns(requestedCount) {
            const positions = this.length - 1;
            const totalCombinations = Math.pow(2, positions);

            for (let i = 1; i < totalCombinations && this.patterns.size < requestedCount; i++) {
                const binary = i.toString(2).padStart(positions, '0');
                let newUsername = '';

                for (let j = 0; j < this.length; j++) {
                    newUsername += this.username[j];
                    if (j < positions && binary[j] === '1') {
                        newUsername += '.';
                    }
                }

                this.patterns.add(newUsername);
            }

            return Array.from(this.patterns);
        }
    }

    // UI Controller
    class UIController {
        static showToast(message, type = 'success') {
            const existingToast = document.querySelector('.toast');
            if (existingToast) {
                existingToast.remove();
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `<div class="toast-content">${message}</div>`;
            document.body.appendChild(toast);

            setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
        }

        static displayResults(emails) {
            const container = document.getElementById('generated-emails');
            container.innerHTML = '';

            emails.forEach((email, index) => {
                const card = document.createElement('div');
                card.className = 'email-card fade-in';
                card.style.animationDelay = `${index * CONFIG.ANIMATION_DELAY}ms`;

                card.innerHTML = `
                    <div class="email-content">
                        <div class="email-text" dir="ltr">${email}</div>
                    </div>
                    <div class="email-actions">
                        <button class="btn-copy" data-email="${email}">نسخ</button>
                    </div>
                `;

                container.appendChild(card);
            });

            document.getElementById('results').style.display = 'block';
        }
    }

    // Form Handler
    document.getElementById('generator-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.toLowerCase();
        const countInput = document.getElementById('count');

        // Validate and process count
        let requestedCount = parseInt(countInput.value);
        if (isNaN(requestedCount) || requestedCount < CONFIG.MIN_VARIATIONS) {
            requestedCount = CONFIG.MIN_VARIATIONS;
            countInput.value = CONFIG.MIN_VARIATIONS;
        } else if (requestedCount > CONFIG.MAX_VARIATIONS) {
            requestedCount = CONFIG.MAX_VARIATIONS;
            countInput.value = CONFIG.MAX_VARIATIONS;
        }

        if (!validateEmail(email)) {
            UIController.showToast('يرجى إدخال بريد Gmail صحيح', 'error');
            return;
        }

        const [username, domain] = email.split('@');
        const generator = new SingleDotGenerator(username);
        const patterns = generator.generatePatterns(requestedCount);
        const emails = patterns.map(pattern => `${pattern}@${domain}`);

        if (emails.length === 0) {
            UIController.showToast('لا يمكن توليد عناوين بريد للاسم المدخل', 'error');
            return;
        }

        UIController.displayResults(emails);
        UIController.showToast(`تم إنشاء ${emails.length} عنوان بريد بنجاح`);
    });

    // Copy Handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-copy')) {
            const email = e.target.dataset.email;
            navigator.clipboard.writeText(email).then(() => {
                UIController.showToast('تم نسخ البريد الإلكتروني');
                e.target.classList.add('copied');
                setTimeout(() => e.target.classList.remove('copied'), 1000);
            });
        }
    });

    // Export Handler
    document.getElementById('export-all').addEventListener('click', function() {
        const emailElements = document.querySelectorAll('.email-text');
        const emails = Array.from(emailElements).map(el => el.textContent);

        if (emails.length === 0) {
            UIController.showToast('لا توجد عناوين بريد للتصدير', 'error');
            return;
        }

        const blob = new Blob([emails.join('\n')], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gmail-variations.txt';
        a.click();
        window.URL.revokeObjectURL(url);

        UIController.showToast('تم تصدير العناوين بنجاح');
    });

    // Theme Toggle Handler
    document.getElementById('theme-toggle').addEventListener('click', function() {
        ThemeManager.toggleTheme();
    });

    // Theme Manager
    class ThemeManager {
        static toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        static initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.body.setAttribute('data-theme', savedTheme);
            }
        }
    }

    // Initialize Theme
    ThemeManager.initTheme();

    // Email Validation
    function validateEmail(email) {
        return /^[a-zA-Z0-9]+@gmail\.com$/.test(email);
    }
});