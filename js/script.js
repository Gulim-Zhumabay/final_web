$(document).ready(function () {

  // ===== Login status (works on every page) =====
  // After sign in we save only the name and the email (no password)
  // under the key "bookverseCurrentUser".
  var currentUser = JSON.parse(localStorage.getItem('bookverseCurrentUser'));

  if (currentUser) {
    // the user is signed in: show his name and a Sign out button in the navbar
    var $hello = $('<span class="text-light me-2">').text('Hi, ' + currentUser.name + '!');
    var $signOut = $('<button type="button" id="signout-btn" class="btn btn-outline-light">Sign out</button>');
    $('#auth-buttons').empty().append($hello, $signOut);
  }

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
        var users = JSON.parse(localStorage.getItem('bookverseUsers')) || [];
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
        localStorage.setItem('bookverseUsers', JSON.stringify(users));

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
      var users = JSON.parse(localStorage.getItem('bookverseUsers')) || [];

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

  if ($('#list-body').length) {
    var STORAGE_KEY = 'bookverseReadingList';

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

});
