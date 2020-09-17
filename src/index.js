const { localStorage } = window;
const textArea = document.getElementById('note-text');
const noteSelector = document.getElementById('note-selector');
const stack = localStorage.getItem('noteStack');
if (!stack) localStorage.setItem('noteStack', JSON.stringify([]));
let queryString = window.location.search.slice(1);

const NoteStack = function(stack) {
  this.stack = stack;
};

NoteStack.prototype.modify = function(key) {
  const lastModified = this.stack.indexOf(key);
  this.stack.splice(lastModified, 1);
  this.stack.unshift(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
}

NoteStack.prototype.add = function(key) {
  this.stack.unshift(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
}

NoteStack.prototype.delete = function(key) {
  if (key.length === 0) return;
  const deleted = this.stack.indexOf(key);
  this.stack.splice(deleted, 1);
  localStorage.removeItem(key);
  localStorage.setItem('noteStack', JSON.stringify(this.stack));
}

NoteStack.prototype[Symbol.iterator] = function() {
  const stack = this.stack;
  return {
    next: function() {
      return { 
        value: stack[this.index], 
        done: this.index++ === stack.length, 
      };
    },
    index: 0,
  }
}

const noteStack = new NoteStack(stack ? JSON.parse(stack) : []);

const stringToHash = string => {
  let hash = 0;

  if (string.length === 0) return hash;

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;
};

const setDefault = () => {
  const url = window.location.href;
  const urlSplit = url.split("?");
  const obj = { Title: 'Notepad', Url: urlSplit[0] };
  history.pushState(obj, obj.Title, obj.Url);
  queryString = '';
  textArea.value = '';
};

const handleSelect = key => {
  const note = JSON.parse(localStorage.getItem(key));
  if (!note) return;
  textArea.value = note.text;
  const url = window.location.href;
  const urlSplit = url.split("?");
  const obj = { Title: 'Notepad', Url: `${urlSplit[0]}?${key}` };
  history.pushState(obj, obj.Title, obj.Url);
  queryString = window.location.search.slice(1);
};

const updateList = selected => {
  let result = '';

  for (const key of noteStack) {
    if (!isNaN(parseInt(key))) {
      const note = JSON.parse(localStorage.getItem(key));
      const className = (selected == key || queryString == note.noteName) ? 
        'selected' : '';
      result +=
      `<li>
        <div class="card ${className}" style="width: 18rem; margin-bottom: 10px;" onclick="updateList(${key})">
          <div class="card-body">
            <h5 class="card-title">${note.noteName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${note.dateString}</h6>
          </div>  
        </div>
      </li>`
    }
  }

  handleSelect(selected);
  noteSelector.innerHTML = `<ul>${result}</ul>`;
};

const newHandler = createNew => {
  const date = new Date();
  const dateString = `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`;
  const text = textArea.value;
  if (!text) return;
  const noteName = text.split('\n')[0];
  hash = createNew ? stringToHash(noteName).toString() : queryString;

  const noteData = { noteName, text, dateString };

  if (localStorage.getItem(hash)) {
    if (createNew) {
      hash = (parseInt(hash) * Math.random()).toString();
      noteStack.add(hash); 
    } else {
      noteStack.modify(hash);
    }

    localStorage.setItem(hash, JSON.stringify(noteData));
  } else if (createNew) {
    noteStack.add(hash);
    localStorage.setItem(hash, JSON.stringify(noteData));
  }
  
  updateList(hash);
};

const delHandler = () => {
  noteStack.delete(queryString);
  updateList();
  setDefault();
};

updateList(queryString);
