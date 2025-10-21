// API Base URL - Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.host}/api`;
let socket;
let carbonChart, categoryChart;

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    initializeCharts(); // Initialize charts FIRST!
    setupEventListeners();
    setupWebSocket();
    setDefaultDate();
    await loadUserProfile();
    await loadDashboardData(); // Load data AFTER charts are initialized
});

// ========== Authentication ==========
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ========== User Profile ==========
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            const user = data.user;
            document.getElementById('userName').textContent = user.username;
            localStorage.setItem('user', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('userName').textContent = storedUser.username || 'User';
    }
}

// ========== Dashboard Data ==========
async function loadDashboardData() {
    await Promise.all([
        loadCarbonSummary(),
        loadRenewableEnergySummary(),
        loadPlasticSummary(),
        loadRecentActivities(),
        loadTips()
    ]);
}

async function loadCarbonSummary() {
    try {
        const response = await fetch(`${API_URL}/carbon-footprint/summary?period=month`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        console.log('=== LOAD CARBON SUMMARY ===');
        console.log('Full API Response:', data);
        
        if (data.success) {
            const { summary } = data;
            console.log('Summary Object:', summary);
            console.log('Total Emissions:', summary.totalEmissions);
            console.log('Trend Data Array:', summary.trendData);
            console.log('By Activity Type:', summary.byActivityType);
            
            document.getElementById('totalCarbon').textContent = summary.totalEmissions.toFixed(1);
            updateCarbonChart(summary);
            updateTrendChart(summary.trendData || []);
        }
    } catch (error) {
        console.error('Error loading carbon summary:', error);
        // Initialize with zero data if error
        document.getElementById('totalCarbon').textContent = '0.0';
        updateCarbonChart({ byActivityType: {} });
        updateTrendChart([]);
    }
}

async function loadCarbonSummaryByPeriod(period) {
    try {
        console.log('=== LOADING BY PERIOD:', period, '===');
        const response = await fetch(`${API_URL}/carbon-footprint/summary?period=${period}`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        console.log('Period API Response:', data);
        
        if (data.success) {
            const { summary } = data;
            console.log('Period Summary:', summary);
            updateCarbonChart(summary);
            updateTrendChart(summary.trendData || []);
        }
    } catch (error) {
        console.error('Error loading carbon summary by period:', error);
    }
}

async function loadRenewableEnergySummary() {
    try {
        const response = await fetch(`${API_URL}/renewable-energy/summary?period=month`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('totalEnergy').textContent = data.summary.totalEnergyGenerated.toFixed(1);
        }
    } catch (error) {
        console.error('Error loading renewable energy:', error);
        document.getElementById('totalEnergy').textContent = '0.0';
    }
}

async function loadPlasticSummary() {
    try {
        const response = await fetch(`${API_URL}/plastic-usage/summary?period=month`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('totalPlastic').textContent = data.summary.current.totalQuantity;
        }
    } catch (error) {
        console.error('Error loading plastic summary:', error);
        document.getElementById('totalPlastic').textContent = '0';
    }
}

async function loadRecentActivities() {
    try {
        const response = await fetch(`${API_URL}/carbon-activities?limit=10`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            displayActivities(data.activities);
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

async function loadTips() {
    try {
        const response = await fetch(`${API_URL}/carbon-footprint/tips`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            displayTips(data.tips);
        }
    } catch (error) {
        console.error('Error loading tips:', error);
    }
}

// ========== Display Functions ==========
function displayActivities(activities) {
    const tbody = document.getElementById('activitiesTableBody');
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No activities yet. Start tracking!</td></tr>';
        return;
    }

    tbody.innerHTML = activities.map(activity => `
        <tr>
            <td>${new Date(activity.date).toLocaleDateString()}</td>
            <td><span class="badge ${activity.activityType}">${activity.activityType}</span></td>
            <td>${getActivityDetails(activity)}</td>
            <td><strong>${activity.carbonEmissions.toFixed(2)} kg</strong></td>
            <td>
                <button class="btn-icon" onclick="deleteActivity('${activity._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getActivityDetails(activity) {
    switch (activity.activityType) {
        case 'transportation':
            return `${activity.transportMode} - ${activity.distance} km`;
        case 'energy':
            return `Electricity: ${activity.electricityUsage || 0} kWh`;
        case 'food':
            return `Meat: ${activity.meatConsumption || 0} kg`;
        case 'waste':
            return `Generated: ${activity.wasteGenerated || 0} kg`;
        case 'water':
            return `${activity.waterUsage || 0} liters`;
        default:
            return 'N/A';
    }
}

function displayTips(tips) {
    const grid = document.getElementById('tipsGrid');
    
    grid.innerHTML = tips.map(tip => `
        <div class="tip-card ${tip.impact}">
            <div class="tip-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
            <h3>${tip.title}</h3>
            <p>${tip.description}</p>
            <div class="tip-impact">
                <span class="impact-badge ${tip.impact}">
                    ${tip.impact.toUpperCase()} IMPACT
                </span>
            </div>
        </div>
    `).join('');
}

// ========== Charts ==========
function initializeCharts() {
    const carbonCtx = document.getElementById('carbonChart');
    const categoryCtx = document.getElementById('categoryChart');

    if (carbonCtx) {
        carbonChart = new Chart(carbonCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CO₂ Emissions (kg)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,              // Show points clearly
                    pointHoverRadius: 8,         // Bigger on hover
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return 'CO₂: ' + context.parsed.y.toFixed(2) + ' kg';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'CO₂ Emissions (kg)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Transportation', 'Energy', 'Food', 'Waste', 'Water'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#3b82f6',
                        '#f59e0b',
                        '#10b981',
                        '#8b5cf6',
                        '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function updateCarbonChart(summary) {
    if (!categoryChart) {
        console.warn('Category chart not initialized yet');
        return;
    }
    
    if (summary && summary.byActivityType) {
        const chartData = [
            summary.byActivityType.transportation || 0,
            summary.byActivityType.energy || 0,
            summary.byActivityType.food || 0,
            summary.byActivityType.waste || 0,
            summary.byActivityType.water || 0
        ];
        
        categoryChart.data.datasets[0].data = chartData;
        categoryChart.update();
    }
}

function updateTrendChart(trendData) {
    if (!carbonChart) {
        console.warn('Carbon trend chart not initialized yet');
        return;
    }
    
    console.log('=== UPDATE TREND CHART ===');
    console.log('Trend Data:', trendData);
    console.log('Trend Data Length:', trendData?.length);
    
    if (!trendData) {
        console.warn('No trend data provided');
        return;
    }
    
    if (trendData.length === 0) {
        // No data, show empty chart
        console.log('Empty trend data - clearing chart');
        carbonChart.data.labels = [];
        carbonChart.data.datasets[0].data = [];
    } else if (trendData.length === 1) {
        // Only one data point - show it with a message
        console.log('Only 1 data point - showing single point');
        const date = new Date(trendData[0].date);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        carbonChart.data.labels = [label];
        carbonChart.data.datasets[0].data = [trendData[0].emissions];
        
        // Show notification to add more data
        setTimeout(() => {
            showNotification(
                '📊 Add activities for more dates to see a trend line! Go to Carbon Tracking to add data for yesterday, 2 days ago, etc.',
                'info'
            );
        }, 1000);
    } else {
        // Multiple data points - show trend line
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = trendData.map(item => item.emissions);
        
        console.log('Trend chart labels:', labels);
        console.log('Trend chart data:', data);
        
        carbonChart.data.labels = labels;
        carbonChart.data.datasets[0].data = data;
    }
    carbonChart.update();
    console.log('Trend chart updated successfully');
}

// ========== Form Handlers ==========
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) showSection(section);
        });
    });

    // Activity type selector
    const activityType = document.getElementById('activityType');
    if (activityType) {
        activityType.addEventListener('change', (e) => {
            document.querySelectorAll('.activity-fields').forEach(field => {
                field.style.display = 'none';
            });
            
            const selectedType = e.target.value;
            if (selectedType) {
                const fieldId = `${selectedType}Fields`;
                const field = document.getElementById(fieldId);
                if (field) field.style.display = 'block';
            }
        });
    }

    // Forms
    setupFormHandler('carbonActivityForm', submitCarbonActivity);
    setupFormHandler('wasteClassifyForm', classifyWaste);
    setupFormHandler('renewableEnergyForm', submitRenewableEnergy);
    setupFormHandler('plasticUsageForm', submitPlasticUsage);

    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });
    }

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        // Check if sidebar is open and click is outside sidebar and menu button
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Prevent sidebar clicks from closing it
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Notification bell
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
        notificationBell.addEventListener('click', toggleNotificationPanel);
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Carbon period selector
    const carbonPeriod = document.getElementById('carbonPeriod');
    if (carbonPeriod) {
        carbonPeriod.addEventListener('change', async (e) => {
            await loadCarbonSummaryByPeriod(e.target.value);
        });
    }
}

function setupFormHandler(formId, handler) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handler(new FormData(form));
            form.reset();
        });
    }
}

async function submitCarbonActivity(formData) {
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${API_URL}/carbon-activities`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Activity added successfully!', 'success');
            await loadDashboardData();
        } else {
            showNotification(result.message || 'Failed to add activity', 'error');
        }
    } catch (error) {
        showNotification('Error adding activity', 'error');
    }
}

async function classifyWaste(formData) {
    const wasteDescription = formData.get('wasteDescription');
    
    if (!wasteDescription || wasteDescription.trim() === '') {
        showNotification('Please enter a waste item description', 'error');
        return;
    }
    
    // Show loading state
    const resultDiv = document.getElementById('wasteResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div class="waste-classification"><p>🔍 Classifying...</p></div>';
    
    try {
        const response = await fetch(`${API_URL}/waste/classify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wasteDescription: wasteDescription.trim() })
        });

        const data = await response.json();
        if (data.success) {
            displayWasteResult(data.classification);
        } else {
            showNotification(data.message || 'Failed to classify waste', 'error');
            resultDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Waste classification error:', error);
        showNotification('Error classifying waste. Please try again.', 'error');
        resultDiv.style.display = 'none';
    }
}

function displayWasteResult(classification) {
    const resultDiv = document.getElementById('wasteResult');
    resultDiv.style.display = 'block';
    
    const categoryColors = {
        recyclable: '#10b981',
        biodegradable: '#22c55e',
        compostable: '#84cc16',
        hazardous: '#ef4444',
        electronic: '#3b82f6',
        landfill: '#6b7280'
    };
    
    const categoryIcons = {
        recyclable: '♻️',
        biodegradable: '🌱',
        compostable: '🌿',
        hazardous: '⚠️',
        electronic: '📱',
        landfill: '🗑️'
    };
    
    const icon = categoryIcons[classification.category] || '📦';
    const color = categoryColors[classification.category] || '#6b7280';
    
    resultDiv.innerHTML = `
        <div class="waste-classification" style="border-left: 4px solid ${color}; padding: 1.5rem; background: #f9fafb; border-radius: 12px; margin-top: 1rem;">
            <h4 style="color: ${color}; font-size: 1.5rem; margin-bottom: 1rem;">
                ${icon} ${classification.category.toUpperCase()}
            </h4>
            ${classification.wasteDescription ? `<p><strong>📋 Item:</strong> ${classification.wasteDescription}</p>` : ''}
            <p><strong>📦 Instructions:</strong> ${classification.instructions}</p>
            <p><strong>🌍 Environmental Impact:</strong> ${classification.environmentalImpact}</p>
            <p><strong>💡 Tips:</strong> ${classification.tips}</p>
            ${classification.decompositionTime ? `<p><strong>⏱️ Decomposition Time:</strong> ${classification.decompositionTime}</p>` : ''}
            ${classification.examples && classification.examples.length > 0 ? `
                <p><strong>📝 Examples:</strong> ${classification.examples.join(', ')}</p>
            ` : ''}
        </div>
    `;
    
    showNotification(`Classified as: ${classification.category}`, 'success');
}

async function submitRenewableEnergy(formData) {
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${API_URL}/renewable-energy`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Renewable energy logged!', 'success');
            await loadDashboardData();
        }
    } catch (error) {
        showNotification('Error logging energy', 'error');
    }
}

async function submitPlasticUsage(formData) {
    const data = Object.fromEntries(formData);
    data.recycled = data.recycled === 'true';
    
    try {
        const response = await fetch(`${API_URL}/plastic-usage`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            showNotification('Plastic usage logged!', 'success');
            await loadDashboardData();
        }
    } catch (error) {
        showNotification('Error logging plastic', 'error');
    }
}

// ========== Navigation ==========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Close mobile sidebar after navigation
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
        }
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        
        const titles = {
            overview: 'Dashboard Overview',
            carbon: 'Carbon Footprint Tracker',
            waste: 'Smart Waste Sorting',
            energy: 'Renewable Energy Tracker',
            plastic: 'Plastic Pollution Monitor',
            tips: 'Eco Tips'
        };
        
        document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
    }
}

// ========== WebSocket ==========
function setupWebSocket() {
    try {
        // Auto-detect WebSocket URL
        const wsUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000'
            : window.location.origin;
        socket = io(wsUrl);
        
        socket.on('connect', () => {
            console.log('WebSocket connected');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) {
                socket.emit('join', user.id);
            }
        });

        socket.on('notification', (data) => {
            showNotification(data.message, data.type);
            loadNotifications();
        });
    } catch (error) {
        console.log('WebSocket connection failed');
    }
}

// ========== Notifications ==========
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
        loadNotifications();
    }
}

function closeNotificationPanel() {
    document.getElementById('notificationPanel').classList.remove('open');
}

async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/notifications?limit=20`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            displayNotifications(data.notifications);
            document.getElementById('notificationCount').textContent = data.unreadCount;
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function displayNotifications(notifications) {
    const list = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        list.innerHTML = '<p class="text-center">No notifications</p>';
        return;
    }

    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.isRead ? 'read' : 'unread'}">
            <div class="notif-icon">${notif.icon || '📢'}</div>
            <div class="notif-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <small>${new Date(notif.createdAt).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== Utility Functions ==========
function setDefaultDate() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });
}

function setActivityDate(daysOffset) {
    const dateInput = document.querySelector('#carbonActivityForm input[name="date"]');
    if (dateInput) {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        const formattedDate = date.toISOString().split('T')[0];
        dateInput.value = formattedDate;
        
        // Visual feedback
        dateInput.style.background = '#e0f2fe';
        setTimeout(() => {
            dateInput.style.background = '';
        }, 500);
        
        // Show friendly message
        const dateLabels = {
            0: 'Today',
            '-1': 'Yesterday',
            '-2': '2 Days Ago',
            '-3': '3 Days Ago',
            '-7': '1 Week Ago'
        };
        const label = dateLabels[daysOffset] || `${Math.abs(daysOffset)} days ago`;
        showNotification(`Date set to: ${label} (${date.toLocaleDateString()})`, 'info');
    }
}

async function deleteActivity(id) {
    if (!confirm('Delete this activity?')) return;
    
    try {
        const response = await fetch(`${API_URL}/carbon-activities/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Activity deleted', 'success');
            await loadDashboardData();
        }
    } catch (error) {
        showNotification('Error deleting activity', 'error');
    }
}

// ========== Search Functionality ==========
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Show all sections navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }
    
    // Search terms mapping
    const searchMap = {
        'carbon': 'carbon',
        'footprint': 'carbon',
        'emissions': 'carbon',
        'co2': 'carbon',
        'transport': 'carbon',
        'waste': 'waste',
        'recycle': 'waste',
        'trash': 'waste',
        'garbage': 'waste',
        'energy': 'energy',
        'solar': 'energy',
        'wind': 'energy',
        'renewable': 'energy',
        'plastic': 'plastic',
        'bottle': 'plastic',
        'pollution': 'plastic',
        'tips': 'tips',
        'eco': 'tips',
        'suggestions': 'tips',
        'overview': 'overview',
        'dashboard': 'overview',
        'stats': 'overview'
    };
    
    // Find matching section
    let matchedSection = null;
    for (const [keyword, section] of Object.entries(searchMap)) {
        if (keyword.includes(searchTerm) || searchTerm.includes(keyword)) {
            matchedSection = section;
            break;
        }
    }
    
    if (matchedSection) {
        // Highlight matching navigation item
        document.querySelectorAll('.nav-item').forEach(item => {
            const section = item.dataset.section;
            if (section === matchedSection) {
                item.style.display = 'flex';
                item.style.background = 'rgba(255, 255, 255, 0.2)';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show suggestion
        showNotification(`Found: ${matchedSection.charAt(0).toUpperCase() + matchedSection.slice(1)} section`, 'info');
    } else {
        // No match found
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.style.background = '';
        });
    }
}
