(function(root, factory) {
  'use strict';
  // Browser globals (root is window)
  root.mailtolink = factory(root);
} (this, function(root) {
  'use strict';

  var mailtolink = {
    // default need to have an entry for ALL possible options, even ones without sensible defaults.
    default: {
      action: 'redirect',
      url: null,
      new: false,
      urlThen: window.location.href,
      paramMailto: 'mailto',
      paramThen: 'then',
      formSelector: 'form'
    },
    opts: {}
  };

  function getRedirectUrl(mailto, opts) {
    var urlMailto = URI(mailto);
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
   * @param name
   */
  function optionName(name) {
    var result = name;
    $.each(mailtolink.default, function(key, value) {
      if(key.toLowerCase() === name) {
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
          console.log(name+"="+this.value);
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

  function displayPopup(event) {
    event.preventDefault();
    var id = $(this).attr('data-ml-id');
    //$('#'+id).toggle();
    return false;
  }

  function insertPopupCode($link, id, options) {
    //$('<div id="'+id+'" style="display:none;"></div>')
    // -- Bootstrap
    var $fragment = $('<div></div>');
    $fragment
      .load(options.url+' '+options.formSelector, function() {
        $(this).find('.modal').attr('id', id);
        var $form = $('#'+id+' form');
        mailtolink.fillFromQuery($form, options.url);
        mailtolink.fillFromQuery($form, $link.attr('href'));
      });
    $fragment.insertAfter($link);
    //$link.after('<div id="'+id+'" class="modal fade"><div class="modal-dialog"><div class="modal-body"></div></div></div>')
    //// -- /Bootstrap
    //  .load(opts.url+' '+opts.formSelector, function() {
    //    var $form = $('#'+id+' form');
    //    mailtolink.fillFromQuery($form, options.url);
    //    mailtolink.fillFromQuery($form, $link.attr('href'));
    //  })
    //  ;
  }

  function updateLink(jq, index) {
    var opts = optsFromLink(jq[0], mailtolink.opts);
    var mailto = jq.attr('href');
    var action = opts.action;
    switch (action) {
      case 'redirect':
        var href = getRedirectUrl(mailto, opts);
        jq.attr('href', href);
        if (opts.new) {jq.attr('target', '_blank');}
        break;
      case 'popup':
        var id = 'mailto-'+index;
        jq.attr('data-ml-id', id);
        // -- Bootstrap
        jq.attr('data-target', '#'+id);
        jq.attr('data-toggle', 'modal');
        // -- /Bootstrap
        insertPopupCode(jq, id, opts);

        //jq.click(displayPopup);
        // -- Bootstrap
        $('#'+id).modal({show:false});
        // -- /Bootstrap
        break;
      default:
        console.log('Unknown action: ' + action);
    }
  }

  /**
   * Initializes mailtolink object and modify mailto: links of the current page.
   *
   * @param opts Object options to use during init
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
   * @selector String or jQuery object - if String, it should be a selector pointing to a single form
   */
  mailtolink.fillFromQuery = function(selector, query) {
    if(!selector) {
      selector = mailtolink.opts.formSelector;
    }
    var $jq;
    if(typeof selector === 'string') {
      $jq = $(selector);
    } else {
      $jq = selector;
    }
    var q = (new URI(query)).query(true);
    $jq.find("input, textarea").each(function(index){
      var name = $(this).attr('name');
      if(q[name]) {
        $(this).val(q[name]);
      }
    });
  };

  return mailtolink;
}));
