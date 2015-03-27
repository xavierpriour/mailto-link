# mailto-link
Javascript library to turn 'mailto:' links into popup contact forms (and more) - inspired by [mailto.ninja](http://mailto.ninja/)


## Executive Summary
Use this library to transform your 'mailto:' links into contact forms (popup or simple redirection).
The forms can be either on your site, or an hosted mail form services (especially useful for static sites).
It lets you code your pages without worrying about how to contact you,
then enhance them in whatever way you prefer.

**This version only supports redirection, popup is in the works**

Install using `bower` package manager.
Usage is pretty simple: include the script, and call its `init()` method passing some options.
All options can be overridden on a link basis by setting `data-ml-[option_name]` attributes.

```html
<a href="mailto:test@example.com?subject=test" data-ml-url="http://my_form_url.com/">test@example.com</a>
<script type="text/javascript">
  var opts = {
    action: "redirect",
    new: true,
  };
  mailtolink.init(opts);
</script>
```

For more usages, see the `examples` directory.


## Install
Simplest way is through [Bower](http://bower.io/):
```
bower install mailto-link --save
```
Then concatenate and minify all the bower components and include the resulting file in your page.

If you want to do it manually, the package depends on `jQuery` and `URI.js`, so you should include all three files
(see in `examples` directory how this is done).


## Usage and options settings
Basic usage:
```javascript
mailtolink.init()
```

This library exposes a `mailtolink` global variable as its entry point.
Its `init()` function will initialize the library and transform all links with a `mailto:` URL present in the page.
The transformation is based on the options that were set.
The main option is `action`, to indicate if links should be replaced with a link to another page (`redirect`)
or if links should open a popup on the same page (`popup`).
 Acceptable options are described in the appropriate action section below.

You can set options in three ways (possibly at the same time):

- Pass them as an object to the `init()` function
```javascript
options = {
  action: "redirect"
};
mailtolink.init(options);
```
- Directly set their value on the `mailtolink.opts` object
```javascript
mailtolink.opts.action = "redirect";
mailtolink.init();
```
- On a link, set an attribute called `data-ml-[name of option]`
```html
<a href="mailto:test@example.com" data-ml-action="redirect">contact us</a>
```


## Actions

### Redirect
The links will redirect to another page (using an HTTP GET request, not a POST).
This page can be any URL, and several parameters will be added to it.
Typically, this page would be a contact form that uses said parameters to better personalize the mail it sends,
as well as which page to display afterward.

This is done by setting the option `action` to `redirect`.

Acceptable options are:

- `url` (string, mandatory): the URL of the page to redirect to. This url can include parameters.
- `new` (boolean, optional): if `true`, target URL will be displayed in a new window/tab,
otherwise it will use the current window/tab.
- `urlThen` (string, optional, defaults to current URL): a second URL,
typically to tell to contact form where to redirect after mail has been posted.
- `paramMailto` (string, optional, defaults to 'mailto'): the name of the parameter passed to the url containing the
email address specified in the 'mailto:'. Set to `false` if you don't want the parameter to be passed.
- `paramThen` (string, optional, defaults to 'then'): the name of the parameter passed to the url containing the
urlThen option. Set to `false` if you don't want the parameter to be passed.

### Popup
**Coming Soon, stay tuned**


## Technical documentation

### Inner workings
The basic idea is that upon page load, the script changes the DOM elements that are 'mailto:' links.

More precisely:

1. upon calling `init()` the script first sets its global options from defaults plus the supplied argument (if any).
2. Then it goes through all DOM elements with an `href` attribute starting with 'mailto:', and:
  1. reads all `data-ml-` attributes, and complete / override global options with their value
  2. then change the element to get the proper behavior (depending on the `action` option)
  3. for redirect, rewrite the `href` attribute (and the `target` if requesting a new tab)
  4. for popup, add a non-visible div for the popup form, and an 'on click' action to toggle its visibility

### Testing
