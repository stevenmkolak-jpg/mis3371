/*
  Program name: form.js
  Author: STEVEN KOLAK
  Date created: 3/27/26
  Date last edited: 3/27/26
  Version: 2.0
  Description: External JavaScript for ClearPath Medical Patient Registration Form.
               Contains all validation modules, dynamic events, and review display logic.
*/

/* ============================================================
   MODULE: calculateDateBounds
   Computes min/max dates for the DOB date input.
   DOB must be between today and 120 years ago.
   ============================================================ */
function calculateDateBounds() {
    const today = new Date();

    // Max DOB = today (can't be born in the future)
    const maxDate = today.toISOString().split('T')[0];

    // Min DOB = 120 years ago
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
   MODULE: showError / clearError
   Displays or removes an inline error message next to a field.
   ============================================================ */
function showError(fieldId, message) {
    const errSpan = document.getElementById('err-' + fieldId);
    if (errSpan) {
        errSpan.textContent = '⚠ ' + message;
        errSpan.style.display = 'inline';
    }
}

function clearError(fieldId) {
    const errSpan = document.getElementById('err-' + fieldId);
    if (errSpan) {
        errSpan.textContent = '';
        errSpan.style.display = 'none';
    }
}

/* ============================================================
   MODULE: validateFirstName
   Letters, apostrophes, and dashes only, 1–30 characters.
   ============================================================ */
function validateFirstName() {
    const field = document.getElementById('fname');
    const val = field.value.trim();
    const pattern = /^[A-Za-z'\-]{1,30}$/;
    if (!val) {
        showError('fname', 'First name is required.');
        return false;
    }
    if (!pattern.test(val)) {
        showError('fname', 'Letters, apostrophes, and dashes only (1–30 characters).');
        return false;
    }
    clearError('fname');
    return true;
}

/* ============================================================
   MODULE: validateMiddleInitial
   Optional: 1 letter only, no numbers.
   ============================================================ */
function validateMiddleInitial() {
    const field = document.getElementById('mi');
    const val = field.value.trim();
    if (val === '') { clearError('mi'); return true; } // optional
    const pattern = /^[A-Za-z]$/;
    if (!pattern.test(val)) {
        showError('mi', 'One letter only, no numbers.');
        return false;
    }
    clearError('mi');
    return true;
}

/* ============================================================
   MODULE: validateLastName
   Letters, apostrophes, numbers 2–5 (ordinals), dashes, 1–30 chars.
   ============================================================ */
function validateLastName() {
    const field = document.getElementById('lname');
    const val = field.value.trim();
    const pattern = /^[A-Za-z'\-2-5]{1,30}$/;
    if (!val) {
        showError('lname', 'Last name is required.');
        return false;
    }
    if (!pattern.test(val)) {
        showError('lname', 'Letters, apostrophes, dashes, and ordinal numbers (2–5) only.');
        return false;
    }
    clearError('lname');
    return true;
}

/* ============================================================
   MODULE: validateDOB
   Must be a valid date, not in the future, not more than 120 years ago.
   ============================================================ */
function validateDOB() {
    const field = document.getElementById('dob');
    const val = field.value;
    if (!val) {
        showError('dob', 'Date of birth is required.');
        return false;
    }
    const dob = new Date(val);
    if (isNaN(dob.getTime())) {
        showError('dob', 'Please enter a valid date.');
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob > today) {
        showError('dob', 'Date of birth cannot be in the future.');
        return false;
    }
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (dob < minDate) {
        showError('dob', 'Date of birth cannot be more than 120 years ago.');
        return false;
    }
    clearError('dob');
    return true;
}

/* ============================================================
   MODULE: validateSSN
   Format ###-##-#### (password field, obscured on screen).
   Optional — but if entered, must match pattern.
   ============================================================ */
function validateSSN() {
    const field = document.getElementById('ssn');
    const val = field.value.trim();
    if (val === '') { clearError('ssn'); return true; } // optional
    const pattern = /^\d{3}-\d{2}-\d{4}$/;
    if (!pattern.test(val)) {
        showError('ssn', 'Format must be ###-##-#### (e.g., 123-45-6789).');
        return false;
    }
    clearError('ssn');
    return true;
}

/* ============================================================
   MODULE: validateUserID
   5–30 chars, no spaces, first char must be a letter,
   only letters/numbers/underscore/dash allowed.
   Converts to lowercase on blur.
   ============================================================ */
function validateUserID() {
    const field = document.getElementById('userid');
    let val = field.value.trim();

    if (!val) {
        showError('userid', 'User ID is required.');
        return false;
    }
    if (val.length < 5 || val.length > 30) {
        showError('userid', 'User ID must be 5–30 characters long.');
        return false;
    }
    if (/^\d/.test(val)) {
        showError('userid', 'First character cannot be a number.');
        return false;
    }
    if (/\s/.test(val)) {
        showError('userid', 'No spaces allowed in User ID.');
        return false;
    }
    const pattern = /^[A-Za-z][A-Za-z0-9_\-]{4,29}$/;
    if (!pattern.test(val)) {
        showError('userid', 'Only letters, numbers, underscores, and dashes allowed.');
        return false;
    }

    // Convert to lowercase and redisplay
    field.value = val.toLowerCase();
    clearError('userid');
    return true;
}

/* ============================================================
   MODULE: validatePassword
   8–30 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char.
   No double quotes. Cannot contain user ID or name.
   ============================================================ */
function validatePassword() {
    const field = document.getElementById('pwd');
    const val = field.value;
    const userid = document.getElementById('userid').value.toLowerCase();
    const fname = document.getElementById('fname').value.toLowerCase();
    const lname = document.getElementById('lname').value.toLowerCase();

    if (!val) {
        showError('pwd', 'Password is required.');
        return false;
    }
    if (val.length < 8) {
        showError('pwd', 'Password must be at least 8 characters.');
        return false;
    }
    if (val.length > 30) {
        showError('pwd', 'Password cannot exceed 30 characters.');
        return false;
    }
    if (!/[A-Z]/.test(val)) {
        showError('pwd', 'Password must contain at least 1 uppercase letter.');
        return false;
    }
    if (!/[a-z]/.test(val)) {
        showError('pwd', 'Password must contain at least 1 lowercase letter.');
        return false;
    }
    if (!/\d/.test(val)) {
        showError('pwd', 'Password must contain at least 1 number.');
        return false;
    }
    if (!/[!@#%^&*()\-_+=\/><.,`~]/.test(val)) {
        showError('pwd', 'Password must contain at least 1 special character (!@#%^&* etc.).');
        return false;
    }
    if (val.includes('"')) {
        showError('pwd', 'Password cannot contain double quotes (").');
        return false;
    }
    const valLower = val.toLowerCase();
    if (userid && valLower.includes(userid)) {
        showError('pwd', 'Password cannot contain your User ID.');
        return false;
    }
    if (fname && fname.length >= 3 && valLower.includes(fname)) {
        showError('pwd', 'Password cannot contain your first name.');
        return false;
    }
    if (lname && lname.length >= 3 && valLower.includes(lname)) {
        showError('pwd', 'Password cannot contain your last name.');
        return false;
    }

    clearError('pwd');
    updatePasswordStrength(val);
    return true;
}

/* ============================================================
   MODULE: updatePasswordStrength
   Visual strength indicator (Weak / Fair / Strong).
   ============================================================ */
function updatePasswordStrength(val) {
    const bar = document.getElementById('pwd-strength');
    if (!bar) return;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[!@#%^&*()\-_+=\/><.,`~]/.test(val)) score++;

    if (score <= 2) {
        bar.textContent = 'Strength: Weak';
        bar.className = 'pwd-strength weak';
    } else if (score <= 3) {
        bar.textContent = 'Strength: Fair';
        bar.className = 'pwd-strength fair';
    } else {
        bar.textContent = 'Strength: Strong';
        bar.className = 'pwd-strength strong';
    }
}

/* ============================================================
   MODULE: validatePasswordMatch
   Checks that pwd2 equals pwd.
   ============================================================ */
function validatePasswordMatch() {
    const pwd = document.getElementById('pwd').value;
    const pwd2 = document.getElementById('pwd2').value;
    if (!pwd2) {
        showError('pwd2', 'Please re-enter your password.');
        return false;
    }
    if (pwd !== pwd2) {
        showError('pwd2', 'Passwords do not match.');
        return false;
    }
    clearError('pwd2');
    return true;
}

/* ============================================================
   MODULE: validateEmail
   Standard email format: name@domain.tld
   ============================================================ */
function validateEmail() {
    const field = document.getElementById('email');
    const val = field.value.trim();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!val) {
        showError('email', 'Email address is required.');
        return false;
    }
    if (!pattern.test(val)) {
        showError('email', 'Enter a valid email: name@domain.tld');
        return false;
    }
    clearError('email');
    return true;
}

/* ============================================================
   MODULE: validatePhone
   Format: (xxx) xxx-xxxx
   ============================================================ */
function validatePhone() {
    const field = document.getElementById('phone');
    const val = field.value.trim();
    if (val === '') { clearError('phone'); return true; } // optional
    const pattern = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!pattern.test(val)) {
        showError('phone', 'Format must be (xxx) xxx-xxxx');
        return false;
    }
    clearError('phone');
    return true;
}

/* ============================================================
   MODULE: validateAddress1
   Required, 2–30 characters.
   ============================================================ */
function validateAddress1() {
    const field = document.getElementById('addr1');
    const val = field.value.trim();
    if (!val) {
        showError('addr1', 'Address Line 1 is required.');
        return false;
    }
    if (val.length < 2 || val.length > 30) {
        showError('addr1', 'Address must be 2–30 characters.');
        return false;
    }
    clearError('addr1');
    return true;
}

/* ============================================================
   MODULE: validateAddress2
   Optional — if entered, 2–30 characters.
   ============================================================ */
function validateAddress2() {
    const field = document.getElementById('addr2');
    const val = field.value.trim();
    if (val === '') { clearError('addr2'); return true; }
    if (val.length < 2 || val.length > 30) {
        showError('addr2', 'If entered, must be 2–30 characters.');
        return false;
    }
    clearError('addr2');
    return true;
}

/* ============================================================
   MODULE: validateCity
   Required, 2–30 characters.
   ============================================================ */
function validateCity() {
    const field = document.getElementById('city');
    const val = field.value.trim();
    if (!val) {
        showError('city', 'City is required.');
        return false;
    }
    if (val.length < 2 || val.length > 30) {
        showError('city', 'City must be 2–30 characters.');
        return false;
    }
    clearError('city');
    return true;
}

/* ============================================================
   MODULE: validateState
   Must select a valid state (not the blank default).
   ============================================================ */
function validateState() {
    const field = document.getElementById('state');
    if (!field.value) {
        showError('state', 'Please select a state.');
        return false;
    }
    clearError('state');
    return true;
}

/* ============================================================
   MODULE: validateZip
   Required, 5 digits; allows zip+4 format (e.g. 77002-1234).
   Truncates to first 5 digits and redisplays.
   ============================================================ */
function validateZip() {
    const field = document.getElementById('zip');
    let val = field.value.trim();
    const pattern = /^\d{5}(-\d{4})?$/;
    if (!val) {
        showError('zip', 'Zip code is required.');
        return false;
    }
    if (!pattern.test(val)) {
        showError('zip', 'Enter a valid zip code (e.g. 77002 or 77002-1234).');
        return false;
    }
    // Truncate to first 5 digits and redisplay
    field.value = val.substring(0, 5);
    clearError('zip');
    return true;
}

/* ============================================================
   MODULE: updateSalaryDisplay
   Dynamically formats the range slider value as a salary.
   ============================================================ */
function updateSalaryDisplay(value) {
    const display = document.getElementById('health-val');
    if (display) {
        const formatted = '$' + parseInt(value).toLocaleString() + '/yr';
        display.textContent = formatted;
    }
}

/* ============================================================
   MODULE: showReview
   Collects all form data and displays the review panel.
   Called by the "Review" button.
   ============================================================ */
function showReview() {
    // Run all validations first
    const valid =
        validateFirstName() &
        validateMiddleInitial() &
        validateLastName() &
        validateDOB() &
        validateSSN() &
        validateUserID() &
        validatePassword() &
        validatePasswordMatch() &
        validateEmail() &
        validatePhone() &
        validateAddress1() &
        validateAddress2() &
        validateCity() &
        validateState() &
        validateZip();

    if (!valid) {
        alert('Please fix the highlighted errors before reviewing.');
        return;
    }

    // ---- Collect values ----
    const fname   = document.getElementById('fname').value.trim();
    const mi      = document.getElementById('mi').value.trim();
    const lname   = document.getElementById('lname').value.trim();
    const dob     = document.getElementById('dob').value;
    const ssn     = document.getElementById('ssn').value ? '***-**-' + document.getElementById('ssn').value.slice(-4) : 'Not provided';
    const userid  = document.getElementById('userid').value;
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim() || 'Not provided';
    const addr1   = document.getElementById('addr1').value.trim();
    const addr2   = document.getElementById('addr2').value.trim();
    const city    = document.getElementById('city').value.trim();
    const stateEl = document.getElementById('state');
    const state   = stateEl.options[stateEl.selectedIndex].text;
    const zip     = document.getElementById('zip').value.trim();
    const symptoms= document.getElementById('symptoms').value.trim() || 'None provided';
    const health  = document.getElementById('health').value;
    const healthFormatted = '$' + parseInt(health).toLocaleString() + '/yr';

    // Checkboxes
    const checkboxes = document.querySelectorAll('input[name="history"]:checked');
    const historyList = checkboxes.length > 0
        ? Array.from(checkboxes).map(cb => cb.nextSibling.textContent.trim()).join(', ')
        : 'None selected';

    // Radios
    const genderEl     = document.querySelector('input[name="gender"]:checked');
    const vaccinatedEl = document.querySelector('input[name="vaccinated"]:checked');
    const insuranceEl  = document.querySelector('input[name="insurance"]:checked');
    const gender     = genderEl     ? genderEl.value     : 'Not selected';
    const vaccinated = vaccinatedEl ? vaccinatedEl.value : 'Not selected';
    const insurance  = insuranceEl  ? insuranceEl.value  : 'Not selected';

    // Full name display
    const fullName = fname + (mi ? ' ' + mi + '.' : '') + ' ' + lname;

    // ---- Build the review HTML ----
    const reviewHTML = `
        <h2>📋 Please Review Your Information</h2>
        <p class="review-subtitle">Verify your details below before submitting.</p>

        <table class="review-table">
            <tr class="review-section-header"><td colspan="3">Personal Information</td></tr>
            <tr>
                <td class="review-label">Full Name</td>
                <td class="review-value">${fullName}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">Date of Birth</td>
                <td class="review-value">${dob}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">SSN (masked)</td>
                <td class="review-value">${ssn}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">User ID</td>
                <td class="review-value">${userid}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">Password</td>
                <td class="review-value">••••••••</td>
                <td class="review-status pass">✔ OK</td>
            </tr>

            <tr class="review-section-header"><td colspan="3">Contact Information</td></tr>
            <tr>
                <td class="review-label">Email</td>
                <td class="review-value">${email}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">Phone</td>
                <td class="review-value">${phone}</td>
                <td class="review-status ${phone !== 'Not provided' ? 'pass">✔ OK' : 'warn">— Not provided'}</td>
            </tr>

            <tr class="review-section-header"><td colspan="3">Address</td></tr>
            <tr>
                <td class="review-label">Address</td>
                <td class="review-value">${addr1}${addr2 ? '<br>' + addr2 : ''}<br>${city}, ${state} ${zip}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>

            <tr class="review-section-header"><td colspan="3">Medical History &amp; Choices</td></tr>
            <tr>
                <td class="review-label">Medical History</td>
                <td class="review-value">${historyList}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">Gender</td>
                <td class="review-value">${gender}</td>
                <td class="review-status ${gender !== 'Not selected' ? 'pass">✔ OK' : 'warn">— Not selected'}</td>
            </tr>
            <tr>
                <td class="review-label">Vaccinated?</td>
                <td class="review-value">${vaccinated}</td>
                <td class="review-status ${vaccinated !== 'Not selected' ? 'pass">✔ OK' : 'warn">— Not selected'}</td>
            </tr>
            <tr>
                <td class="review-label">Has Insurance?</td>
                <td class="review-value">${insurance}</td>
                <td class="review-status ${insurance !== 'Not selected' ? 'pass">✔ OK' : 'warn">— Not selected'}</td>
            </tr>
            <tr>
                <td class="review-label">Desired Salary</td>
                <td class="review-value">${healthFormatted}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
            <tr>
                <td class="review-label">Symptoms / Notes</td>
                <td class="review-value">${symptoms}</td>
                <td class="review-status pass">✔ OK</td>
            </tr>
        </table>

        <div style="text-align:center; margin-top: 24px;">
            <button type="button" onclick="document.getElementById('review-panel').style.display='none'" 
                    style="background:#5d6d7e; color:#fff; padding:10px 28px; border-radius:5px; border:none; cursor:pointer; font-size:14px; margin-right:12px;">
                ← Go Back &amp; Edit
            </button>
            <button type="submit" form="reg-form"
                    style="background:#1a5276; color:#fff; padding:10px 28px; border-radius:5px; border:none; cursor:pointer; font-size:14px;">
                ✔ Confirm &amp; Submit
            </button>
        </div>
    `;

    const panel = document.getElementById('review-panel');
    panel.innerHTML = reviewHTML;
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   MODULE: initForm
   Runs on DOMContentLoaded — sets up all event listeners.
   ============================================================ */
function initForm() {
    calculateDateBounds();

    // Name fields
    document.getElementById('fname').addEventListener('blur', validateFirstName);
    document.getElementById('mi').addEventListener('blur', validateMiddleInitial);
    document.getElementById('lname').addEventListener('blur', validateLastName);

    // DOB
    document.getElementById('dob').addEventListener('blur', validateDOB);
    document.getElementById('dob').addEventListener('change', validateDOB);

    // SSN
    document.getElementById('ssn').addEventListener('blur', validateSSN);

    // User ID
    document.getElementById('userid').addEventListener('blur', validateUserID);

    // Password - validate on input (on the fly)
    document.getElementById('pwd').addEventListener('input', function() {
        validatePassword();
        // Re-check match if pwd2 is already filled
        if (document.getElementById('pwd2').value) validatePasswordMatch();
    });
    document.getElementById('pwd2').addEventListener('input', validatePasswordMatch);

    // Contact
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('phone').addEventListener('blur', validatePhone);

    // Address
    document.getElementById('addr1').addEventListener('blur', validateAddress1);
    document.getElementById('addr2').addEventListener('blur', validateAddress2);
    document.getElementById('city').addEventListener('blur', validateCity);
    document.getElementById('state').addEventListener('change', validateState);
    document.getElementById('zip').addEventListener('blur', validateZip);

    // Salary slider
    const slider = document.getElementById('health');
    if (slider) {
        slider.addEventListener('input', function() {
            updateSalaryDisplay(this.value);
        });
        updateSalaryDisplay(slider.value); // initialize display
    }

    // Review button
    document.getElementById('btn-review').addEventListener('click', showReview);
}

document.addEventListener('DOMContentLoaded', initForm);
