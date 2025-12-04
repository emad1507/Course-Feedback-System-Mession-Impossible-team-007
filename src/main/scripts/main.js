// scripts/main.js - Course Feedback System JavaScript

// Global state
let courses = [];
let currentCourse = null;
let selectedTemplate = 'quick';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSampleData();
    initializeEventListeners();
});

// Load sample data
function loadSampleData() {
    courses = [
        {
            id: 1,
            name: 'OCMI',
            code: 'CS87',
            description: 'No description',
            sessions: 0,
            sessionsData: []
        },
        {
            id: 2,
            name: 'Prog I',
            code: 'CS50',
            description: 'This is an Example for the course description.',
            sessions: 0,
            sessionsData: [
                {
                    id: 1,
                    name: 'Intro to PostFix',
                    week: 1,
                    status: 'closed',
                    responses: 18,
                    template: 'quick'
                },
                {
                    id: 2,
                    name: 'Intro to C',
                    week: 2,
                    status: 'closed',
                    responses: 8,
                    template: 'comprehensive'
                },
                {
                    id: 3,
                    name: 'Zeiger',
                    week: 3,
                    status: 'closed',
                    responses: 0,
                    template: 'lecture'
                }
            ]
        }
    ];
    
    // Update session counts
    courses.forEach(course => {
        if (course.sessionsData) {
            course.sessions = course.sessionsData.length;
        }
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Tab switching (Login/Signup)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', handleTabSwitch);
    });

    // Template selection
    document.addEventListener('click', handleTemplateSelection);

    // Tag filtering
    document.addEventListener('click', handleTagFilter);

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', handleModalBackgroundClick);
    });
}

// ==================== LOGIN & AUTHENTICATION ====================

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, you'd call an API)
    if (email && password) {
        showPage('dashboard-page');
        renderCourses();
    } else {
        alert('Please enter valid credentials');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showPage('login-page');
        // Reset form
        document.getElementById('login-form').reset();
    }
}

// ==================== PAGE NAVIGATION ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function goToDashboard() {
    showPage('dashboard-page');
    currentCourse = null;
    renderCourses();
}

function goBackToCourse() {
    if (currentCourse) {
        viewCourse(currentCourse.id);
    } else {
        goToDashboard();
    }
}

// ==================== COURSE MANAGEMENT ====================

function renderCourses() {
    const container = document.getElementById('courses-container');
    
    if (!container) return;
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <p>You haven't created any courses yet.</p>
                <button class="btn btn-primary" onclick="openCreateCourseModal()">Create Your First Course</button>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-card-header">
                <div class="course-card-title">
                    <h3>${escapeHtml(course.name)}</h3>
                    <p class="course-code">${escapeHtml(course.code)}</p>
                </div>
                <button class="course-delete-btn" onclick="deleteCourse(${course.id})" title="Delete course">🗑️</button>
            </div>
            <p class="course-description">${escapeHtml(course.description)}</p>
            <div class="course-stats">
                <span>📊 ${course.sessions} Sessions</span>
            </div>
            <div class="course-actions">
                <button class="btn btn-secondary" onclick="viewCourse(${course.id})">View Sessions</button>
                <button class="btn btn-primary" onclick="viewCourseAndCreateSession(${course.id})">Create Session</button>
            </div>
        </div>
    `).join('');
}

function viewCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        alert('Course not found');
        return;
    }

    currentCourse = course;
    document.getElementById('course-title').textContent = course.name;
    document.getElementById('course-code-detail').textContent = course.code;
    
    showPage('course-detail-page');
    renderSessions();
}

function viewCourseAndCreateSession(courseId) {
    viewCourse(courseId);
    setTimeout(() => openCreateSessionModal(), 100);
}

function deleteCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    if (confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) {
        courses = courses.filter(c => c.id !== courseId);
        renderCourses();
    }
}

// ==================== SESSION MANAGEMENT ====================

function renderSessions() {
    const container = document.getElementById('sessions-container');
    
    if (!container) return;
    
    if (!currentCourse.sessionsData || currentCourse.sessionsData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No sessions yet. Create your first session to start collecting feedback.</p>
                <button class="btn btn-primary" onclick="openCreateSessionModal()">Create First Session</button>
            </div>
        `;
        return;
    }

    container.innerHTML = currentCourse.sessionsData.map(session => `
        <div class="session-card">
            <div class="session-card-header">
                <div class="session-info">
                    <h3>${escapeHtml(session.name)}</h3>
                    <p class="session-week">Week ${session.week || 1}</p>
                </div>
                <div class="session-meta">
                    <span class="status-badge ${session.status}">${session.status === 'active' ? 'Active' : 'Closed'}</span>
                </div>
            </div>
            <div class="session-stats">
                <span>📊 ${session.responses || 0} responses</span>
            </div>
            <div class="session-actions">
                <button class="btn btn-secondary" onclick="viewAnalytics(${session.id})">👁️ Preview</button>
                <button class="btn btn-secondary" onclick="liveView(${session.id})">📊 Live View</button>
                <button class="btn btn-secondary" onclick="copySessionLink(${session.id})">📋 Copy Link</button>
                <button class="btn btn-secondary" onclick="showQRCode(${session.id})">📱 QR Code</button>
                ${session.status === 'active' 
                    ? `<button class="btn btn-danger" onclick="closeSession(${session.id})">🔒 Close Session</button>`
                    : `<button class="btn btn-success" onclick="reopenSession(${session.id})">🔓 Reopen Session</button>`
                }
                <button class="btn btn-secondary" onclick="editSession(${session.id})">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteSession(${session.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function viewAnalytics(sessionId) {
    const session = currentCourse.sessionsData.find(s => s.id === sessionId);
    if (!session) return;
    
    showPage('analytics-page');
    // Here you would load and display the actual analytics data
}

function liveView(sessionId) {
    alert('Live View feature - Shows real-time feedback as it comes in');
}

function copySessionLink(sessionId) {
    const link = `${window.location.origin}/session/${sessionId}`;
    
    // Try to use the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            alert('Session link copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(link);
        });
    } else {
        fallbackCopyToClipboard(link);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Session link copied to clipboard!');
    } catch (err) {
        alert('Failed to copy link. Please copy manually: ' + text);
    }
    document.body.removeChild(textarea);
}

function showQRCode(sessionId) {
    alert('QR Code feature - Would display a QR code for easy mobile access');
}

function closeSession(sessionId) {
    if (confirm('Are you sure you want to close this session? Students will no longer be able to submit feedback.')) {
        const session = currentCourse.sessionsData.find(s => s.id === sessionId);
        if (session) {
            session.status = 'closed';
            renderSessions();
            alert('Session closed successfully');
        }
    }
}

function reopenSession(sessionId) {
    if (confirm('Reopen this session? Students will be able to submit feedback again.')) {
        const session = currentCourse.sessionsData.find(s => s.id === sessionId);
        if (session) {
            session.status = 'active';
            renderSessions();
            alert('Session reopened successfully');
        }
    }
}

function editSession(sessionId) {
    alert('Edit Session feature - Would allow editing session details');
}

function deleteSession(sessionId) {
    const session = currentCourse.sessionsData.find(s => s.id === sessionId);
    if (!session) return;
    
    if (confirm(`Are you sure you want to delete "${session.name}"? This action cannot be undone.`)) {
        currentCourse.sessionsData = currentCourse.sessionsData.filter(s => s.id !== sessionId);
        currentCourse.sessions = currentCourse.sessionsData.length;
        renderSessions();
        alert('Session deleted successfully');
    }
}

// ==================== MODAL: CREATE COURSE ====================

function openCreateCourseModal() {
    const modal = document.getElementById('create-course-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCreateCourseModal() {
    const modal = document.getElementById('create-course-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('course-form');
    if (form) {
        form.reset();
    }
}

function createCourse(e) {
    e.preventDefault();
    
    const name = document.getElementById('course-name').value.trim();
    const code = document.getElementById('course-code-input').value.trim();
    const description = document.getElementById('course-description').value.trim() || 'No description';
    
    if (!name || !code) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check for duplicate course code
    if (courses.some(c => c.code.toLowerCase() === code.toLowerCase())) {
        alert('A course with this code already exists');
        return;
    }
    
    const newCourse = {
        id: Date.now(), // Use timestamp as unique ID
        name,
        code,
        description,
        sessions: 0,
        sessionsData: []
    };
    
    courses.push(newCourse);
    closeCreateCourseModal();
    renderCourses();
    alert(`Course "${name}" created successfully!`);
}

// ==================== MODAL: CREATE SESSION ====================

function openCreateSessionModal() {
    if (!currentCourse) {
        alert('Please select a course first');
        return;
    }
    const modal = document.getElementById('create-session-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCreateSessionModal() {
    const modal = document.getElementById('create-session-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const form = document.getElementById('session-form');
    if (form) {
        form.reset();
    }
    // Reset template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    const quickTemplate = document.querySelector('.template-card[data-template="quick"]');
    if (quickTemplate) {
        quickTemplate.classList.add('selected');
    }
    selectedTemplate = 'quick';
}

function createSession(e) {
    e.preventDefault();
    
    if (!currentCourse) {
        alert('No course selected');
        return;
    }
    
    const name = document.getElementById('session-name').value.trim();
    const week = document.getElementById('week-number').value;
    
    if (!name) {
        alert('Please enter a session name');
        return;
    }
    
    if (!currentCourse.sessionsData) {
        currentCourse.sessionsData = [];
    }
    
    const newSession = {
        id: Date.now(), // Use timestamp as unique ID
        name,
        week: week || currentCourse.sessionsData.length + 1,
        status: 'active',
        responses: 0,
        template: selectedTemplate
    };
    
    currentCourse.sessionsData.push(newSession);
    currentCourse.sessions = currentCourse.sessionsData.length;
    
    closeCreateSessionModal();
    renderSessions();
    alert(`Session "${name}" created and is now live!`);
}

// ==================== EVENT HANDLERS ====================

function handleTabSwitch(e) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
}

function handleTemplateSelection(e) {
    const templateCard = e.target.closest('.template-card');
    if (templateCard) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        templateCard.classList.add('selected');
        selectedTemplate = templateCard.dataset.template;
    }
}

function handleTagFilter(e) {
    if (e.target.classList.contains('tag')) {
        e.target.classList.toggle('active');
        // Here you would filter the responses based on selected tags
    }
}

function handleModalBackgroundClick(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== ANALYTICS FUNCTIONS ====================

function generateAISummary() {
    alert('AI Summary feature - Would use AI to analyze and summarize student responses');
}

function exportData(format) {
    alert(`Export data as ${format} - Would download analytics data in the specified format`);
}

function refreshAnalytics() {
    alert('Refreshing analytics data...');
    // Here you would reload the latest data from the server
}

// Make functions globally accessible
window.logout = logout;
window.goToDashboard = goToDashboard;
window.goBackToCourse = goBackToCourse;
window.viewCourse = viewCourse;
window.viewCourseAndCreateSession = viewCourseAndCreateSession;
window.deleteCourse = deleteCourse;
window.viewAnalytics = viewAnalytics;
window.liveView = liveView;
window.copySessionLink = copySessionLink;
window.showQRCode = showQRCode;
window.closeSession = closeSession;
window.reopenSession = reopenSession;
window.editSession = editSession;
window.deleteSession = deleteSession;
window.openCreateCourseModal = openCreateCourseModal;
window.closeCreateCourseModal = closeCreateCourseModal;
window.createCourse = createCourse;
window.openCreateSessionModal = openCreateSessionModal;
window.closeCreateSessionModal = closeCreateSessionModal;
window.createSession = createSession;
window.generateAISummary = generateAISummary;
window.exportData = exportData;
window.refreshAnalytics = refreshAnalytics;