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
    if(opts.paramMailto) { urlRedirect.setQuery(opts.paramMailto, urlMailto.path()); }
    if(opts.paramThen) { urlRedirect.setQuery(opts.paramThen, opts.urlThen); }

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
    //console.log(href);
  };

  function optsFromLink(node, opts) {
    var hasDataLink = false;
    var optsLink = {};
    var prefix = "data-ml-";
    $.each(node.attributes, function() {
      if(this.specified) {
        var name = this.name;
        if(name.lastIndexOf("data-ml-")===0) {
          name = name.slice(prefix.length);
          optsLink[name] = this.value;
          hasDataLink = true;
        }
      }
    });
    var result = {};
    if(hasDataLink) {
      result = $.extend({}, opts, optsLink);
    } else {
      result = opts;
    }
    return result;
  }

  function updateLink(jq) {
    var opts = optsFromLink(jq[0], mailtolink.opts);
    var mailto = jq.attr("href");
    var action = opts.action;
    switch(action) {
      case "redirect":
        var href = getRedirectUrl(mailto, opts);
        jq.attr("href", href);
        if(opts.new) {jq.attr("target", "_blank");}
        break;
      default:
        console.log("Unknown action: "+action);
    }
  }

  mailtolink.init = function(opts) {
    // 1. load options
    mailtolink.opts = $.extend({}, mailtolink.default, mailtolink.opts, opts);
    // 2. modify links
    //$('a[href^="mailto:"]').on("click", handleLink);
    $('a[href^="mailto:"]').each(function(index){
      updateLink($(this));
    });
  };

  return mailtolink;
}));








