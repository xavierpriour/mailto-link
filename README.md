# mailto-link
Javascript library to turn 'mailto:' links into popup contact forms (and more)
- inspired by [mailto.ninja](http://mailto.ninja/).

Requires [Bootstrap](http://getbootstrap.com/) and [jQuery](http://jquery.com/) 

## Executive Summary
Use this library to transform your 'mailto:' links into contact forms (popup or simple redirection).
It lets you code your pages without worrying about how to contact you,
then enhance them in whatever way you prefer.

Install using `bower` package manager.
Usage is pretty simple: include the script, and call its `init()` method passing some options.
All options can be overridden on a link basis by setting `data-ml-[option_name]` attributes.

```html
<a href="mailto:test@example.com?subject=test" data-ml-url="my_form_url.html/">test@example.com</a>
<script type="text/javascript">
  var opts = {
    action: "popup"
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

If you want to do it manually, the package depends on:

- `jQuery` for DOM manipulation and options merging (`$.extend`)
- `URI.js` for mailto URI parsing
- `bootstrap` for styling and popup

So you should include all three files (see in `examples` directory how this is done).


## Usage and options settings
Basic usage: add the below code to all pages (just including the file is **not** sufficient)
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
- Directly set their value on the `mailtolink.opts` object before (acts as default option) or after it has been initialized
```javascript
mailtolink.opts.url = "contact.html";
mailtolink.init();
mailtolink.opts.action = "redirect";
```
- On a link, set an attribute called `data-ml-[name of option]` - this overrides prior definition 
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
- `new` (boolean, optional, defaults to `false`): if `true`, target URL will be displayed in a new window/tab,
otherwise it will use the current window/tab.
- `urlThen` (string, optional, defaults to current URL): a second URL,
typically to tell to contact form where to redirect after mail has been posted.
- `paramMailto` (string, optional, defaults to `'mailto'`): the name of the parameter passed to the url containing the
email address specified in the 'mailto:'. Set to `false` if you don't want the parameter to be passed.
- `paramThen` (string, optional, defaults to `'then'`): the name of the parameter passed to the url containing the
urlThen option. Set to `false` if you don't want the parameter to be passed.

### Popup
The link will open a popup dialog.
The content of the popup is another page on the same server, that will be downloaded through AJAX.
This page should include a regular form posting to a proper mailer page.
Our library will replace that with an AJAX posting and popup closing.
 
It is possible to specify a sub-part of the page to use, that way you can re-use your full-blown contact form
(see `examples/2-redirect.html`).
Parameters set either in `options.url` or the `mailto:` link will be applied to the form, if they match.
So you can use url to set subject, text, or any parameter (including hidden ones).
Those will then be posted with the form.

This is done by setting the option `action` to `popup`.

Acceptable options are:

- `url` (string, mandatory): the URL of the page containing the form. This url can include parameters.
For a simple functional page, you can use the included `bootstrap-popup.html`.
- `formSelector` (string, optional, defaults to `'form'`): a jQuery selector to specify which part of the loaded
url should be used for the contact form. The default is fine if your contact page only contains one form,
otherwise you might need to be more precise. 
- `paramMailto` (string, optional, defaults to `'mailto'`): name of the field (can be hidden or missing) in the
form that will hold the mailto link address
- `title` (string, optional, defaults to `null`): the title of the modal to display. If none is supplied,
modal will be displayed as is.
- `urlPost` (string, optional, defaults to `null`): the url to which the contact form should post.
This lets you reuse the same contact form to post to different url for different links.
If unspecified, it will use the form `action` attribute.
- `msgSelector` (string, optional, defaults to `'#mailto-msg'`): a selector to the element that will display the 
AJAX result message.

The html that is loaded must meet certain criteria:

- fields that should be input from url parameters must have their `name` attribute set to the exact parameter name.
- the element containing the modal title must have a CSS class of `modal-title`
- the part of the document matching `formSelector` must include exactly one form. The form can be the element or one
of its children
- that form must include exactly one element `<input type="submit">`
- the first `input` field of your form should be a uses-visible one, not a `hidden`

Also note that the form does **not** currently check required fields.

## Technical documentation

### Inner workings
The basic idea is that upon page load, the script modifies the DOM elements that are 'mailto:' links.

More precisely:

1. upon calling `init()` the script first sets its global options from defaults plus the supplied argument (if any).
2. Then it goes through all DOM elements with an `href` attribute starting with 'mailto:', and:
  1. reads all `data-ml-` attributes, and complete / override global options with their value
  2. then change the element to get the proper behavior (depending on the `action` option)

For redirect, we rewrite the `href` attribute (and the `target` if requesting a new tab)

For popup, we:

1. add a non-visible div for the popup form
2. load the popup form into that div with AJAX
3. apply request parameters to the loaded form
4. add an 'onClick' action to toggle form visibility

### Testing
We use:

- [CasperJS](http://casperjs.org/) to perform headless browser testing
- [Mocha](http://mochajs.org/) as the test framework
- [Chai](http://chaijs.com/) as the assertion library
- Grunt to launch test servers (php and mail) then run test suites
- a bunch of libraries to make all the above work together

In the end, testing is easy: `grunt test`.


### Contributing
- (if needed, install git), fork the repo, clone your fork > see https://help.github.com/articles/fork-a-repo/
- (if needed, install node) > see https://github.com/joyent/node/wiki/Installation
- in your folder run `npm install`
- (if needed, install bower) > see http://bower.io/#install-bower
- in your folder run `bower install`
- run tests to check everything is ok and start continuous integration: `grunt`
- now make your changes
- please include tests for all your changes
- then open a pull request > see https://help.github.com/articles/using-pull-requests/ (we use the fork&pull model)
