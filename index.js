const { stdin, stdout } = process;

function Iterator(min, max) {
  let idx = 0;
  return {
    jump(i) { return idx = Math.max(min, Math.min(max, i)) },
    next()  { return this.jump(++idx) },
    prev()  { return this.jump(--idx) },
    over()  { return idx == max },
    curr()  { return idx }
  }
}

function Scanner(text = '') {
  const it = Iterator(0, text.length - 1);
  return Object.assign({}, it, {
    get() {
      return text[ it.curr() ]
    },
    skip(dir) {
      let count = 1;
      while (count) {
        this[dir]();
        let c = this.get();
        if (c == '[') count += (dir == 'next' ? 1 : -1);
        if (c == ']') count += (dir == 'prev' ? 1 : -1);
      }
    }
  })
}

function Register(stream) {
  const it = Iterator(0, Infinity);
  const reg = [], pos = [];
  return Object.assign({}, it, {
    set(n) { reg[ it.curr() ] = (n < 0 ? 0 : n) },
    pos(v) { return pos[(v === undefined) ? 'pop' : 'push'](v) },
    val()  { return reg[ it.curr() ] },
    inc()  { this.set((this.val() || 0) + 1) },
    dec()  { this.set((this.val() || 0) - 1) },
    put()  { stdout.write(String.fromCharCode(this.val())) },
    get()  {
      return new Promise(resolve => {
        stdin.setEncoding('utf8');
        stdin.setRawMode(true);
        stdin.once('data', (c) => {
          stdin.setRawMode(false);
          this.set(c.charCodeAt(0));
          resolve();
        });
      });
    }
  })
}

module.exports = async function interpret(program) {
  const scanner = Scanner(program);
  const register = Register();
  while (!scanner.over()) {
    let c = scanner.get();
    switch (c) {
      case '>': register.next(); break;
      case '<': register.prev(); break;
      case '+': register.inc(); break;
      case '-': register.dec(); break;
      case '.': register.put(); break;
      case ',': {
        stdin.resume();
        await register.get();
        stdin.pause();
        break;
      }
      case '[': {
        if (!register.val()) scanner.skip('next');
        break;
      }
      case ']': {
        if (register.val()) scanner.skip('prev');
        break;
      }
    }
    scanner.next();
  }
}
