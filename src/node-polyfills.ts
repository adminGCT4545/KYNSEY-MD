// Polyfills for Node.js modules in the browser environment

// Polyfill for util.inherits
if (typeof window !== 'undefined') {
  // Polyfill for fs module
  (window as any).fs = {
    existsSync: function(path: string) {
      // This is a simple mock implementation
      // In a browser environment, we can't actually check if a file exists
      // So we return true for now
      console.log('Mock fs.existsSync called with:', path);
      return true;
    },
    readFileSync: function(path: string, options?: { encoding?: string; flag?: string } | string) {
      console.log('Mock fs.readFileSync called with:', path);
      return '';
    },
    writeFileSync: function(path: string, data: any, options?: { encoding?: string; mode?: number; flag?: string } | string) {
      console.log('Mock fs.writeFileSync called with:', path);
    }
  };
  
  (window as any).util = {
    inherits: function(ctor: any, superCtor: any) {
      if (superCtor) {
        ctor.super_ = superCtor;
        Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
      }
    },
    inspect: function(obj: any) {
      return JSON.stringify(obj);
    },
    format: function(format: string, ...args: any[]) {
      let i = 0;
      return format.replace(/%s/g, () => args[i++]);
    },
    debuglog: function() {
      return function() {};
    }
  };

  // Polyfill for events.EventEmitter
  (window as any).events = {
    EventEmitter: class EventEmitter {
      private _events: Record<string, Function[]> = {};

      on(event: string, listener: Function) {
        if (!this._events[event]) {
          this._events[event] = [];
        }
        this._events[event].push(listener);
        return this;
      }

      emit(event: string, ...args: any[]) {
        if (!this._events[event]) {
          return false;
        }
        this._events[event].forEach(listener => listener(...args));
        return true;
      }

      removeListener(event: string, listener: Function) {
        if (!this._events[event]) {
          return this;
        }
        this._events[event] = this._events[event].filter(l => l !== listener);
        return this;
      }
    }
  };

  // Polyfill for buffer.Buffer
  (window as any).buffer = {
    Buffer: {
      from: function(data: any, encoding?: string) {
        if (typeof data === 'string') {
          return new TextEncoder().encode(data);
        }
        return data;
      },
      isBuffer: function(obj: any) {
        return obj instanceof Uint8Array;
      }
    }
  };
}

export {};
