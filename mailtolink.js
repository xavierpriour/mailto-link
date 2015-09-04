(function(root, factory) {
  'use strict';
  // Browser globals (root is window)
  root.mailtolink = factory(root);
}(this, function(root) {
  'use strict';

  var mailtolink = {
    // default need to have an entry for ALL possible options, even ones without sensible defaults.
    default: {
      action: 'redirect',
      url: null,
      new: false,
      urlThen: window.location.href,
      urlPost: null,
      paramMailto: 'mailto',
      paramThen: 'then',
      formSelector: 'form',
      msgError: function(jqXHR, status, text) {
        return 'Error [' + jqXHR.status + ']: ' + text;
      },
      msgSuccess: function(data, status, jqXHR) {
        return 'Mail succesfully sent';
      },
      msgSending: 'Sending mail...',
      msgSelector: '#mailto-msg'
    },
    opts: {}
  };

  function getRedirectUrl($link, opts) {
    var urlMailto = URI($link.attr('href'));
    // build redirect url > start with supplied url
    var urlRedirect = URI(opts.url);
    // add any query set on the mailto
    var mailtoQuery = urlMailto.query(true);
    for (var key in mailtoQuery) {
      urlRedirect.setQuery(key, mailtoQuery[key]);
    }
    // then add the parameters
    if (opts.paramMailto) { urlRedirect.setQuery(opts.paramMailto, urlMailto.path()); }
    if (opts.paramThen) { urlRedirect.setQuery(opts.paramThen, opts.urlThen); }

    var href = urlRedirect.href();
    return href;
  }

  function redirect(mailto, opts) {
    var href = getRedirectUrl(mailto, opts);
    if (opts.new) {
      window.open(href, '_blank');
    } else {
      window.location = href;
    }
  }

  /**
   * returns the properly capitalized option name of supplied parameter - or name itself if none was found
   *
   * @param {String} name
   */
  function optionName(name) {
    var result = name;
    $.each(mailtolink.default, function(key, value) {
      if (key.toLowerCase() === name) {
        result = key;
        // break the $.each() loop
        return false;
      }
    });
    return result;
  }

  function optsFromLink(node, opts) {
    var hasDataLink = false;
    var optsLink = {};
    var prefix = 'data-ml-';
    $.each(node.attributes, function() {
      if (this.specified) {
        var name = this.name;
        if (name.lastIndexOf('data-ml-') === 0) {
          name = name.slice(prefix.length);
          // Beware, attribute name is returned as all lowercase -> we have to find the proper option name!
          optsLink[optionName(name)] = this.value;
          hasDataLink = true;
        }
      }
    });
    var result = {};
    if (hasDataLink) {
      result = $.extend({}, opts, optsLink);
    } else {
      result = opts;
    }
    return result;
  }

  function submitBootstrapModal(event) {
    event.preventDefault();
    var $form = event.data.$form;
    var $modal = $('#' + event.data.id);
    var opts = event.data.opts;
    var data = $form.serialize();
    var url = opts.urlPost ? opts.urlPost : $form.attr('action');
    if (opts.msgSelector) {
      var $msg = $(opts.msgSelector);
      $msg.removeClass('alert alert-success alert-info alert-warning alert-danger');
      $msg.addClass('alert alert-info');
      $msg.html(opts.msgSending);
    }
    $.ajax(url, {
      data: data,
      method: 'POST',
      success: function(data, textStatus, jqXHR) {
        console.log('mail result = ' + data);
        if (opts.msgSelector) {
          var $msg = $(opts.msgSelector);
          $msg.removeClass('alert alert-success alert-info alert-warning alert-danger');
          $msg.addClass('alert alert-success');
          $msg.html(opts.msgSuccess(data, textStatus, jqXHR));
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        var $msg = $(opts.msgSelector);
        $msg.removeClass('alert alert-success alert-info alert-warning alert-danger');
        $msg.addClass('alert alert-danger');
        $msg.html(opts.msgError(jqXHR, textStatus, errorThrown));
      }
    });
    $modal.modal('hide');
  }

  function insertBootstrapCode($link, id, options) {
    //$('<div id="' + id + '" style="display:none;"></div>')
    // add Bootstrap-specific marking to mailto: link
    var oldHref = new URI($link.attr('href'));
    $link.attr('href', '#' + id);
    $link.attr('data-target', '#' + id);
    $link.attr('data-toggle', 'modal');
    // load and insert contact form html
    var $fragment = $('<span></span>');
    var urlLoad = options.url + (options.formSelector ? ' ' + options.formSelector : '');
    $fragment
      .load(urlLoad, function() {
        // set modal to proper id
        $(this).find('.modal').attr('id', id);
        // fill form fields from urls
        var $form = $('#' + id + ' form');
        if (options.paramMailto) { $form.find('[name="' + options.paramMailto + '"]').val(oldHref.path()); }
        if (options.title) { $(this).find('.modal-title').html(options.title); }
        mailtolink.fillFromQuery($form, options.url);
        mailtolink.fillFromQuery($form, oldHref);
        $form.find('input[type="submit"]').click({$form: $form, id: id, opts: options}, submitBootstrapModal);
      });
    //$fragment.insertAfter($link);
    $fragment.prependTo('body');
    // wire mailto: link to act as popup control
    $fragment.modal({show: false});
    $fragment.on('shown.bs.modal', function(e) {
      $(e.target).find('input, textarea').first().focus();
    });
  }

  function updateLink($link, index) {
    var opts = optsFromLink($link[0], mailtolink.opts);
    var action = opts.action;
    switch (action) {
      case 'redirect':
        var href = getRedirectUrl($link, opts);
        $link.attr('href', href);
        if (opts.new) {$link.attr('target', '_blank');}
        break;
      case 'popup':
        var id = 'mailto-' + index;
        $link.attr('data-ml-id', id);
        insertBootstrapCode($link, id, opts);
        break;
      default:
        console.log('Unknown action: ' + action);
    }
  }

  /**
   * Initializes mailtolink object and modify mailto: links of the current page.
   *
   * @param {Object} opts options to use during init
   */
  mailtolink.init = function(opts) {
    // 1. load options
    mailtolink.opts = $.extend({}, mailtolink.default, mailtolink.opts, opts);
    // 2. modify links
    //$('a[href^="mailto:"]').on("click", handleLink);
    $('a[href^="mailto:"]').each(function(index) {
      updateLink($(this), index);
    });
  };

  /**
   * Sets the value of form fields to the values supplied in the Get request.
   *
   * @param {String | Object} selector a selector pointing to a single form, or a jQuery instance
   * @param {String | URI} query url or instance of URI
   */
  mailtolink.fillFromQuery = function(selector, query) {
    if (!selector) {
      selector = mailtolink.opts.formSelector;
    }

    var $jq;
    if (typeof selector === 'string') {
      $jq = $(selector);
    } else {
      // a jQuery object
      $jq = selector;
    }
    var uQuery;
    if (!query) {
      query = window.location.href;
    }
    if (typeof query === 'string') {
      uQuery = new URI(query);
    } else {
      // a URI object
      uQuery = query;
    }
    var q = uQuery.query(true);
    $jq.find('input, textarea').each(function(index) {
      var name = $(this).attr('name');
      if (name && q[name]) {
        $(this).val(q[name]);
      }
    });
  };

  return mailtolink;
}));
