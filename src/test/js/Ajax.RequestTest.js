/*
 * Copyright (c) 2012, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

var assert = buster.assertions.assert;

buster.testCase('AJAX tests', {
  /**
   * Async test for testing that the context is used for the 'this' reference in event handler calls.
   *
   * @param done The done callback for async testing.
   */
  'context': function(done) {
    var MyClass = function() {
      this.called = false;
    };

    MyClass.prototype = {
      handleFunction: function() {
        this.called = true;
      }
    };

    var handler = new MyClass();
    new Prime.Ajax.Request('ajax-response.html').
      withSuccessHandler(handler.handleFunction).
      withContext(handler).
      go();

    setTimeout(function() {
      assert(handler.called);
      done();
    }, 200);
  },

  'data array': function() {
    var req = new Prime.Ajax.Request('invalid.html', 'POST').
      withData({
        'array': ['value1', 'value2'],
        'name': 'value'
      });

    assert.equals(req.body, 'array=value1&array=value2&name=value');
    assert.isNull(req.queryParams);
    assert.equals(req.contentType, 'application/x-www-form-urlencoded');
  },

  'data array empty': function() {
    var req = new Prime.Ajax.Request('invalid.html', 'POST').
      withData({
        'name1': 'value1',
        'array': [],
        'name2': 'value2'
      });

    assert.equals(req.body, 'name1=value1&name2=value2');
    assert.isNull(req.queryParams);
    assert.equals(req.contentType, 'application/x-www-form-urlencoded');
  },

  'data POST': function() {
    var req = new Prime.Ajax.Request('invalid.html', 'POST').
      withData({
        'name': 'value',
        'nameWith=': 'value',
        'valueWith=': 'value='
      });

    assert.equals(req.body, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.isNull(req.queryParams);
    assert.equals(req.contentType, 'application/x-www-form-urlencoded');
  },

  'data GET':function () {
    var req = new Prime.Ajax.Request('invalid.html').
        withContentType('application/json').
        withData({
          'name':'value',
          'nameWith=':'value',
          'valueWith=':'value='
        });

    assert.equals(req.queryParams, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.isNull(req.body);
    assert.equals(req.contentType, 'application/json');

    req.xhr = new Mock.XHR();
    req.go();

    assert.equals(req.xhr.url, 'invalid.html?name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.equals(req.xhr.method, 'GET');
  },

  'reset':function () {
    var req = new Prime.Ajax.Request('invalid.html').
        withContentType('application/json').
        withData({
          'name':'value',
          'nameWith=':'value',
          'valueWith=':'value='
        });

    assert.equals(req.queryParams, 'name=value&nameWith%3D=value&valueWith%3D=value%3D');
    assert.equals(req.contentType, 'application/json');
    assert.equals(req.method, 'GET');

    req.reset();
    assert.isNull(req.queryParams);
    assert.isNull(req.contentType);
    assert.equals(req.method, 'GET');
  },

  /**
   * Async test for error completion handling.
   *
   * @param done The done callback for async testing.
   */
  'error': function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('invalid.html').
      withErrorHandler(handler).
      go();

    setTimeout(function() {
      assert(called);
      done();
    }, 200);
  },

  /**
   * Async test for loading handling.
   *
   * @param done The done callback for async testing.
   */
  'loading': function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('ajax-response.html').
      withLoadingHandler(handler).
      go();

    setTimeout(function() {
      assert(called);
      done();
    }, 200);
  },

  /**
   * Async test for open handling.
   *
   * @param done The done callback for async testing.
   */
  'open': function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('ajax-response.html').
      withOpenHandler(handler).
      go();

    setTimeout(function() {
      assert(called);
      done();
    }, 200);
  },

  /**
   * Async test for send handling.
   *
   * @param done The done callback for async testing.
   */
  'send': function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('ajax-response.html').
      withSendHandler(handler).
      go();

    setTimeout(function() {
      assert(called);
      done();
    }, 200);
  },

  /**
   * Async test for testing that the context is used for the 'this' reference in event handler calls.
   *
   * @param done The done callback for async testing.
   */
  'subclass': function(done) {
    function MyAjaxRequest(url) {
      Prime.Ajax.Request.apply(this, arguments);
      this.called = false;
    }

    // Extend and override the success handler
    MyAjaxRequest.prototype = new Prime.Ajax.Request();
    MyAjaxRequest.prototype.constructor = MyAjaxRequest;
    MyAjaxRequest.prototype.onSuccess = function() {
      this.called = true;
    };

    var ajax = new MyAjaxRequest('ajax-response.html').
      go();

    setTimeout(function() {
      assert(ajax.called);
      done();
    }, 200);
  },

  /**
   * Async test for successful completion handling.
   *
   * @param done The done callback for async testing.
   */
  'success': function(done) {
    var called = false;
    var handler = function() {
      called = true;
    };

    new Prime.Ajax.Request('ajax-response.html').
      withSuccessHandler(handler).
      go();

    setTimeout(function() {
      assert(called);
      done();
    }, 200);
  },

  /**
   * Async test for JSON response handling.
   *
   * @param done The done callback for async testing.
   */
  'responseType': function(done) {
    var json = null;
    var handler = function(xhr) {
      json = JSON.parse(xhr.responseText);
    };

    var request = new Prime.Ajax.Request('ajax-response.json').withSuccessHandler(handler);
    request.xhr.overrideMimeType("application/json");
    request.go();

    setTimeout(function() {
      assert.isTrue(json.success);
      done();
    }, 200);
  }
});