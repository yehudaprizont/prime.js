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
var Prime = Prime || {};

/**
 * The Prime.Ajax namespace. This namespace contains a single class (for now) called Request.
 *
 * @namespace Prime.Ajax
 */
Prime.Ajax = Prime.Ajax || {};

/**
 * Makes a new AJAX request.
 *
 * @constructor
 * @param {string} [url] The URL to call. This can be left out for sub-classing but should otherwise be provided.
 * @param {string} [method=GET] The HTTP method to use. You can specify GET, POST, PUT, DELETE, HEAD, SEARCH, etc.
 */
Prime.Ajax.Request = function(url, method) {
  this.xhr = new XMLHttpRequest();
  this.async = true;
  this.body = null;
  this.queryParams = null;
  this.contentType = null;
  this.context = this;
  this.errorHandler = this.onError;
  this.loadingHandler = this.onLoading;
  this.method = method || 'GET';
  this.openHandler = this.onOpen;
  this.password = null;
  this.sendHandler = this.onSend;
  this.successHandler = this.onSuccess;
  this.unsetHandler = this.onUnset;
  this.url = url;
  this.username = null;
};

Prime.Ajax.Request.prototype = {
  /**
   * Changes the URL to call.
   *
   * @param {string} url The new URL to call.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  forURL: function(url) {
    this.url = url;
    return this;
  },

  /**
   * Invokes the AJAX request. If the URL is not set, this throws an exception.
   *
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  go: function() {
    if (!this.url) {
      throw new TypeError('No URL set for AJAX request');
    }

    var requestUrl = this.url;
    if ((this.method === 'GET' || this.method === 'DELETE') && this.queryParams !== null) {
      if (requestUrl.indexOf('?') === -1) {
        requestUrl += '?' + this.queryParams;
      } else {
        requestUrl += '&' + this.queryParams;
      }
    }

    if (this.async) {
      this.xhr.onreadystatechange = Prime.Utils.proxy(this.handler, this);
    }

    this.xhr.open(this.method, requestUrl, this.async, this.username, this.password);

    if (this.contentType) {
      this.xhr.setRequestHeader('Content-Type', this.contentType);
    }

    this.xhr.send(this.body);

    return this;
  },

  /**
   * Default handler for the "completed" state and an HTTP response status of anything but 2xx. Sub-classes can override
   * this handler or you can pass in a handler function to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onError: function(xhr) {
  },

  /**
   * Default handler for the "loading" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withLoadingHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onLoading: function(xhr) {
  },

  /**
   * Default handler for the "open" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withOpenHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onOpen: function(xhr) {
  },

  /**
   * Default handler for the "send" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withSendHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onSend: function(xhr) {
  },

  /**
   * Default handler for the "complete" state and an HTTP response status of 2xx. Sub-classes can override this handler
   * or you can pass in a handler function to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onSuccess: function(xhr) {
  },

  /**
   * Default handler for the "unset" state. Sub-classes can override this handler or you can pass in a handler function
   * to the {@link #withUnsetHandler}.
   *
   * @param {XMLHttpRequest} xhr The XMLHttpRequest object.
   */
  onUnset: function(xhr) {
  },

  /**
   * Sets the async flag to false.
   *
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  synchronously: function() {
    this.async = false;
    return this;
  },

  /**
   * Sets the method used to make the AJAX request.
   *
   * @param {string} method The HTTP method.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  usingMethod: function(method) {
    this.method = method;
    return this;
  },

  /**
   * Sets the request body for the request.
   *
   * @param {string} body The request body.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withBody: function(body) {
    this.body = body;
    return this;
  },

  /**
   * Sets the content type for the request.
   *
   * @param {string} contentType The contentType.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withContentType: function(contentType) {
    this.contentType = contentType;
    return this;
  },

  /**
   * Sets the context for the AJAX handler functions. The object set here will be the "this" reference inside the handler
   * functions.
   *
   * @param {Object} context The context object.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withContext: function(context) {
    this.context = context;
    return this;
  },

  /**
   * Sets the data object for the request. Will store the values for query parameters or post data depending on the
   * method that is set.  If the method is a post or put, will also set content-type to x-www-form-urlencoded.
   *
   * @param {Object} data The data object.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withData: function(data) {
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        if (this.method === 'PUT' || this.method === 'POST') {
          this.body = this.addDataValue(this.body, prop, data[prop]);
        } else {
          this.queryParams = this.addDataValue(this.queryParams, prop, data[prop]);
        }
      }
    }

    if (this.method === "PUT" || this.method === "POST") {
      this.contentType = 'application/x-www-form-urlencoded';
    }
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "complete" and the HTTP status in the response is
   * not 2xx.
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withErrorHandler: function(func) {
    this.errorHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "loading".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withLoadingHandler: function(func) {
    this.loadingHandler = func;
    return this;
  },

  /**
   * Sets the XMLHTTPRequest's response type field, which will control how the response is parsed.
   *
   * @param {string} responseType The response type.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withResponseType: function(responseType) {
    this.xhr.responseType = responseType;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "open".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withOpenHandler: function(func) {
    this.openHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "send".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withSendHandler: function(func) {
    this.sendHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "complete" and the HTTP status in the response is
   * 2xx.
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withSuccessHandler: function(func) {
    this.successHandler = func;
    return this;
  },

  /**
   * Sets the handler to invoke when the state of the AJAX request is "unset".
   *
   * @param {Function} func The handler function.
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  withUnsetHandler: function(func) {
    this.unsetHandler = func;
    return this;
  },

  /**
   * Resets the Request back to a base state (basically just the URL + method).  This can be
   * useful if a component is going to make many requests to the same endpoint with different parameters.
   *
   * @return {Prime.Ajax.Request} This Prime.Ajax.Request.
   */
  reset: function() {
    this.queryParams = null;
    this.data = null;
    this.body = null;
    this.contentType = null;
    return this;
  },

  /**
   * @private
   */
  handler: function() {
    if (this.xhr.readyState === 0) {
      this.unsetHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 1) {
      this.openHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 2) {
      this.sendHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 3) {
      this.loadingHandler.call(this.context, this.xhr);
    } else if (this.xhr.readyState === 4) {
      if (this.xhr.status >= 200 && this.xhr.status <= 299) {
        this.successHandler.call(this.context, this.xhr);
      } else {
        this.errorHandler.call(this.context, this.xhr);
      }
    }
  },

  /**
   * Adds the given name-value pair to the given data String. If the value is an array, it adds multiple values for each
   * piece. Otherwise, it assumes value is a String or can be converted to a String.
   *
   * @private
   * @param {string} dataString The data String used to determine if an ampersand is necessary.
   * @param {string} name The name of the name-value pair.
   * @param {string|Array} value The value of the name-value pair.
   * @return {string} The new data string.
   */
  addDataValue: function(dataString, name, value) {
    var result = '';
    if (value instanceof Array) {
      for (var i = 0; i < value.length; i++) {
        result += encodeURIComponent(name) + '=' + encodeURIComponent(value[i]);
        if (i + 1 < value.length) {
          result += '&';
        }
      }
    } else {
      result = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    if (dataString !== null && result !== '') {
      result = dataString + '&' + result;
    } else if (dataString !== null && result === '') {
      result = dataString;
    }

    return result;
  }
};