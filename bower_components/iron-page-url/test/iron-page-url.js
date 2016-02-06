'use strict';

  function timePasses(ms) {
    return new Promise(function(resolve) {
      window.setTimeout(function() {
        resolve();
      }, ms);
    });
  }

  function tryUntilTrue(f) {
    return new Promise(function(resolve) {
      if (f()) {
        resolve();
      }
      var interval = setInterval(function() {
        if (f()) {
          clearInterval(interval);
          resolve();
        }
      }, 1);
    });
  }

  var originalFlush = flush;
  flush = function() {
    return new Promise(function(resolve) {
      originalFlush(resolve);
    });
  }

  suite('<iron-page-url>', function () {
    var initialUrl;
    setup(function() {
      initialUrl = window.location.href;
    });
    teardown(function(){
      window.history.replaceState({}, '', initialUrl);
    });

    suite('when used solo', function() {
      var urlElem;
      setup(function() {
        urlElem = document.createElement('iron-page-url');
        urlElem.attached();
      });
      teardown(function() {
        urlElem.detached();
      });
      test('basic functionality with #hash urls', function() {
        // Initialized to the window location's hash.
        expect(window.location.hash).to.be.equal(urlElem.hash);

        // Changing the urlElem's hash changes the URL
        urlElem.hash = '/lol/ok';
        expect(window.location.hash).to.be.equal('#/lol/ok');

        // Changing the hash via normal means changes the urlElem.
        var anchor = document.createElement('a');
        anchor.href = '#/wat';
        document.body.appendChild(anchor);
        anchor.click();
        // In IE10 it appears that the hashchange event is asynchronous.
        return timePasses(10).then(function() {
          expect(urlElem.hash).to.be.equal('/wat');
        });
      });
      test('basic functionality with paths', function() {
        // Initialized to the window location's path.
        expect(window.location.pathname).to.be.equal(urlElem.path);

        // Changing the urlElem's path changes the URL
        urlElem.path = '/foo/bar';
        expect(window.location.pathname).to.be.equal('/foo/bar');

        // Changing the path and sending a custom event on the window changes
        // the urlElem.
        window.history.replaceState({}, '', '/baz')
        window.dispatchEvent(new CustomEvent('location-changed'));
        expect(urlElem.path).to.be.equal('/baz');
      });
      test('basic functionality with ?key=value params', function() {
        // Initialized to the window location's params.
        expect(urlElem.query).to.be.eq('');

        // Changing location.search and sending a custom event on the window
        // changes the urlElem.
        window.history.replaceState({}, '', '/?greeting=hello&target=world');
        window.dispatchEvent(new CustomEvent('location-changed'));
        expect(urlElem.query).to.be.equal('greeting=hello&target=world');

        // Changing the urlElem's query changes the URL.
        urlElem.query = 'greeting=hello&target=world&another=key';
        expect(window.location.search).to.be.equal(
            '?greeting=hello&target=world&another=key');
      });
    });
  });