$(document).ready(function() {
  let reg_form = $('#signup-form');
  let login_form = $('#signin-form');

  reg_form.submit(function(event) {
      event.preventDefault();
      let errorDiv = $('#reg_errors');
      errorDiv.empty().hide(); 
      let firstName = $('#firstName').val().trim();
      let lastName = $('#lastName').val().trim();
      let username = $('#username').val().trim();
      let password = $('#password').val().trim();
      let confirmPassword = $('#confirmPassword').val().trim();
      let favoriteQuote = $('#favoriteQuote').val().trim();
      let themePreference = $('#themePreference').val().trim();
      let role = $('#role').val().trim();

      let errorList = [];

      function validateString(param, name, minLen, maxLen, regex) {
          if (param.length === 0) return `${name} cannot be empty or just spaces`;
          if (param.length < minLen || param.length > maxLen) return `${name} must be between ${minLen} and ${maxLen} characters long`;
          if (regex && !regex.test(param)) return `${name} is invalid`;
      }

      function validatePassword(pwd) {
          if (pwd.length < 8) return 'Password should be a minimum of 8 characters long';
          if (/\s/.test(pwd)) return 'Password cannot contain spaces';
          if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
          if (!/\d/.test(pwd)) return 'Password must contain at least one number';
          if (!/[!@#$%^&*()-_=+[\]{};:'",.<>?]/.test(pwd)) return 'Password must contain at least one special character';
      }

      if (!firstName || !lastName || !username || !password || !confirmPassword || !favoriteQuote || !themePreference || !role) {
          errorList.push('All fields must be supplied');
      } else {
          errorList.push(validateString(firstName, 'First Name', 2, 25, /^[^\d]+$/));
          errorList.push(validateString(lastName, 'Last Name', 2, 25, /^[^\d]+$/));
          errorList.push(validateString(username, 'Username', 5, 10, /^[^\d]+$/));
          errorList.push(validateString(favoriteQuote, 'Favorite Quote', 20, 255));
          errorList.push(validatePassword(password));
          errorList.push(validatePassword(confirmPassword));
          if (password !== confirmPassword) {
              errorList.push('Passwords do not match');
          }
      }

      errorList = errorList.filter(Boolean); 

      if (errorList.length > 0) {
          errorDiv.show();
          $.each(errorList, function(index, message) {
              errorDiv.append($('<p>').text(message));
          });
      } else {
          reg_form[0].submit();
      }
  });

  login_form.submit(function(event) {
      event.preventDefault();

      let errorDiv = $('#login_errors');
      errorDiv.empty().hide();

      let username = $('#username').val().trim();
      let password = $('#password').val().trim();

      function validateField() {
          if (!username || !password) {
              return 'Both username and password must be supplied';
          }
          return null;
      }

      let error = validateField();
      if (error) {
          errorDiv.show().append($('<p>').text(error));
      } else {
          login_form[0].submit();
      }
  });
});
