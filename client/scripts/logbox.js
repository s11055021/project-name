// Get references to the modal and login button
const modal_signup = document.getElementById('modal-signup');
const signupButton = document.getElementById('signupButton');

// Add a click event listener to the login button
signupButton.addEventListener('click', function() {
    // Show the modal when the login button is clicked
    modal_signup.style.display = 'block';
});

// Add a click event listener to close the modal when clicking outside of it
document.addEventListener('click', function(event) {
    // Check if the clicked element is outside the modal and not the login button
    if (event.target !== signupButton && event.target !== modal_signup && !modal_signup.contains(event.target)) {
        // Hide the modal if the click is outside
        modal_signup.style.display = 'none';
    }
});

const modal_login = document.getElementById('modal-login');
const loginButton = document.getElementById('loginButton');

// Add a click event listener to the login button
loginButton.addEventListener('click', function() {
    // Show the modal when the login button is clicked
    modal_login.style.display = 'block';
});

// Add a click event listener to close the modal when clicking outside of it
document.addEventListener('click', function(event) {
    // Check if the clicked element is outside the modal and not the login button
    if (event.target !== loginButton && event.target !== modal_login && !modal_login.contains(event.target)) {
        // Hide the modal if the click is outside
        modal_login.style.display = 'none';
    }
});
