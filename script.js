// Get references to DOM elements
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitsList = document.getElementById('habitsList');
const emptyState = document.getElementById('emptyState');
const customMessageBox = document.getElementById('customMessageBox');

const confirmationModal = document.getElementById('confirmationModal');
const modalMessage = document.getElementById('modalMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Progress Bar Elements
const progressBarFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');

// Load habits from Local Storage or initialize an empty array
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let resolveConfirmation;
let editingIndex = -1; // To keep track of which habit is being edited (-1 means no edit in progress)

/**
 * Renders the list of habits to the DOM.
 * Clears the current list and re-renders all habits from the 'habits' array.
 * Also manages the visibility of the empty state message.
 */
function renderHabits() {
    habitsList.innerHTML = ''; // Clear current list to prevent duplicates
    if (habits.length === 0) {
        emptyState.classList.remove('hidden'); // Show empty state if no habits
    } else {
        emptyState.classList.add('hidden'); // Hide empty state if habits exist
        habits.forEach((habit, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('habit-item');
            if (habit.completed) {
                listItem.classList.add('completed'); // Add 'completed' class if habit is done
            }

            const habitNameSpan = document.createElement('span');
            habitNameSpan.textContent = habit.name;
            listItem.appendChild(habitNameSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            // Complete Button
            const completeBtn = document.createElement('button');
            completeBtn.classList.add('complete-btn');
            completeBtn.dataset.index = index;
            completeBtn.title = habit.completed ? 'غير مكتملة' : 'أكمل العادة';
            completeBtn.textContent = habit.completed ? '✅' : '✔️';
            actionsDiv.appendChild(completeBtn);

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.dataset.index = index;
            editBtn.title = 'تعديل العادة'; // Edit Habit
            editBtn.textContent = '✏️';
            actionsDiv.appendChild(editBtn);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.dataset.index = index;
            deleteBtn.title = 'حذف العادة';
            deleteBtn.textContent = '🗑️';
            actionsDiv.appendChild(deleteBtn);

            listItem.appendChild(actionsDiv);
            habitsList.appendChild(listItem); // Add the habit item to the list
        });
    }
    saveHabits(); // Always save habits to Local Storage after rendering changes
    updateProgressBar(); // Update progress bar after rendering habits
}

/**
 * Adds a new habit or updates an existing one if editingIndex is set.
 * Validates input and then calls renderHabits to update the UI.
 */
function addOrUpdateHabit() {
    console.log("Add/Update Habit button clicked!"); // Debugging log
    const habitName = habitInput.value.trim(); // Get and trim the input value
    if (!habitName) { // Check if input is empty
        showMessage('الرجاء إدخال اسم العادة!', 'error'); // Please enter a habit name!
        return;
    }

    if (editingIndex > -1) { // If editing an existing habit
        habits[editingIndex].name = habitName; // Update the name
        showMessage('تم تحديث العادة بنجاح!', 'info'); // Habit updated successfully!
        editingIndex = -1; // Reset editing state
        addHabitBtn.textContent = 'إضافة عادة'; // Change button text back to "Add Habit"
    } else { // Adding a new habit
        habits.push({ name: habitName, completed: false }); // Add new habit object
        showMessage('تمت إضافة العادة بنجاح!', 'info'); // Habit added successfully!
    }
    habitInput.value = ''; // Clear the input field
    renderHabits(); // Re-render the list (which calls updateProgressBar)
}

/**
 * Sets up the input field for editing a habit.
 * @param {number} index - The index of the habit to edit.
 */
function editHabit(index) {
    editingIndex = index; // Store the index of the habit being edited
    habitInput.value = habits[index].name; // Populate the input field with the current habit name
    addHabitBtn.textContent = 'حفظ التعديل'; // Change button text to "Save Edit"
    habitInput.focus(); // Focus on the input field
    showMessage('قم بتعديل العادة ثم اضغط "حفظ التعديل".', 'info'); // Edit the habit then click "Save Edit".
}

/**
 * Toggles the completion status of a habit at a given index.
 * @param {number} index - The index of the habit in the 'habits' array.
 */
function toggleComplete(index) {
    habits[index].completed = !habits[index].completed;
    renderHabits(); // Re-render to update UI (which calls updateProgressBar)
    if (habits[index].completed) {
        showMessage('تم إكمال العادة!', 'info'); // Habit completed!
    } else {
        showMessage('تم إلغاء إكمال العادة.', 'info'); // Habit uncompleted.
    }
}

/**
 * Deletes a habit from the 'habits' array at a given index.
 * Uses a custom confirmation modal before deleting.
 * @param {number} index - The index of the habit to delete.
 */
async function deleteHabit(index) {
    const confirmed = await showConfirmationModal('هل أنت متأكد أنك تريد حذف هذه العادة؟'); // Are you sure you want to delete this habit?
    if (confirmed) {
        habits.splice(index, 1); // Remove habit from array
        renderHabits(); // Re-render the list (which calls updateProgressBar)
        showMessage('تم حذف العادة بنجاح!', 'info'); // Habit deleted successfully!
    }
}

/**
 * Saves the current 'habits' array to Local Storage.
 * This ensures data persists even if the browser is closed.
 */
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

/**
 * Displays a message in the custom message box.
 * @param {string} message - The message text.
 * @param {string} type - 'info' or 'error' to change styling.
 */
function showMessage(message, type = 'info') {
    customMessageBox.textContent = message;
    customMessageBox.className = 'message-box show ' + type; // Set classes for visibility and type

    // Automatically hide after 3 seconds
    setTimeout(() => {
        customMessageBox.classList.remove('show');
    }, 3000);
}

/**
 * Shows a custom confirmation modal and returns a Promise that resolves
 * to true if confirmed, false if cancelled.
 * @param {string} message - The message to display in the modal.
 * @returns {Promise<boolean>} - True if confirmed, false otherwise.
 */
function showConfirmationModal(message) {
    modalMessage.textContent = message;
    confirmationModal.classList.add('show'); // Show the modal overlay

    return new Promise(resolve => {
        resolveConfirmation = resolve; // Store the resolve function
    });
}

/**
 * Hides the confirmation modal and resolves the promise with the given boolean.
 * @param {boolean} result - True for confirm, false for cancel.
 */
function hideConfirmationModal(result) {
    confirmationModal.classList.remove('show'); // Hide the modal overlay
    if (resolveConfirmation) {
        resolveConfirmation(result); // Resolve the promise
        resolveConfirmation = null; // Clear the stored resolve function
    }
}

/**
 * Calculates and updates the progress bar based on completed habits.
 */
function updateProgressBar() {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.completed).length;

    let percentage = 0;
    if (totalHabits > 0) {
        percentage = (completedHabits / totalHabits) * 100;
    }

    progressBarFill.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}% (${completedHabits}/${totalHabits})`;
}

// --- Event Listeners ---

// Add habit when 'Add Habit' button is clicked
addHabitBtn.addEventListener('click', addOrUpdateHabit);

// Add habit when 'Enter' key is pressed in the input field
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addOrUpdateHabit();
    }
});

// Event delegation for complete, edit, and delete buttons
// Listen for clicks on the habits list and determine which button was clicked
habitsList.addEventListener('click', (e) => {
    const target = e.target;
    const index = target.dataset.index; // Get the data-index attribute

    if (target.classList.contains('complete-btn')) {
        toggleComplete(parseInt(index)); // Convert index to integer
    } else if (target.classList.contains('edit-btn')) {
        editHabit(parseInt(index)); // Convert index to integer
    } else if (target.classList.contains('delete-btn')) {
        deleteHabit(parseInt(index)); // Convert index to integer
    }
});

// Event listeners for the confirmation modal buttons
confirmDeleteBtn.addEventListener('click', () => hideConfirmationModal(true));
cancelDeleteBtn.addEventListener('click', () => hideConfirmationModal(false));

// Initial render when the page loads to display existing habits and update progress bar
document.addEventListener('DOMContentLoaded', renderHabits);
