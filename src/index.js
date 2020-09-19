const { localStorage } = window;
const textArea = document.getElementById('note-text');
const noteSelector = document.getElementById('note-selector');
const newButton = document.getElementById('new-button');
const delButton = document.getElementById('del-button');
const stack = localStorage.getItem('noteStack');
if (!stack) localStorage.setItem('noteStack', JSON.stringify([]));
let queryString = window.location.search.slice(1);
import NoteStack from './NoteStack.js';
const noteStack = new NoteStack(stack ? JSON.parse(stack) : []);

const stringToHash = string => {
  let hash = 0;

  if (string.length === 0) return hash;

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }

  return hash;
};

const setDefault = () => {
  const url = window.location.href;
  const urlSplit = url.split('?');
  const obj = { Title: 'Notepad', Url: urlSplit[0] };
  history.pushState(obj, obj.Title, obj.Url);
  queryString = '';
  textArea.value = '';
};

const handleSelect = key => {
  let note = JSON.parse(localStorage.getItem(key));

  if (!note) {
    for (const hash of noteStack) {
      const noteObj = JSON.parse(localStorage.getItem(hash));
      if (noteObj.noteName === queryString) {
        note = noteObj;
        break;
      }
    }
    if (!note) return;
  }

  textArea.value = note.text;
  const url = window.location.href;
  const urlSplit = url.split('?');
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
        <div class="card ${className}" \
        style="width: 18rem; margin-bottom: 10px;" id="${key}">
          <div class="card-body">
            <h5 class="card-title">${note.noteName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${note.dateString}</h6>
          </div>  
        </div>
      </li>`;
    }
  }

  handleSelect(selected);
  noteSelector.innerHTML = `<ul>${result}</ul>`;
  for (const key of noteStack)
    document.getElementById(key).onclick = updateList.bind(null, key);
};

const newHandler = createNew => {
  queryString = decodeURI(queryString);
  const date = new Date();
  const dateString = `${date.toLocaleTimeString()} \
  ${date.toLocaleDateString()}`;
  const text = textArea.value;
  if (!text) return;
  let hash;
  const noteName = text.split('\n')[0];
  if (createNew) {
    hash = stringToHash(noteName).toString();
  } else if (parseInt(queryString)) {
    hash = queryString;
  } else {
    for (const key of noteStack) {
      const noteObj = JSON.parse(localStorage.getItem(key));
      if (noteObj.noteName === queryString) {
        hash = key;
        break;
      }
    }
  }

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

queryString = decodeURI(queryString);
updateList(queryString);

newButton.onclick = newHandler.bind(null, true);
delButton.onclick = delHandler;
textArea.oninput = newHandler.bind(null, false);
