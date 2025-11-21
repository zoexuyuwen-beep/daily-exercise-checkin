const DB_KEY = 'exerciseCheckins';

const getCheckins = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
};

const setCheckins = (checkins) => {
    localStorage.setItem(DB_KEY, JSON.stringify(checkins));
};

const deleteCheckin = (id) => {
    const checkins = getCheckins().filter((checkin) => checkin.id !== id);
    setCheckins(checkins);
    updateStats();
    displayHistory();
};

const calculateStats = (checkins) => {
    const stats = {
        totalCheckins: checkins.length,
        totalMinutes: 0,
        totalDays: new Set(),
        exerciseTypes: {},
    };

    checkins.forEach((checkin) => {
        stats.totalMinutes += checkin.duration || 0;
        if (checkin.date) {
            stats.totalDays.add(checkin.date);
        }
        const type = checkin.exerciseType || 'other';
        stats.exerciseTypes[type] = (stats.exerciseTypes[type] || 0) + 1;
    });

    stats.totalDays = stats.totalDays.size;
    stats.averageMinutes = stats.totalCheckins > 0
        ? Math.round(stats.totalMinutes / stats.totalCheckins)
        : 0;
    stats.mostCommonExercise = Object.keys(stats.exerciseTypes).length > 0
        ? Object.keys(stats.exerciseTypes).reduce((a, b) =>
            stats.exerciseTypes[a] > stats.exerciseTypes[b] ? a : b)
        : 'None';

    return stats;
};

const updateStats = () => {
    const stats = calculateStats(getCheckins());
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>${stats.totalCheckins}</h3>
            <p>Total Check-ins</p>
        </div>
        <div class="stat-card">
            <h3>${stats.totalMinutes}</h3>
            <p>Total Minutes</p>
        </div>
        <div class="stat-card">
            <h3>${stats.totalDays}</h3>
            <p>Active Days</p>
        </div>
        <div class="stat-card">
            <h3>${stats.averageMinutes}</h3>
            <p>Avg Minutes/Check-in</p>
        </div>
    `;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const buildHistoryItem = (checkin, date) => {
    const exerciseType = checkin.exerciseType || 'Unknown';
    const duration = checkin.duration || 0;
    const notes = checkin.notes || '';
    const timestamp = checkin.timestamp || new Date(date).toISOString();

    return `
        <div class="history-item">
            <div class="history-header">
                <div>
                    <span class="history-date">${formatDate(date)}</span>
                    <span class="history-time">${formatTime(timestamp)}</span>
                </div>
                <button class="delete-btn" data-id="${checkin.id}">Delete</button>
            </div>
            <div class="history-content">
                <div class="history-detail">
                    <strong>Exercise Type</strong>
                    ${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}
                </div>
                <div class="history-detail">
                    <strong>Duration</strong>
                    ${duration} minutes
                </div>
                ${notes ? `
                <div class="history-detail history-notes">
                    <strong>Notes</strong>
                    ${notes}
                </div>` : ''}
            </div>
        </div>
    `;
};

const displayHistory = () => {
    const historyList = document.getElementById('historyList');
    const filterDate = document.getElementById('filterDate').value;
    const filterExercise = document.getElementById('filterExercise').value;

    let checkins = getCheckins();
    if (filterDate) {
        checkins = checkins.filter((checkin) => (checkin.date === filterDate));
    }
    if (filterExercise) {
        checkins = checkins.filter((checkin) => (checkin.exerciseType === filterExercise));
    }

    checkins.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date);
        const dateB = new Date(b.timestamp || b.date);
        return dateB - dateA;
    });

    if (checkins.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <h2>No check-ins found</h2>
                <p>Start tracking your exercises to see your history here!</p>
            </div>
        `;
        return;
    }

    const groupedByDate = checkins.reduce((acc, checkin) => {
        const date = checkin.date || new Date(checkin.timestamp).toISOString().split('T')[0];
        acc[date] = acc[date] || [];
        acc[date].push(checkin);
        return acc;
    }, {});

    const content = Object.keys(groupedByDate)
        .sort((a, b) => new Date(b) - new Date(a))
        .map((date) => groupedByDate[date].map((checkin) => buildHistoryItem(checkin, date)).join(''))
        .join('');

    historyList.innerHTML = content;
};

const clearFilters = () => {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterExercise').value = '';
    displayHistory();
};

const initHistoryPage = () => {
    const filterDate = document.getElementById('filterDate');
    const filterExercise = document.getElementById('filterExercise');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const historyList = document.getElementById('historyList');

    filterDate.addEventListener('change', displayHistory);
    filterExercise.addEventListener('change', displayHistory);
    clearFiltersBtn.addEventListener('click', clearFilters);

    historyList.addEventListener('click', (event) => {
        if (event.target.matches('.delete-btn')) {
            deleteCheckin(event.target.dataset.id);
        }
    });

    updateStats();
    displayHistory();
};

document.addEventListener('DOMContentLoaded', initHistoryPage);

