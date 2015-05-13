export default class Utils {
  constructor() {
    this.browser = this.getBrowser();
    this.engine = this.getEngine(this.browser);
  }

  clone(obj) {
    if (obj === null || !(obj instanceof Object)) {
      return obj;
    }

    var ret = '';

    if (obj instanceof Date) {
      ret = new Date();
      ret.setTime(obj.getTime());
      return ret;
    }

    if (obj instanceof Array) {
      ret = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        ret[i] = this.clone(obj[i]);
      }
      return ret;
    }

    if (obj instanceof Object) {
      ret = {};
      for (var attr in obj) {
        if (attr in obj) {
          ret[attr] = this.clone(obj[attr]);
        }
      }
      return ret;
    }

    throw new Error('Unable to clone object of unexpected type!');
  }

  swap(obj) {
    var ret = {};
    for (var attr in obj) {
      if (attr in obj) {
        ret[obj[attr]] = attr;
      }
    }
    return ret;
  }

  getBrowser() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
      // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera).
      return 'opera';
    } else if ('chrome' in window) {
      // Chrome 1+.
      return 'chrome';
    } else if (typeof InstallTrigger !== 'undefined') {
      // Firefox 1.0+.
      return 'firefox';
    } else if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
      // At least Safari 3+: "[object HTMLElementConstructor]".
      return 'safari';
    } else if (/*@cc_on!@*/false || !!document.documentMode) {
      // At least IE6.
      return 'ie';
    }
  }

  getEngine(browser) {
    browser = browser || this.getBrowser();

    if (browser === 'firefox') {
      return 'gecko';
    } else if (browser === 'opera' || browser === 'chrome' || browser === 'safari') {
      return 'webkit';
    } else if (browser === 'ie') {
      return 'trident';
    }
  }

  stripLeadingZeros(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return str.replace(/^0+(?=\d+)/g, '');
  }

  triggerEvent(el, name, data) {
    data = data || {};
    data.detail = data.detail || {};

    var event;

    if ('CustomEvent' in window) {
      event = new CustomEvent(name, data);
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(name, data.bubbles, data.cancelable, data.detail);
    }

    Object.keys(data.detail).forEach((key) => {
      event[key] = data.detail[key];
    });

    el.dispatchEvent(event);
  }
}
