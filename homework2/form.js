/*
  Program name: form3.js
  Author: STEVEN KOLAK
  Date created: 4/18/26
  Version: 3.0
  Description: External JavaScript for ClearPath Medical Patient Registration Form (HW3).
               All validation done on-the-fly via oninput/onblur events.
               SSN auto-formats as typed. Phone auto-formats as typed.
               Submit button only revealed when ALL validations pass.
               Error spans pre-sized so form never jumps.
*/

/* ============================================================
   UTILITY: showError / clearError
   Writes message into pre-reserved span; never blank (uses &nbsp;).
   ============================================================ */
function showError(fieldId, message) {
    const span = document.getElementById('err-' + fieldId);
    if (span) {
        span.textContent = '⚠ ' + message;
        span.classList.add('active');
    }
}

function clearError(fieldId) {
    const span = document.getElementById('err-' + fieldId);
    if (span) {
        span.textContent = '\u00A0'; // non-breaking space keeps height
        span.classList.remove('active');
    }
}

/* ============================================================
   UTILITY: hasError
   Returns true if the span currently shows an error.
   ============================================================ */
function hasError(fieldId) {
    const span = document.getElementById('err-' + fieldId);
    return span && span.classList.contains('active');
}

/* ============================================================
   UTILITY: calculateDateBounds
   ============================================================ */
function calculateDateBounds() {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    const minDateStr = minDate.toISOString().split('T')[0];
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.setAttribute('min', minDateStr);
        dobInput.setAttribute('max', maxDate);
    }
}

/* ============================================================
   VALIDATION: First Name
   Required. Letters, apostrophes, dashes only. 1–30 chars.
   ============================================================ */
function validateFirstName() {
    const val = document.getElementById('fname').value.trim();
    if (!val) { showError('fname', 'First name is required.'); return false; }
    if (!/^[A-Za-z'\-]{1,30}$/.test(val)) {
        showError('fname', 'Letters, apostrophes, and dashes only (1–30 chars).');
        return false;
    }
    clearError('fname');
    return true;
}

/* ============================================================
   VALIDATION: Middle Initial
   Optional. 1 letter, no numbers.
   ============================================================ */
function validateMiddleInitial() {
    const val = document.getElementById('mi').value.trim();
    if (val === '') { clearError('mi'); return true; }
    if (!/^[A-Za-z]$/.test(val)) {
        showError('mi', 'One letter only, no numbers.');
        return false;
    }
    clearError('mi');
    return true;
}

/* ============================================================
   VALIDATION: Last Name
   Required. Letters, apostrophes, dashes only. 1–30 chars.
   ============================================================ */
function validateLastName() {
    const val = document.getElementById('lname').value.trim();
    if (!val) { showError('lname', 'Last name is required.'); return false; }
    if (!/^[A-Za-z'\-]{1,30}$/.test(val)) {
        showError('lname', 'Letters, apostrophes, and dashes only (1–30 chars).');
        return false;
    }
    clearError('lname');
    return true;
}

/* ============================================================
   VALIDATION: Date of Birth
   Required. Not future. Not >120 years ago.
   ============================================================ */
function validateDOB() {
    const val = document.getElementById('dob').value;
    if (!val) { showError('dob', 'Date of birth is required.'); return false; }
    const dob = new Date(val);
    if (isNaN(dob.getTime())) { showError('dob', 'Enter a valid date.'); return false; }
    const today = new Date(); today.setHours(0,0,0,0);
    if (dob > today) { showError('dob', 'Date of birth cannot be in the future.'); return false; }
    const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - 120);
    if (dob < minDate) { showError('dob', 'Date cannot be more than 120 years ago.'); return false; }
    clearError('dob');
    return true;
}

/* ============================================================
   AUTO-FORMAT: SSN  (called oninput)
   Strips non-digits, inserts dashes at positions 3 and 5.
   e.g. typing "123456789" auto-becomes "123-45-6789"
   ============================================================ */
function autoFormatSSN() {
    const field = document.getElementById('ssn');
    // Can't read value of password type during typing in some browsers,
    // so we track via a hidden buffer input
    let raw = field.dataset.raw || '';

    // We can still read it — strip dashes and non-digits
    let digits = field.value.replace(/\D/g, '').substring(0, 9);
    field.dataset.raw = digits;

    let formatted = digits;
    if (digits.length > 5) {
        formatted = digits.substring(0,3) + '-' + digits.substring(3,5) + '-' + digits.substring(5);
    } else if (digits.length > 3) {
        formatted = digits.substring(0,3) + '-' + digits.substring(3);
    }
    field.value = formatted;
    validateSSN();
}

/* ============================================================
   VALIDATION: SSN / ID
   Optional. If entered: digits only, format ###-##-####.
   ============================================================ */
function validateSSN() {
    const val = document.getElementById('ssn').value.trim();
    if (val === '') { clearError('ssn'); return true; }
    if (!/^\d{3}-\d{2}-\d{4}$/.test(val)) {
        showError('ssn', 'Must be 9 digits in format ###-##-#### (numbers only).');
        return false;
    }
    clearError('ssn');
    return true;
}

/* ============================================================
   VALIDATION: User ID
   Required. 5–20 chars. Must start with letter.
   Letters, numbers, underscore, dash only. No spaces.
   Auto-lowercased on blur.
   ============================================================ */
function validateUserID() {
    const field = document.getElementById('userid');
    const val = field.value.trim();
    if (!val) { showError('userid', 'User ID is required.'); return false; }
    if (/^\d/.test(val)) { showError('userid', 'Must start with a letter, not a number.'); return false; }
    if (/\s/.test(val)) { showError('userid', 'No spaces allowed in User ID.'); return false; }
    if (val.length < 5) { showError('userid', 'User ID must be at least 5 characters.'); return false; }
    if (val.length > 20) { showError('userid', 'User ID cannot exceed 20 characters.'); return false; }
    if (!/^[A-Za-z][A-Za-z0-9_\-]{4,19}$/.test(val)) {
        showError('userid', 'Only letters, numbers, underscores, and dashes allowed.');
        return false;
    }
    field.value = val.toLowerCase();
    clearError('userid');
    // Re-validate password if it exists — it can't contain the user ID
    const pwdVal = document.getElementById('pwd').value;
    if (pwdVal) validatePassword();
    return true;
}

/* ============================================================
   VALIDATION: Password
   Required. 8–30 chars. At least 1 upper, 1 lower, 1 digit.
   Cannot equal User ID.
   ============================================================ */
function validatePassword() {
    const field = document.getElementById('pwd');
    const val = field.value;
    const userid = document.getElementById('userid').value.toLowerCase();

    if (!val) { showError('pwd', 'Password is required.'); updateStrengthBar(''); return false; }
    if (val.length < 8) { showError('pwd', 'Password must be at least 8 characters.'); updateStrengthBar(val); return false; }
    if (val.length > 30) { showError('pwd', 'Password cannot exceed 30 characters.'); updateStrengthBar(val); return false; }
    if (!/[A-Z]/.test(val)) { showError('pwd', 'Must contain at least 1 uppercase letter.'); updateStrengthBar(val); return false; }
    if (!/[a-z]/.test(val)) { showError('pwd', 'Must contain at least 1 lowercase letter.'); updateStrengthBar(val); return false; }
    if (!/\d/.test(val)   ) { showError('pwd', 'Must contain at least 1 number.'); updateStrengthBar(val); return false; }
    if (userid && val.toLowerCase().includes(userid)) {
        showError('pwd', 'Password cannot contain your User ID.');
        updateStrengthBar(val);
        return false;
    }
    clearError('pwd');
    updateStrengthBar(val);
    // Re-check match if pwd2 filled
    if (document.getElementById('pwd2').value) validatePasswordMatch();
    return true;
}

/* ============================================================
   PASSWORD STRENGTH BAR
   ============================================================ */
function updateStrengthBar(val) {
    const bar = document.getElementById('pwd-strength');
    if (!bar) return;
    if (!val) { bar.textContent = ''; bar.className = 'pwd-strength'; return; }
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[!@#$%^&*()\-_+=\/><.,`~]/.test(val)) score++;
    if (score <= 2) { bar.textContent = 'Strength: Weak';   bar.className = 'pwd-strength weak'; }
    else if (score <= 3) { bar.textContent = 'Strength: Fair';   bar.className = 'pwd-strength fair'; }
    else                 { bar.textContent = 'Strength: Strong'; bar.className = 'pwd-strength strong'; }
}

/* ============================================================
   VALIDATION: Password Match
   ============================================================ */
function validatePasswordMatch() {
    const pwd  = document.getElementById('pwd').value;
    const pwd2 = document.getElementById('pwd2').value;
    if (!pwd2) { showError('pwd2', 'Please re-enter your password.'); return false; }
    if (pwd !== pwd2) { showError('pwd2', 'Passwords do not match.'); return false; }
    clearError('pwd2');
    return true;
}

/* ============================================================
   VALIDATION: Email
   Required. Format: name@domain.tld. Force lowercase on blur.
   ============================================================ */
function validateEmail() {
    const field = document.getElementById('email');
    field.value = field.value.toLowerCase(); // force lowercase
    const val = field.value.trim();
    if (!val) { showError('email', 'Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
        showError('email', 'Enter a valid email: name@domain.tld');
        return false;
    }
    clearError('email');
    return true;
}

/* ============================================================
   AUTO-FORMAT: Phone (called oninput)
   Strips non-digits and rebuilds (xxx) xxx-xxxx as user types.
   ============================================================ */
function autoFormatPhone() {
    const field = document.getElementById('phone');
    const digits = field.value.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
        formatted = '(' + digits.substring(0,3) + ') ' + digits.substring(3,6) + '-' + digits.substring(6);
    } else if (digits.length > 3) {
        formatted = '(' + digits.substring(0,3) + ') ' + digits.substring(3);
    } else if (digits.length > 0) {
        formatted = '(' + digits;
    }
    field.value = formatted;
    if (digits.length === 10) validatePhone();
    else if (digits.length > 0) showError('phone', 'Enter all 10 digits: (xxx) xxx-xxxx');
    else clearError('phone');
}

/* ============================================================
   VALIDATION: Phone
   Optional. Format: (xxx) xxx-xxxx
   ============================================================ */
function validatePhone() {
    const val = document.getElementById('phone').value.trim();
    if (val === '') { clearError('phone'); return true; }
    if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(val)) {
        showError('phone', 'Format must be (xxx) xxx-xxxx');
        return false;
    }
    clearError('phone');
    return true;
}

/* ============================================================
   VALIDATION: Address Line 1
   Required. 2–30 characters.
   ============================================================ */
function validateAddress1() {
    const val = document.getElementById('addr1').value.trim();
    if (!val) { showError('addr1', 'Address Line 1 is required.'); return false; }
    if (val.length < 2 || val.length > 30) { showError('addr1', 'Must be 2–30 characters.'); return false; }
    clearError('addr1');
    return true;
}

/* ============================================================
   VALIDATION: Address Line 2
   Optional. If entered, 2–30 characters.
   ============================================================ */
function validateAddress2() {
    const val = document.getElementById('addr2').value.trim();
    if (val === '') { clearError('addr2'); return true; }
    if (val.length < 2 || val.length > 30) { showError('addr2', 'If entered, must be 2–30 characters.'); return false; }
    clearError('addr2');
    return true;
}

/* ============================================================
   VALIDATION: City
   Required. 2–30 characters.
   ============================================================ */
function validateCity() {
    const val = document.getElementById('city').value.trim();
    if (!val) { showError('city', 'City is required.'); return false; }
    if (val.length < 2 || val.length > 30) { showError('city', 'City must be 2–30 characters.'); return false; }
    clearError('city');
    return true;
}

/* ============================================================
   VALIDATION: State
   ============================================================ */
function validateState() {
    const field = document.getElementById('state');
    if (!field.value) { showError('state', 'Please select a state.'); return false; }
    clearError('state');
    return true;
}

/* ============================================================
   VALIDATION: Zip Code
   Required. 5 digits or zip+4. Truncates to 5 on blur.
   ============================================================ */
function validateZip() {
    const field = document.getElementById('zip');
    const val = field.value.trim();
    if (!val) { showError('zip', 'Zip code is required.'); return false; }
    if (!/^\d{5}(-\d{4})?$/.test(val)) {
        showError('zip', 'Enter a valid 5-digit zip (e.g. 77002 or 77002-1234).');
        return false;
    }
    field.value = val.substring(0, 5); // truncate to 5 digits
    clearError('zip');
    return true;
}

/* ============================================================
   VALIDATION: Symptoms Textarea
   Optional. No HTML tags or double quotes.
   ============================================================ */
function validateSymptoms() {
    const val = document.getElementById('symptoms').value.trim();
    if (val === '') { clearError('symptoms'); return true; }
    if (/<|>|"/.test(val)) {
        showError('symptoms', 'Do not use HTML tags (<>) or double quotes (").');
        return false;
    }
    clearError('symptoms');
    return true;
}

/* ============================================================
   SLIDER: Update displayed health value
   ============================================================ */
function updateHealthDisplay(value) {
    const display = document.getElementById('health-val');
    if (display) display.textContent = value;
}

/* ============================================================
   VALIDATE ALL: called by VALIDATE button
   Runs every validation. Shows/hides submit button.
   ============================================================ */
function validateAll() {
    const results = [
        validateFirstName(),
        validateMiddleInitial(),
        validateLastName(),
        validateDOB(),
        validateSSN(),
        validateUserID(),
        validatePassword(),
        validatePasswordMatch(),
        validateEmail(),
        validatePhone(),
        validateAddress1(),
        validateAddress2(),
        validateCity(),
        validateState(),
        validateZip(),
        validateSymptoms()
    ];

    const allValid = results.every(r => r === true);
    const submitBtn = document.getElementById('btn-submit');
    const summaryRow = document.getElementById('error-summary-row');
    const summary = document.getElementById('error-summary');

    if (allValid) {
        submitBtn.style.display = 'inline-block';
        summaryRow.style.display = 'none';
        summary.textContent = '';
    } else {
        submitBtn.style.display = 'none';
        // Count errors
        const errCount = results.filter(r => r === false).length;
        summaryRow.style.display = '';
        summary.innerHTML = '<span class="err-summary-msg">⚠ ' + errCount +
            ' field(s) need attention. Please correct the highlighted errors above.</span>';
    }
    return allValid;
}

/* ============================================================
   REVIEW PANEL: showReview()
   Validates first, then renders summary table.
   ============================================================ */
function showReview() {
    if (!validateAll()) {
        alert('Please fix the highlighted errors before reviewing.');
        return;
    }

    const fname   = document.getElementById('fname').value.trim();
    const mi      = document.getElementById('mi').value.trim();
    const lname   = document.getElementById('lname').value.trim();
    const dob     = document.getElementById('dob').value;
    const ssnRaw  = document.getElementById('ssn').value;
    const ssn     = ssnRaw ? '***-**-' + ssnRaw.slice(-4) : 'Not provided';
    const userid  = document.getElementById('userid').value;
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim() || 'Not provided';
    const addr1   = document.getElementById('addr1').value.trim();
    const addr2   = document.getElementById('addr2').value.trim();
    const city    = document.getElementById('city').value.trim();
    const stateEl = document.getElementById('state');
    const state   = stateEl.options[stateEl.selectedIndex].text;
    const zip     = document.getElementById('zip').value.trim();
    const health  = document.getElementById('health').value;
    const symptoms= document.getElementById('symptoms').value.trim() || 'None provided';

    const checkboxes  = document.querySelectorAll('input[name="history"]:checked');
    const historyList = checkboxes.length > 0
        ? Array.from(checkboxes).map(cb => cb.nextSibling.textContent.trim()).join(', ')
        : 'None selected';

    const genderEl     = document.querySelector('input[name="gender"]:checked');
    const vaccinatedEl = document.querySelector('input[name="vaccinated"]:checked');
    const insuranceEl  = document.querySelector('input[name="insurance"]:checked');
    const gender     = genderEl     ? genderEl.value     : 'Not selected';
    const vaccinated = vaccinatedEl ? vaccinatedEl.value : 'Not selected';
    const insurance  = insuranceEl  ? insuranceEl.value  : 'Not selected';

    const fullName = fname + (mi ? ' ' + mi + '.' : '') + ' ' + lname;

    const warn = (v, label) =>
        v === 'Not provided' || v === 'Not selected'
            ? `<td class="review-status warn">— ${label}</td>`
            : `<td class="review-status pass">✔ OK</td>`;

    const reviewHTML = `
        <h2>📋 Please Review Your Information</h2>
        <p class="review-subtitle">Verify your details below before submitting.</p>
        <table class="review-table">
            <tr class="review-section-header"><td colspan="3">Personal Information</td></tr>
            <tr><td class="review-label">Full Name</td><td class="review-value">${fullName}</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">Date of Birth</td><td class="review-value">${dob}</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">SSN (masked)</td><td class="review-value">${ssn}</td>${warn(ssn,'Not provided')}</tr>
            <tr><td class="review-label">User ID</td><td class="review-value">${userid}</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">Password</td><td class="review-value">••••••••</td><td class="review-status pass">✔ OK</td></tr>

            <tr class="review-section-header"><td colspan="3">Contact Information</td></tr>
            <tr><td class="review-label">Email</td><td class="review-value">${email}</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">Phone</td><td class="review-value">${phone}</td>${warn(phone,'Not provided')}</tr>

            <tr class="review-section-header"><td colspan="3">Address</td></tr>
            <tr><td class="review-label">Address</td><td class="review-value">${addr1}${addr2 ? '<br>'+addr2 : ''}<br>${city}, ${state} ${zip}</td><td class="review-status pass">✔ OK</td></tr>

            <tr class="review-section-header"><td colspan="3">Medical History &amp; Preferences</td></tr>
            <tr><td class="review-label">Medical History</td><td class="review-value">${historyList}</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">Gender</td><td class="review-value">${gender}</td>${warn(gender,'Not selected')}</tr>
            <tr><td class="review-label">Vaccinated?</td><td class="review-value">${vaccinated}</td>${warn(vaccinated,'Not selected')}</tr>
            <tr><td class="review-label">Has Insurance?</td><td class="review-value">${insurance}</td>${warn(insurance,'Not selected')}</tr>
            <tr><td class="review-label">Overall Health</td><td class="review-value">${health} / 10</td><td class="review-status pass">✔ OK</td></tr>
            <tr><td class="review-label">Symptoms / Notes</td><td class="review-value">${symptoms}</td><td class="review-status pass">✔ OK</td></tr>
        </table>
        <div style="text-align:center; margin-top:24px;">
            <button type="button" onclick="document.getElementById('review-panel').style.display='none'"
                    style="background:#5d6d7e;color:#fff;padding:10px 28px;border-radius:5px;border:none;cursor:pointer;font-size:14px;margin-right:12px;">
                ← Go Back &amp; Edit
            </button>
            <button type="submit" form="reg-form"
                    style="background:#1a5276;color:#fff;padding:10px 28px;border-radius:5px;border:none;cursor:pointer;font-size:14px;">
                ✔ Confirm &amp; Submit
            </button>
        </div>`;

    const panel = document.getElementById('review-panel');
    panel.innerHTML = reviewHTML;
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   RESET: hide submit button when form is cleared
   ============================================================ */
function handleReset() {
    document.getElementById('btn-submit').style.display = 'none';
    document.getElementById('review-panel').style.display = 'none';
    document.getElementById('error-summary-row').style.display = 'none';
    // Clear all error spans back to non-breaking space
    document.querySelectorAll('.err').forEach(el => {
        el.textContent = '\u00A0';
        el.classList.remove('active');
    });
    // Clear strength bar
    const bar = document.getElementById('pwd-strength');
    if (bar) { bar.textContent = ''; bar.className = 'pwd-strength'; }
    // Reset slider display
    document.getElementById('health-val').textContent = '5';
}

/* ============================================================
   INIT: wire up all event listeners
   ============================================================ */
function initForm() {
    calculateDateBounds();

    // ---- Name fields: validate on blur AND on input (for live feedback) ----
    document.getElementById('fname').addEventListener('blur', validateFirstName);
    document.getElementById('fname').addEventListener('input', validateFirstName);

    document.getElementById('mi').addEventListener('blur', validateMiddleInitial);
    document.getElementById('mi').addEventListener('input', validateMiddleInitial);

    document.getElementById('lname').addEventListener('blur', validateLastName);
    document.getElementById('lname').addEventListener('input', validateLastName);

    // ---- DOB ----
    document.getElementById('dob').addEventListener('change', validateDOB);
    document.getElementById('dob').addEventListener('blur', validateDOB);

    // ---- SSN: auto-format on input, validate on blur ----
    document.getElementById('ssn').addEventListener('input', autoFormatSSN);
    document.getElementById('ssn').addEventListener('blur', validateSSN);

    // ---- User ID ----
    document.getElementById('userid').addEventListener('blur', validateUserID);
    document.getElementById('userid').addEventListener('input', function() {
        // Lightweight check while typing
        const val = this.value;
        if (val.length >= 5) validateUserID();
    });

    // ---- Password: validate on every keystroke ----
    document.getElementById('pwd').addEventListener('input', validatePassword);
    document.getElementById('pwd').addEventListener('blur', validatePassword);

    // ---- Password match: check as user types in pwd2 ----
    document.getElementById('pwd2').addEventListener('input', validatePasswordMatch);
    document.getElementById('pwd2').addEventListener('blur', validatePasswordMatch);

    // ---- Email: force lowercase + validate on blur ----
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('email').addEventListener('input', function() {
        this.value = this.value.toLowerCase();
    });

    // ---- Phone: auto-format on input ----
    document.getElementById('phone').addEventListener('input', autoFormatPhone);
    document.getElementById('phone').addEventListener('blur', validatePhone);

    // ---- Address ----
    document.getElementById('addr1').addEventListener('blur', validateAddress1);
    document.getElementById('addr1').addEventListener('input', validateAddress1);
    document.getElementById('addr2').addEventListener('blur', validateAddress2);
    document.getElementById('addr2').addEventListener('input', validateAddress2);
    document.getElementById('city').addEventListener('blur', validateCity);
    document.getElementById('city').addEventListener('input', validateCity);
    document.getElementById('state').addEventListener('change', validateState);
    document.getElementById('zip').addEventListener('blur', validateZip);
    document.getElementById('zip').addEventListener('input', function() {
        if (this.value.length >= 5) validateZip();
    });

    // ---- Symptoms ----
    document.getElementById('symptoms').addEventListener('blur', validateSymptoms);
    document.getElementById('symptoms').addEventListener('input', validateSymptoms);

    // ---- Slider ----
    const slider = document.getElementById('health');
    if (slider) {
        slider.addEventListener('input', function() { updateHealthDisplay(this.value); });
        updateHealthDisplay(slider.value);
    }

    // ---- Buttons ----
    document.getElementById('btn-validate').addEventListener('click', validateAll);
    document.getElementById('btn-review').addEventListener('click', showReview);
    document.getElementById('btn-reset').addEventListener('click', function() {
        setTimeout(handleReset, 10); // after reset clears fields
    });
}

document.addEventListener('DOMContentLoaded', initForm);
