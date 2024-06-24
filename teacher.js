// Function to generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to save meetings
function saveMeetings(meetings) {
    localStorage.setItem('meetings', JSON.stringify(meetings));
}

// Function to get meetings
function getMeetings() {
    return JSON.parse(localStorage.getItem('meetings')) || [];
}

// Function to display scheduled meetings
function displayScheduledMeetings() {
    const meetings = getMeetings();
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    meetings.forEach(meeting => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${meeting.title} - ${new Date(meeting.time).toLocaleString()}
            <br>Meet Link: ${meeting.meetLink}
            <button onclick="editMeeting('${meeting.id}')">Edit</button>
            <button onclick="deleteMeeting('${meeting.id}')">Delete</button>
        `;
        meetingsList.appendChild(li);
    });
}

// Function to add or update a meeting
function addOrUpdateMeeting(event) {
    event.preventDefault();
    const id = document.getElementById('meetingId').value;
    const title = document.getElementById('meetingTitle').value;
    const time = document.getElementById('meetingTime').value;
    const meetLink = document.getElementById('meetLink').value;

    let meetings = getMeetings();

    if (id) {
        // Updating existing meeting
        const index = meetings.findIndex(m => m.id === id);
        if (index !== -1) {
            meetings[index] = { id, title, time: new Date(time).toISOString(), meetLink };
        }
    } else {
        // Adding new meeting
        const newMeeting = {
            id: generateId(),
            title: title,
            time: new Date(time).toISOString(),
            meetLink: meetLink
        };
        meetings.push(newMeeting);
    }

    saveMeetings(meetings);
    displayScheduledMeetings();
    resetForm();
    alert(id ? 'Meeting updated successfully!' : 'Meeting scheduled successfully!');
}

// Function to edit a meeting
function editMeeting(id) {
    const meetings = getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (meeting) {
        document.getElementById('meetingId').value = meeting.id;
        document.getElementById('meetingTitle').value = meeting.title;
        document.getElementById('meetingTime').value = new Date(meeting.time).toISOString().slice(0, 16);
        document.getElementById('meetLink').value = meeting.meetLink;
        document.getElementById('submitBtn').textContent = 'Update Meeting';
        document.getElementById('cancelBtn').style.display = 'inline-block';
    }
}

// Function to delete a meeting
function deleteMeeting(id) {
    if (confirm('Are you sure you want to delete this meeting?')) {
        let meetings = getMeetings();
        meetings = meetings.filter(m => m.id !== id);
        saveMeetings(meetings);
        displayScheduledMeetings();
        alert('Meeting deleted successfully!');
    }
}

// Function to reset the form
function resetForm() {
    document.getElementById('meetingForm').reset();
    document.getElementById('meetingId').value = '';
    document.getElementById('submitBtn').textContent = 'Schedule Meeting';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Event listener for form submission
document.getElementById('meetingForm').addEventListener('submit', addOrUpdateMeeting);

// Event listener for cancel button
document.getElementById('cancelBtn').addEventListener('click', resetForm);


// Simulated student data
let students = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
let attendanceRecords = {};

let currentMeeting = null;


function startMeeting(meetingId) {
    if (currentMeeting) {
        alert('A meeting is already in progress.');
        return;
    }

    const meetings = getMeetings();
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
        alert('Meeting not found.');
        return;
    }

    currentMeeting = {
        id: meetingId,
        title: meeting.title,
        date: new Date(meeting.time),
        attendees: [],
        absentees: [...students] // Initially, all students are absent
    };

    document.getElementById('currentMeetingControls').style.display = 'block';
    document.getElementById('currentMeetingTitle').textContent = currentMeeting.title;
    updateAttendanceList();
    updateMeetingStatus('ongoing', meeting.title);

    // Store meeting status in localStorage
    const timestamp = new Date().getTime();
    localStorage.setItem('meetingStatus', JSON.stringify({
        status: 'ongoing',
        title: meeting.title,
        timestamp: timestamp
    }));
    localStorage.setItem('currentMeetingId', meetingId);
}

function endMeeting() {
    if (!currentMeeting) {
        alert('No meeting is currently in progress.');
        return;
    }

    // Save the attendance record
    let dateKey = currentMeeting.date.toISOString().split('T')[0];
    attendanceRecords[dateKey] = currentMeeting;

    // Simulate sending SMS to parents of absent students
    currentMeeting.absentees.forEach(student => {
        console.log(`SMS sent to ${student}'s parents about their absence.`);
    });

    currentMeeting = null;
    document.getElementById('currentMeetingControls').style.display = 'none';
    updateMeetingStatus('done');
    alert('Meeting ended and attendance recorded.');

    // Update meeting status in localStorage with a timestamp
    const timestamp = new Date().getTime();
    localStorage.setItem('meetingStatus', JSON.stringify({
        status: 'done',
        timestamp: timestamp
    }));
    localStorage.removeItem('currentMeetingId');
}

function updateMeetingStatus(status, title = '') {
    const statusElement = document.getElementById('meetingStatus');
    
    if (status === 'ongoing') {
        statusElement.innerHTML = `<strong>Current Meeting:</strong> ${title} (Ongoing)`;
        statusElement.className = 'meeting-status ongoing';
    } else {
        statusElement.textContent = 'No active meeting';
        statusElement.className = 'meeting-status done';
    }
}

// Check meeting status on page load
function checkMeetingStatus() {
    let statusData;
    try {
        statusData = JSON.parse(localStorage.getItem('meetingStatus') || '{}');
    } catch (e) {
        console.error('Error parsing meeting status:', e);
        statusData = {};
    }
    
    const meetingId = localStorage.getItem('currentMeetingId');
    
    if (statusData.status === 'ongoing' && meetingId) {
        const meetings = getMeetings();
        const meeting = meetings.find(m => m.id === meetingId);
        if (meeting) {
            updateMeetingStatus('ongoing', statusData.title);
            document.getElementById('currentMeetingControls').style.display = 'block';
            document.getElementById('currentMeetingTitle').textContent = statusData.title;
            updateAttendanceList();
        } else {
            updateMeetingStatus('done');
        }
    } else {
        updateMeetingStatus('done');
    }
}

// Call this function when the page loads
window.onload = checkMeetingStatus;

// Periodically check meeting status
setInterval(checkMeetingStatus, 30000);

function updateAttendanceList() {
    if (!currentMeeting) return;

    let list = document.getElementById('attendanceList');
    list.innerHTML = '';
    students.forEach(student => {
        let li = document.createElement('li');
        li.textContent = student;
        if (currentMeeting.absentees.includes(student)) {
            li.classList.add('absent');
            li.onclick = () => markPresent(student);
        } else {
            li.classList.add('present');
            li.onclick = () => markAbsent(student);
        }
        list.appendChild(li);
    });
}

function markPresent(student) {
    if (!currentMeeting) return;
    currentMeeting.absentees = currentMeeting.absentees.filter(s => s !== student);
    currentMeeting.attendees.push(student);
    updateAttendanceList();
}

function markAbsent(student) {
    if (!currentMeeting) return;
    currentMeeting.attendees = currentMeeting.attendees.filter(s => s !== student);
    currentMeeting.absentees.push(student);
    updateAttendanceList();
}

function generateReport() {
    let date = document.getElementById('reportDate').value;
    let report = getReport(date);
    displayReport(report);
}

function getReport(date) {
    let record = attendanceRecords[date];
    if (!record) {
        return `No attendance record found for ${date}`;
    }
    return `
        <h3>Attendance Report for ${date}</h3>
        <p>Meeting: ${record.title}</p>
        <p>Total Students: ${students.length}</p>
        <p>Present: ${record.attendees.length}</p>
        <p>Absent: ${record.absentees.length}</p>
        <h4>Absentees:</h4>
        <ul>
            ${record.absentees.map(student => `<li>${student}</li>`).join('')}
        </ul>
    `;
}

function displayReport(report) {
    document.getElementById('reportArea').innerHTML = report;
}

// Modify the existing displayScheduledMeetings function
function displayScheduledMeetings() {
    const meetings = getMeetings();
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    meetings.forEach(meeting => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${meeting.title} - ${new Date(meeting.time).toLocaleString()}
            <br>Meet Link: ${meeting.meetLink}
            <button onclick="editMeeting('${meeting.id}')">Edit</button>
            <button onclick="deleteMeeting('${meeting.id}')">Delete</button>
            <button onclick="startMeeting('${meeting.id}')">Start Meeting & Take Attendance</button>
        `;
        meetingsList.appendChild(li);
    });
}
// Initial display of scheduled meetings
displayScheduledMeetings(); 