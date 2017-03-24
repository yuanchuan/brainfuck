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
    text() {
      return text[ it.curr() ]
    },
    skip(dir) {
      let count = 1;
      while (count) {
        this[dir]();
        let c = this.text();
        if (c == '[') count += (dir == 'next' ? 1 : -1);
        if (c == ']') count += (dir == 'prev' ? 1 : -1);
      }
    }
  })
}

function Tape() {
  const it = Iterator(0, Infinity);
  const reg = [];
  function output(c) {
    stdout.write(String.fromCharCode(c));
  }
  return Object.assign({}, it, {
    set(n) { reg[ it.curr() ] = (n < 0 ? 0 : n) },
    val() { return reg[ it.curr() ] },
    inc() { this.set((this.val() || 0) + 1) },
    dec() { this.set((this.val() || 0) - 1) },
    put() { output(this.val()) },
    get() {
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
  });
}

async function interpret(program) {
  const scanner = Scanner(program);
  const tape = Tape();
  while (!scanner.over()) {
    switch (scanner.text()) {
      case '>': tape.next(); break;
      case '<': tape.prev(); break;
      case '+': tape.inc(); break;
      case '-': tape.dec(); break;
      case '.': tape.put(); break;
      case ',': {
        stdin.resume();
        await tape.get();
        stdin.pause();
        break;
      }
      case '[': {
        if (!tape.val()) scanner.skip('next');
        break;
      }
      case ']': {
        if (tape.val()) scanner.skip('prev');
        break;
      }
    }
    scanner.next();
  }
}

module.exports = interpret;
