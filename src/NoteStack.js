const NoteStack = function(stack) {
  this.stack = stack;
};

NoteStack.prototype.modify = function(key) {
  const lastModified = this.stack.indexOf(key);
  this.stack.splice(lastModified, 1);
  this.stack.unshift(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
};

NoteStack.prototype.add = function(key) {
  this.stack.unshift(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
};

NoteStack.prototype.delete = function(key) {
  if (key.length === 0) return;
  const deleted = this.stack.indexOf(key);
  this.stack.splice(deleted, 1);
  localStorage.removeItem(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
};

NoteStack.prototype[Symbol.iterator] = function() {
  const stack = this.stack;
  return {
    next() {
      return {
        value: stack[this.index],
        done: this.index++ === stack.length,
      };
    },
    index: 0,
  };
};

export default NoteStack;
