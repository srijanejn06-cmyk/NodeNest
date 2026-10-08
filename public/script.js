const apiUrl = '/api/notes';

const form = document.getElementById('note-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const categoryInput = document.getElementById('category');
const submitButton = document.getElementById('submit-btn');
const cancelButton = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');
const notesList = document.getElementById('notes-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const formTitle = document.getElementById('form-title');

let notes = [];
let editingNoteId = null;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const showStatus = (message, type = 'info') => {
  statusMessage.textContent = message;
  statusMessage.className = `status-message visible ${type}`;
};

const clearStatus = () => {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
};

const setLoading = (isLoading, label = 'Save Note') => {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Saving...' : label;
};

const resetForm = () => {
  editingNoteId = null;
  form.reset();
  submitButton.textContent = 'Save Note';
  formTitle.textContent = 'Add New Note';
  cancelButton.classList.add('hidden');
  clearStatus();
};

const handleFormSubmit = async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const category = categoryInput.value.trim();

  if (!title || !content || !category) {
    showStatus('Please fill in all fields before saving.', 'error');
    return;
  }

  const noteData = { title, content, category };

  setLoading(true, editingNoteId ? 'Update Note' : 'Save Note');

  try {
    const url = editingNoteId ? `${apiUrl}/${editingNoteId}` : apiUrl;
    const method = editingNoteId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save note.');
    }

    showStatus(
      editingNoteId ? 'Note updated successfully.' : 'Note created successfully.',
      'success'
    );

    resetForm();
    await loadNotes();
  } catch (error) {
    showStatus(error.message || 'Something went wrong while saving the note.', 'error');
  } finally {
    setLoading(false, editingNoteId ? 'Update Note' : 'Save Note');
  }
};

const renderNotes = (items = notes) => {
  if (!items.length) {
    notesList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  notesList.innerHTML = items
    .map(
      (note) => `
        <article class="note-card">
          <div class="note-card-header">
            <h3>${escapeHtml(note.title)}</h3>
            <span class="note-category">${escapeHtml(note.category)}</span>
          </div>

          <p class="note-content">${escapeHtml(note.content)}</p>

          <div class="meta">
            <span>Created: ${formatDate(note.createdAt)}</span>
            <span>Updated: ${formatDate(note.updatedAt)}</span>
          </div>

          <div class="note-actions">
            <button class="edit-btn" data-action="edit" data-id="${note._id}">Edit</button>
            <button class="delete-btn" data-action="delete" data-id="${note._id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('');
};

const loadNotes = async () => {
  clearStatus();

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to load notes.');
    }

    notes = result.data || [];
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
      renderNotes(notes);
      return;
    }

    const filteredNotes = notes.filter((note) =>
      `${note.title} ${note.content} ${note.category}`.toLowerCase().includes(searchTerm)
    );

    renderNotes(filteredNotes);
  } catch (error) {
    notesList.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.textContent = error.message || 'Unable to fetch notes.';
  }
};

const openEditMode = (noteId) => {
  const note = notes.find((item) => item._id === noteId);
  if (!note) return;

  editingNoteId = noteId;
  titleInput.value = note.title;
  contentInput.value = note.content;
  categoryInput.value = note.category;
  formTitle.textContent = 'Edit Note';
  cancelButton.classList.remove('hidden');
  submitButton.textContent = 'Update Note';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteNote = async (noteId) => {
  const noteToDelete = notes.find((note) => note._id === noteId);
  if (!noteToDelete) return;

  const confirmed = window.confirm(`Delete "${noteToDelete.title}"?`);
  if (!confirmed) return;

  try {
    const response = await fetch(`${apiUrl}/${noteId}`, { method: 'DELETE' });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to delete note.');
    }

    showStatus('Note deleted successfully.', 'success');

    if (editingNoteId === noteId) {
      resetForm();
    }

    await loadNotes();
  } catch (error) {
    showStatus(error.message || 'Unable to delete note.', 'error');
  }
};

const handleNotesAction = (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const noteId = target.dataset.id;
  const action = target.dataset.action;

  if (action === 'edit') {
    openEditMode(noteId);
  }

  if (action === 'delete') {
    deleteNote(noteId);
  }
};

const searchNotes = () => {
  const query = searchInput.value.trim().toLowerCase();
  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.content} ${note.category}`.toLowerCase().includes(query)
  );

  renderNotes(filteredNotes);
};

form.addEventListener('submit', handleFormSubmit);
cancelButton.addEventListener('click', resetForm);
searchInput.addEventListener('input', searchNotes);
notesList.addEventListener('click', handleNotesAction);

loadNotes();
