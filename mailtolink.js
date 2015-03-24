(function (root, factory) {
  'use strict';
  // Browser globals (root is window)
  root.mailtolink = factory(root);
} (this, function (root) {
  'use strict';

  var mailtolink = {
    default: {
      action: "redirect",
      url: null,
      new: false,
      urlThen: window.location.href,
      paramMailto: "mailto",
      paramThen: "then"
    },
    opts: {}
  };

  function redirect(mailto, opts) {
    var urlMailto = URI(mailto);
    // build redirect url > start with supplied url
    var urlRedirect = URI(opts.url);
    // add any query set on the mailto
    var mailtoQuery = urlMailto.query(true);
    for(var key in mailtoQuery) {
      urlRedirect.setQuery(key, mailtoQuery[key]);
    }
    // then add the parameters
    urlRedirect.setQuery(opts.paramMailto, urlMailto.path());
    urlRedirect.setQuery(opts.paramThen, opts.urlThen);

    var href = urlRedirect.href();
    if (opts.new) {
      window.open(href, '_blank');
    } else {
      window.location = href;
    }
    console.log(href);
  };

  mailtolink.handleLink = function(evt) {
    var mailto = $(this).attr("href");

    // look for data-ml-* attributes to override opts
    var hasDataLink = false;
    var optsLink = {};
    for(var k in mailtolink.opts) {
      var val = $(this).attr("data-ml-"+k);
      if(val) {
        optsLink[k] = val;
        hasDataLink = true;
      }
    }
    // now let's merge the link opts with the opts defined upon creation
    var opts;
    if(hasDataLink) {
      opts = jQuery.extend({}, mailtolink.opts, optsLink);
    } else {
      opts = mailtolink.opts;
    }

    // finally dispatch to proper function depending on action
    var action = opts.action;
    switch(action) {
      case "redirect":
        redirect(mailto, opts);
        break;
      default:
        console.log("Unknown action: "+action);
    }
    return false;
  };

  mailtolink.init = function(opts) {
    mailtolink.opts = jQuery.extend({}, mailtolink.default, mailtolink.opts, opts);
    $('a[href^="mailto:"]').on("click", mailtolink.handleLink);
  };

  return mailtolink;
}));








