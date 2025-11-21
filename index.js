const DB_KEY = 'exerciseCheckins';

const getCheckins = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
};

const saveCheckin = (checkin) => {
    const checkins = getCheckins();
    checkin.id = Date.now().toString();
    checkin.timestamp = new Date().toISOString();
    checkins.push(checkin);
    localStorage.setItem(DB_KEY, JSON.stringify(checkins));
    return checkin;
};

const getTodayCheckins = () => {
    const checkins = getCheckins();
    const today = new Date().toDateString();
    return checkins.filter((checkin) => {
        const checkinDate = new Date(checkin.timestamp).toDateString();
        return checkinDate === today;
    });
};

const formatExerciseItem = (checkin) => `
    <div class="exercise-item">
        <h3>${checkin.exerciseType.charAt(0).toUpperCase() + checkin.exerciseType.slice(1)}</h3>
        <p><strong>Duration:</strong> ${checkin.duration} minutes</p>
        ${checkin.notes ? `<p><strong>Notes:</strong> ${checkin.notes}</p>` : ''}
        <p style="color: #999; font-size: 0.85em; margin-top: 8px;">
            ${new Date(checkin.timestamp).toLocaleTimeString()}
        </p>
    </div>
`;

const displayTodayExercises = () => {
    const exercisesList = document.getElementById('exercisesList');
    const submittedExercises = document.getElementById('submittedExercises');
    const todayCheckins = getTodayCheckins();

    if (todayCheckins.length === 0) {
        submittedExercises.classList.add('hidden');
        exercisesList.innerHTML = '';
        return;
    }

    submittedExercises.classList.remove('hidden');
    exercisesList.innerHTML = todayCheckins.map(formatExerciseItem).join('');
};

const showSuccessMessage = (form) => {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '✓ Check-in saved successfully!';
    form.insertBefore(successMsg, form.firstChild);
    setTimeout(() => successMsg.remove(), 3000);
};

const handleFormSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const exerciseType = document.getElementById('exerciseType').value;
    const duration = parseInt(document.getElementById('duration').value, 10);
    const notes = document.getElementById('notes').value;
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    saveCheckin({
        date,
        exerciseType,
        duration,
        notes,
    });

    showSuccessMessage(form);
    displayTodayExercises();
    form.reset();
};

const initIndexPage = () => {
    const dateDisplay = document.getElementById('dateDisplay');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);

    const form = document.getElementById('exerciseForm');
    const clearButton = document.getElementById('clearButton');

    form.addEventListener('submit', handleFormSubmit);
    clearButton.addEventListener('click', () => form.reset());

    displayTodayExercises();
};

document.addEventListener('DOMContentLoaded', initIndexPage);

