// Function to fetch meetings from localStorage
function fetchMeetings() {
    return JSON.parse(localStorage.getItem('meetings')) || [];
}

// Function to display upcoming meetings
function displayUpcomingMeetings() {
    const meetings = fetchMeetings();
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    const now = new Date();

    meetings.forEach(meeting => {
        const meetingTime = new Date(meeting.time);
        const timeDiff = meetingTime - now;
        
        const li = document.createElement('li');
        li.innerHTML = `
            ${meeting.title} - ${meetingTime.toLocaleString()}
            ${meeting.status === 'closed' 
                ? '<span class="meeting-closed">Meeting Ended</span>'
                : `<button onclick="joinMeeting('${meeting.id}')" ${timeDiff > 0 ? 'disabled' : ''}>Join Meeting</button>`
            }
        `;
        meetingsList.appendChild(li);
    });
}

// Function to check for and display notifications
function checkNotifications() {
    const meetings = fetchMeetings();
    const notificationsArea = document.getElementById('notifications');
    notificationsArea.innerHTML = '';

    const now = new Date();
    meetings.forEach(meeting => {
        if (meeting.status === 'closed') return; // Skip closed meetings

        const meetingTime = new Date(meeting.time);
        const timeDiff = meetingTime - now;

        if (timeDiff > 0 && timeDiff <= 300000) { // 5 minutes = 300000 milliseconds
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <h3>${meeting.title} is starting soon!</h3>
                <p>Starts in ${Math.ceil(timeDiff / 60000)} minutes</p>
                <button onclick="joinMeeting('${meeting.id}')" ${timeDiff > 0 ? 'disabled' : ''}>Join Meeting</button>
            `;
            notificationsArea.appendChild(notification);

            // Show an alert
            alert(`${meeting.title} is starting in ${Math.ceil(timeDiff / 60000)} minutes!`);
        }
    });
}

// Function to join a meeting
function joinMeeting(meetingId) {
    const meetings = fetchMeetings();
    const meeting = meetings.find(m => m.id === meetingId);
    const now = new Date();
    const meetingTime = new Date(meeting.time);

    if (meeting && meeting.meetLink && meeting.status !== 'closed') {
        if (now >= meetingTime) {
            window.open(meeting.meetLink, '_blank');
        } else {
            alert("It's not time for the meeting yet. Please wait until the scheduled time.");
        }
    } else if (meeting.status === 'closed') {
        alert('This meeting has ended and is no longer available to join.');
    } else {
        alert('Meeting link not available.');
    }
}

// Initial display and set up interval checks
displayUpcomingMeetings();
checkNotifications();
setInterval(() => {
    checkNotifications();
    displayUpcomingMeetings(); // Refresh the meeting list to update button states
    checkAndDeleteEndedMeetings(); // Check for meetings to delete
}, 60000); // Check every minute

function checkMeetingStatus() {
    let statusData;
    try {
        statusData = JSON.parse(localStorage.getItem('meetingStatus') || '{}');
    } catch (e) {
        console.error('Error parsing meeting status:', e);
        statusData = {};
    }
    updateMeetingStatus(statusData.status, statusData.title, statusData.timestamp);
}

function updateMeetingStatus(status, meetingTitle, timestamp) {
    const statusElement = document.getElementById('meetingStatus');
    const currentTime = new Date().getTime();
    
    // Check if the status is not older than 5 minutes
    if (status === 'ongoing' && meetingTitle && (!timestamp || currentTime - timestamp < 300000)) {
        statusElement.innerHTML = `<strong>Current Meeting:</strong> ${meetingTitle} (Ongoing)`;
        statusElement.className = 'meeting-status ongoing';
    } else {
        statusElement.textContent = 'No active meeting';
        statusElement.className = 'meeting-status done';
    }
}

// Check meeting status every 30 seconds
setInterval(checkMeetingStatus, 30000);

// Initial check
checkMeetingStatus();
