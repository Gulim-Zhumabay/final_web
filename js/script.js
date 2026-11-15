// ===== Light / Dark theme (works on every page) =====
// The theme is saved in localStorage under the key "bookverseTheme".
// We put data-theme="light" or "dark" on the <html> tag.
// css/style.css changes the color variables by this attribute.
function applyTheme(theme) {
  $('html').attr('data-theme', theme);
}

applyTheme(localStorage.getItem('bookverseTheme') || 'light'); // runs right away, before the page is shown

// ===== Helpers for the list of registered users =====
function getUsers() {
  return JSON.parse(localStorage.getItem('bookverseUsers')) || [];
}

function saveUsers(users) {
  localStorage.setItem('bookverseUsers', JSON.stringify(users));
}

$(document).ready(function () {

  // ===== Login status (works on every page) =====
  // After sign in we save only the name and the email (no password)
  // under the key "bookverseCurrentUser".
  var currentUser = JSON.parse(localStorage.getItem('bookverseCurrentUser'));

  if (currentUser) {
    // the user is signed in: instead of Sign in / Sign up show a user icon with a menu
    var menu =
      '<div class="dropdown">' +
        '<button type="button" class="btn btn-outline-light user-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User menu">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">' +
            '<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>' +
            '<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>' +
          '</svg>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-menu-end">' +
          '<li><span class="dropdown-item-text fw-bold" id="menu-name"></span></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><a class="dropdown-item" href="profile.html">Profile</a></li>' +
          '<li><button type="button" class="dropdown-item theme-btn" data-theme="light">Theme: Light</button></li>' +
          '<li><button type="button" class="dropdown-item theme-btn" data-theme="dark">Theme: Dark</button></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><button type="button" class="dropdown-item" id="signout-btn">Log out</button></li>' +
        '</ul>' +
      '</div>';

    $('#auth-buttons').html(menu);
    $('#menu-name').text(currentUser.name); // .text() so the name is shown as plain text
    markActiveTheme();
  }

  // show which theme is active in the menu
  function markActiveTheme() {
    var theme = $('html').attr('data-theme');
    $('.theme-btn').removeClass('active');
    $('.theme-btn[data-theme="' + theme + '"]').addClass('active');
  }

  // click on "Theme: Light" or "Theme: Dark"
  $(document).on('click', '.theme-btn', function () {
    var theme = $(this).attr('data-theme');
    localStorage.setItem('bookverseTheme', theme); // save the choice
    applyTheme(theme);
    markActiveTheme();
  });

  // click on "Log out"
  $(document).on('click', '#signout-btn', function () {
    localStorage.removeItem('bookverseCurrentUser'); // clear the saved login state
    window.location.href = 'index.html';
  });
  if ($('#search-input').length) {
    var activeCategory = 'all';

    function filterBooks() {
      var text = $('#search-input').val().toLowerCase().trim();
      var shown = 0;

      $('.book-item').each(function () {
        var title = $(this).attr('data-title').toLowerCase();
        var author = $(this).attr('data-author').toLowerCase();
        var category = $(this).attr('data-category');

        var textMatches = title.indexOf(text) !== -1 || author.indexOf(text) !== -1;
        var categoryMatches = activeCategory === 'all' || category === activeCategory;

        if (textMatches && categoryMatches) {
          $(this).show();
          shown++;
        } else {
          $(this).hide();
        }
      });

      $('#no-results').toggle(shown === 0);
    }

    $('#search-input').on('input', filterBooks);

    $('.filter-btn').on('click', function () {
      $('.filter-btn').removeClass('active');
      $(this).addClass('active');
      activeCategory = $(this).attr('data-category');
      filterBooks();
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      $('#search-input').val(params.get('q'));
      filterBooks();
    }
  }

  if ($('#register-form').length) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setState($input, isOk, message) {
      $input.removeClass('is-valid is-invalid').addClass(isOk ? 'is-valid' : 'is-invalid');
      if (!isOk) {
        $input.siblings('.invalid-feedback').text(message);
      }
      return isOk;
    }

    function checkName() {
      var name = $('#reg-name').val().trim();
      if (name === '') return setState($('#reg-name'), false, 'Please enter your name.');
      if (name.length < 2) return setState($('#reg-name'), false, 'The name is too short.');
      return setState($('#reg-name'), true);
    }

    function checkEmail() {
      var email = $('#reg-email').val().trim();
      if (email === '') return setState($('#reg-email'), false, 'Please enter your email.');
      if (!emailPattern.test(email)) return setState($('#reg-email'), false, 'Use a format like name@gmail.com.');
      return setState($('#reg-email'), true);
    }

    function checkPassword() {
      var password = $('#reg-password').val();
      if (password === '') return setState($('#reg-password'), false, 'Please enter a password.');
      if (password.length < 8) return setState($('#reg-password'), false, 'Use at least 8 characters.');
      return setState($('#reg-password'), true);
    }

    function checkConfirm() {
      var confirm = $('#reg-confirm').val();
      if (confirm === '') return setState($('#reg-confirm'), false, 'Please repeat the password.');
      if (confirm !== $('#reg-password').val()) return setState($('#reg-confirm'), false, 'The passwords do not match.');
      return setState($('#reg-confirm'), true);
    }

    function showStrength() {
      var password = $('#reg-password').val();
      var points = 0;
      if (password.length >= 8) points++;
      if (/[a-z]/.test(password)) points++;
      if (/[A-Z]/.test(password)) points++;
      if (/[0-9]/.test(password)) points++;
      if (/[^A-Za-z0-9]/.test(password)) points++;

      var $bar = $('#strength-bar');
      $bar.removeClass('bg-danger bg-warning bg-success');

      if (password === '') {
        $bar.css('width', '0%');
        $('#strength-text').text('Password strength: not set');
      } else if (points <= 2) {
        $bar.css('width', '33%').addClass('bg-danger');
        $('#strength-text').text('Password strength: weak');
      } else if (points <= 4) {
        $bar.css('width', '66%').addClass('bg-warning');
        $('#strength-text').text('Password strength: medium');
      } else {
        $bar.css('width', '100%').addClass('bg-success');
        $('#strength-text').text('Password strength: strong');
      }
    }

    $('#reg-name').on('input', checkName);
    $('#reg-email').on('input', checkEmail);
    $('#reg-password').on('input', function () {
      showStrength();
      checkPassword();
      if ($('#reg-confirm').val() !== '') checkConfirm();
    });
    $('#reg-confirm').on('input', checkConfirm);

    $('#register-form').on('submit', function (e) {
      e.preventDefault(); 

      var nameOk = checkName();
      var emailOk = checkEmail();
      var passwordOk = checkPassword();
      var confirmOk = checkConfirm();

      if (nameOk && emailOk && passwordOk && confirmOk) {
        // save the new user in localStorage (demo only, no server)
        var users = getUsers();
        var email = $('#reg-email').val().trim().toLowerCase();

        var exists = users.filter(function (u) { return u.email === email; }).length > 0;
        if (exists) {
          setState($('#reg-email'), false, 'This email is already registered.');
          $('#register-result').html('<div class="alert alert-danger">This email is already registered. Please sign in.</div>');
          return;
        }

        users.push({
          name: $('#reg-name').val().trim(),
          email: email,
          password: $('#reg-password').val()
        });
        saveUsers(users);

        $('#register-result').html('<div class="alert alert-success">Welcome, ' +
          $('<span>').text($('#reg-name').val().trim()).html() + '! Your account is created.</div>');
        this.reset();
        $('#register-form .form-control').removeClass('is-valid is-invalid');
        showStrength();
      } else {
        $('#register-result').html('<div class="alert alert-danger">Please fix the red fields and try again.</div>');
      }
    });
  }

  if ($('#signin-form').length) {
    // if the user is already signed in, hide the form and show a message
    if (currentUser) {
      $('#signin-form').hide();
      $('#signin-result').html('<div class="alert alert-success">You are already signed in as ' +
        $('<span>').text(currentUser.email).html() + '.</div>');
    }

    var signinEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setSigninState($input, isOk, message) {
      $input.removeClass('is-valid is-invalid').addClass(isOk ? 'is-valid' : 'is-invalid');
      if (!isOk) {
        $input.siblings('.invalid-feedback').text(message);
      }
      return isOk;
    }

    function checkSigninEmail() {
      var email = $('#in-email').val().trim();
      if (email === '') return setSigninState($('#in-email'), false, 'Please enter your email.');
      if (!signinEmailPattern.test(email)) return setSigninState($('#in-email'), false, 'Use a format like name@gmail.com.');
      return setSigninState($('#in-email'), true);
    }

    function checkSigninPassword() {
      var password = $('#in-password').val();
      if (password === '') return setSigninState($('#in-password'), false, 'Please enter your password.');
      if (password.length < 8) return setSigninState($('#in-password'), false, 'The password has at least 8 characters.');
      return setSigninState($('#in-password'), true);
    }

    $('#in-email').on('input', checkSigninEmail);
    $('#in-password').on('input', checkSigninPassword);

    $('#signin-form').on('submit', function (e) {
      e.preventDefault();

      var emailOk = checkSigninEmail();
      var passwordOk = checkSigninPassword();

      if (!emailOk || !passwordOk) {
        $('#signin-result').html('<div class="alert alert-danger">Please fix the red fields and try again.</div>');
        return;
      }

      var email = $('#in-email').val().trim().toLowerCase();
      var password = $('#in-password').val();
      var users = getUsers();

      var user = users.filter(function (u) {
        return u.email === email && u.password === password;
      })[0];

      if (user) {
        // save the login status: only name and email, the password is not saved here
        localStorage.setItem('bookverseCurrentUser', JSON.stringify({
          name: user.name,
          email: user.email
        }));

        $('#signin-result').html('<div class="alert alert-success">Welcome back, ' +
          $('<span>').text(user.name).html() + '! Opening the home page...</div>');

        // go to the home page after 1.5 seconds
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        $('#in-password').removeClass('is-valid');
        $('#signin-result').html('<div class="alert alert-danger">Wrong email or password. No account yet? <a href="register.html">Sign up</a></div>');
      }
    });
  }

  if ($('#list-body').length && currentUser) {
    // every user has his own wishlist, so the key contains the email
    var STORAGE_KEY = 'bookverseWishlist_' + currentUser.email;

    var defaultBooks = [
      { id: 1, title: 'Martin Eden', author: 'Jack London', category: 'Fiction', status: 'Finished' },
      { id: 2, title: 'The Name of the Rose', author: 'Umberto Eco', category: 'Detectives', status: 'Reading' },
      { id: 3, title: 'The Way of the Wolf', author: 'Jordan Belfort', category: 'Business', status: 'Want to read' }
    ];

    var books = loadBooks();
    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('bookModal'));

    function loadBooks() {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return defaultBooks.slice();
    }

    function saveBooks() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }

    function renderTable() {
      var $body = $('#list-body');
      $body.empty();

      if (books.length === 0) {
        $body.append('<tr><td colspan="5">Your list is empty. Click "Add book" to start.</td></tr>');
        return;
      }

      $.each(books, function (index, book) {
        var $row = $('<tr>');
        $row.append($('<td>').text(book.title));
        $row.append($('<td>').text(book.author));
        $row.append($('<td>').text(book.category));
        $row.append($('<td>').text(book.status));
        $row.append(
          '<td>' +
            '<button type="button" class="btn btn-sm btn-dark edit-btn me-1" data-id="' + book.id + '">Edit</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger delete-btn" data-id="' + book.id + '">Delete</button>' +
          '</td>'
        );
        $body.append($row);
      });
    }

    $('#add-book-btn').on('click', function () {
      $('#modal-title').text('Add book');
      $('#book-form')[0].reset();
      $('#book-id').val('');
      $('#book-form .form-control').removeClass('is-invalid');
      modal.show();
    });

    $('#list-body').on('click', '.edit-btn', function () {
      var id = Number($(this).attr('data-id'));
      var book = books.filter(function (b) { return b.id === id; })[0];

      $('#modal-title').text('Edit book');
      $('#book-id').val(book.id);
      $('#book-title').val(book.title);
      $('#book-author').val(book.author);
      $('#book-category').val(book.category);
      $('#book-status').val(book.status);
      $('#book-form .form-control').removeClass('is-invalid');
      modal.show();
    });

    $('#book-form').on('submit', function (e) {
      e.preventDefault();

      var title = $('#book-title').val().trim();
      var author = $('#book-author').val().trim();

      $('#book-title').toggleClass('is-invalid', title === '');
      $('#book-author').toggleClass('is-invalid', author === '');
      if (title === '' || author === '') return;

      var id = $('#book-id').val();
      var data = {
        title: title,
        author: author,
        category: $('#book-category').val(),
        status: $('#book-status').val()
      };

      if (id === '') {
        data.id = Date.now();        
        books.push(data);
      } else {
        id = Number(id);               
        $.each(books, function (index, b) {
          if (b.id === id) {
            b.title = data.title;
            b.author = data.author;
            b.category = data.category;
            b.status = data.status;
          }
        });
      }

      saveBooks();
      renderTable();
      modal.hide();
    });

    $('#list-body').on('click', '.delete-btn', function () {
      var id = Number($(this).attr('data-id'));
      var book = books.filter(function (b) { return b.id === id; })[0];

      if (confirm('Delete "' + book.title + '" from your list?')) {
        books = books.filter(function (b) { return b.id !== id; });
        saveBooks();
        renderTable();
      }
    });

    $('#reset-list-btn').on('click', function () {
      if (confirm('Reset the list to the example books?')) {
        books = defaultBooks.slice();
        saveBooks();
        renderTable();
      }
    });

    renderTable();
  }

  if ($('#lightbox').length) {
    var $items = $('.gallery-item');
    var current = 0;

    function openLightbox(index) {
      current = index;
      $('#lightbox-img').attr('src', $items.eq(current).attr('src'));
      $('#lightbox-img').attr('alt', $items.eq(current).attr('alt'));
      $('#lightbox-caption').text($items.eq(current).attr('alt'));
      $('#lightbox-img').css({ top: '-20px' }).animate({ top: '0px' }, 300);
      $('#lightbox').fadeIn(300);
    }

    function changeImage(step) {
      current = (current + step + $items.length) % $items.length;
      $('#lightbox-img').fadeOut(200, function () {
        $(this).attr('src', $items.eq(current).attr('src'));
        $(this).attr('alt', $items.eq(current).attr('alt'));
        $('#lightbox-caption').text($items.eq(current).attr('alt'));
        $(this).fadeIn(200);
      });
    }

    function closeLightbox() {
      $('#lightbox').fadeOut(300);
    }

    $items.on('click', function () {
      openLightbox($items.index(this));
    });

    $('#lightbox-next').on('click', function () { changeImage(1); });
    $('#lightbox-prev').on('click', function () { changeImage(-1); });
    $('#lightbox-close').on('click', closeLightbox);

    $('#lightbox').on('click', function (e) {
      if ($(e.target).is('#lightbox') || $(e.target).is('.lightbox-inner')) {
        closeLightbox();
      }
    });

    $(document).on('keydown', function (e) {
      if (!$('#lightbox').is(':visible')) return;
      if (e.key === 'ArrowRight') changeImage(1);
      if (e.key === 'ArrowLeft') changeImage(-1);
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ===== Profile page =====
  if ($('#profile-form').length) {
    if (!currentUser) {
      $('#profile-guest').show(); // not signed in: show only the message
    } else {
      $('#profile-content').show();

      var users = getUsers();
      // find the signed-in user in the list of all users
      var me = users.filter(function (u) { return u.email === currentUser.email; })[0];

      if (!me) {
        // the account does not exist anymore: sign out
        localStorage.removeItem('bookverseCurrentUser');
        window.location.href = 'signin.html';
        return;
      }

      // fill the form with the saved data
      $('#pf-first').val(me.name);
      $('#pf-last').val(me.lastName || '');
      $('#pf-email').val(me.email);
      $('#pf-birthday').val(me.birthday || '');
      $('#current-plan').text(me.plan || 'No plan');

      // returns true if this genre already has a checkbox (big and small letters do not matter)
      function genreExists(name) {
        var found = false;
        $('.genre-check').each(function () {
          if ($(this).val().toLowerCase() === name.toLowerCase()) found = true;
        });
        return found;
      }

      // creates a new checked checkbox for a genre written by the user
      function addGenreCheckbox(name) {
        var $label = $('<label class="form-check">');
        var $input = $('<input type="checkbox" class="form-check-input genre-check" checked>').val(name);
        $label.append($input, $('<span>').text(' ' + name)); // .text() so the name is plain text
        $('#genre-list').append($label);
      }

      var genres = me.genres || [];
      $('.genre-check').each(function () {
        $(this).prop('checked', genres.indexOf($(this).val()) !== -1);
      });

      // genres that the user added before are not in the HTML, so we create them
      $.each(genres, function (index, name) {
        if (!genreExists(name)) addGenreCheckbox(name);
      });

      // "Add" button for the "Other genre" field
      $('#add-genre-btn').on('click', function () {
        var name = $('#other-genre').val().trim();

        if (name === '') {
          $('#genre-error').text('Please write a genre.');
          return;
        }
        if (name.length > 30) {
          $('#genre-error').text('The genre name is too long.');
          return;
        }
        if (genreExists(name)) {
          $('#genre-error').text('This genre is already in the list.');
          return;
        }

        addGenreCheckbox(name);
        $('#other-genre').val('');
        $('#genre-error').text('');
      });

      // Enter in the "Other genre" field adds the genre (and does not send the whole form)
      $('#other-genre').on('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          $('#add-genre-btn').click();
        }
      });

      // save the changes
      $('#profile-form').on('submit', function (e) {
        e.preventDefault();

        var first = $('#pf-first').val().trim();
        var birthday = $('#pf-birthday').val(); // text like "2005-03-21" or ""
        var today = new Date().toISOString().slice(0, 10);

        var firstOk = first.length >= 2;
        $('#pf-first').toggleClass('is-invalid', !firstOk);
        $('#pf-first').siblings('.invalid-feedback').text('The first name must have at least 2 letters.');

        var birthdayOk = birthday === '' || birthday <= today;
        $('#pf-birthday').toggleClass('is-invalid', !birthdayOk);
        $('#pf-birthday').siblings('.invalid-feedback').text('The birthday cannot be in the future.');

        if (!firstOk || !birthdayOk) {
          $('#profile-result').html('<div class="alert alert-danger">Please fix the red fields.</div>');
          return;
        }

        // collect the checked genres into an array
        var checkedGenres = [];
        $('.genre-check:checked').each(function () {
          checkedGenres.push($(this).val());
        });

        me.name = first;
        me.lastName = $('#pf-last').val().trim();
        me.birthday = birthday;
        me.genres = checkedGenres;
        saveUsers(users); // "me" is an object inside "users", so the list is changed too

        // the name can change, so update the login info and the menu too
        currentUser.name = first;
        localStorage.setItem('bookverseCurrentUser', JSON.stringify(currentUser));
        $('#menu-name').text(first);

        $('#profile-result').html('<div class="alert alert-success">Your profile is saved.</div>');
      });

      // delete account: first click opens the modal, the second click deletes
      var deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));

      $('#delete-account-btn').on('click', function () {
        deleteModal.show();
      });

      $('#confirm-delete-btn').on('click', function () {
        var otherUsers = users.filter(function (u) { return u.email !== currentUser.email; });
        saveUsers(otherUsers);
        localStorage.removeItem('bookverseWishlist_' + currentUser.email);
        localStorage.removeItem('bookverseCurrentUser');
        window.location.href = 'index.html';
      });
    }
  }

  // ===== Membership page: save the plan for a signed-in user =====
  $('#plan-continue').on('click', function (e) {
    if (!currentUser) return; // not signed in: the link opens register.html as before

    e.preventDefault();
    var plan = $('#plan').val();

    if (plan === '') {
      $('#plan').addClass('is-invalid');
      return;
    }

    var users = getUsers();
    $.each(users, function (index, u) {
      if (u.email === currentUser.email) {
        u.plan = plan;
      }
    });
    saveUsers(users);
    window.location.href = 'profile.html';
  });

  $('#plan').on('change', function () {
    $(this).removeClass('is-invalid');
  });

  // ===== FAQ (contact.html) =====
  // A click on a question opens or closes its answer with slideToggle().
  $('.faq-question').on('click', function () {
    var $answer = $(this).next('.faq-answer'); // the answer right after this question
    var $icon = $(this).find('.faq-icon');

    $answer.slideToggle(300); // smooth sliding animation, 300 ms

    // change the sign: + means closed, − means open
    if ($icon.text() === '+') {
      $icon.text('−');
      $(this).attr('aria-expanded', 'true');
    } else {
      $icon.text('+');
      $(this).attr('aria-expanded', 'false');
    }
  });

});
