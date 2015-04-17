// we have to amend jshint rules due to casper-chai style
/* jshint expr:true */

var host = 'http://127.0.0.1:1999/';
var url = host + 'examples/2-popup.html';

describe('Popup', function() {
  before(function() {
    casper.start(url);
  });

  it('should insert proper elements and hide them', function() {
    casper.then(function() {
      casper.currentHTTPStatus.should.equal(200);
      /mailto/.should.matchTitle;
      [1, 2, 3].forEach(function(val) {
        ('#mailto-' + val).should.be.inDOM;
        ('#mailto-' + val).should.not.be.visible;
      });
    });
  });

  it('should show/hide modal on link click', function() {
    casper.then(function() {
      '#mailto-1'.should.not.be.visible;
      casper.click('a[href="#mailto-1"]');
      this.wait(200, function() {
        // we need some delay due to the form animation
        '#mailto-1'.should.be.visible;
        casper.click('#mailto-1 .btn-default');
        casper.wait(200, function() {
          '#mailto-1'.should.not.be.visible;
        });
      });
    });
  });
});
