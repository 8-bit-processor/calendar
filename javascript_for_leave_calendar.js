// Calendar and Leave Management System
class LeaveCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.employees = this.loadEmployees();
        this.leaveData = this.loadLeaveData();
        this.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.categories = [
            "Nurse",
            "Mental Health",
            "MSA",
            "Social Work",
            "Pharmacy",
            "Provider"
        ];
        this.leaveTypes = [
            "All Day",
            "Leaving Early"
        ];
        this.initializeCalendar();
        this.setupExportImportButtons();
    }

    setupExportImportButtons() {
        const exportBtn = document.getElementById('exportData');
        const importBtn = document.getElementById('importData');
        const fileInput = document.getElementById('importFile');

        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (importBtn) importBtn.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.importData(e));
    }

    exportData() {
        const data = {
            employees: this.employees,
            leaveData: this.leaveData,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave_calendar_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.employees = data.employees;
                    this.leaveData = data.leaveData;
                    this.saveData();
                    this.renderCalendar();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    }

    loadEmployees() {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            return JSON.parse(savedEmployees);
        }
        return [
            { id: 1, name: 'nurse rn2', category: 'Nurse', leaves: [] },
            { id: 2, name: 'nurse RN', category: 'Nurse', leaves: [] },
            { id: 3, name: 'nurse lpn', category: 'Nurse', leaves: [] },
            { id: 4, name: 'counselor 1', category: 'Mental Health', leaves: [] },
            { id: 5, name: 'counselor 2', category: 'Mental Health', leaves: [] },
            { id: 6, name: 'social worker', category: 'Social Work', leaves: [] },
            { id: 7, name: 'pharmacist', category: 'Pharmacy', leaves: [] },
            { id: 8, name: 'nurse rn22', category: 'Nurse', leaves: [] },
            { id: 9, name: 'nurse RN2', category: 'Nurse', leaves: [] },
            { id: 10, name: 'nurse lpn2', category: 'Nurse', leaves: [] },
            { id: 11, name: 'pact 2 provider', category: 'Provider', leaves: [] },
            { id: 12, name: 'provider pact 3', category: 'Provider', leaves: [] },
            { id: 13, name: 'social worker2', category: 'Social Work', leaves: [] },
            { id: 14, name: 'pharmacist2', category: 'Pharmacy', leaves: [] }
        ];
    }

    loadLeaveData() {
        const savedLeaveData = localStorage.getItem('leaveData');
        return savedLeaveData ? JSON.parse(savedLeaveData) : {};
    }

    saveData() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
        localStorage.setItem('leaveData', JSON.stringify(this.leaveData));
    }

    initializeCalendar() {
        this.updateHeader();
        this.renderCalendar();
        this.setupEventListeners();
    }

    updateHeader() {
        const header = document.getElementById("leaveMonth");
        header.innerHTML = `${this.months[this.currentMonth]} ${this.currentYear}`;
    }

    renderCalendar() {
        const table = document.getElementById("monthTable");
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Clear existing calendar
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 7; j++) {
                const cell = row.insertCell();
                if (i === 0 && j < startingDay) {
                    // Empty cells before the first day
                    cell.innerHTML = "";
                } else if (date > daysInMonth) {
                    // Empty cells after the last day
                    cell.innerHTML = "";
                } else {
                    const dateStr = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
                    const leavesByCategory = this.getLeavesByCategory(dateStr);
                    
                    let categoryHtml = '';
                    this.categories.forEach(category => {
                        const employeesInCategory = leavesByCategory[category] || [];
                        if (employeesInCategory.length > 0) {
                            categoryHtml += `
                                <div class="category-section">
                                    <div class="category-header">${category}</div>
                                    <div class="category-employees">
                                        ${employeesInCategory.map(emp => `
                                            <div class="employee-tag" data-employee="${emp.name}" data-date="${dateStr}">
                                                <div class="employee-info">
                                                    <span class="employee-name">${emp.name}</span>
                                                    <span class="leave-type">${emp.type}</span>
                                                    ${emp.notes ? `<span class="employee-notes" title="${emp.notes}">📝</span>` : ''}
                                                </div>
                                                <button class="cancel-leave-btn" data-employee="${emp.name}" data-date="${dateStr}">✕</button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }
                    });

                    cell.innerHTML = `
                        <div class="date-cell">
                            <div class="date-number">${date}</div>
                            <button class="view-day-btn" data-date="${dateStr}">👥 View All</button>
                            <div class="employees-on-leave">
                                ${categoryHtml}
                            </div>
                            <button class="add-leave-btn" data-date="${dateStr}">+</button>
                        </div>
                    `;
                    date++;
                }
            }
            if (date > daysInMonth) break;
        }
    }

    getLeavesByCategory(dateStr) {
        const leaves = this.leaveData[dateStr] || [];
        const categorized = {};
        
        leaves.forEach(leave => {
            const employee = this.employees.find(emp => emp.name === leave.name);
            if (employee) {
                const category = employee.category;
                if (!categorized[category]) {
                    categorized[category] = [];
                }
                categorized[category].push({
                    name: leave.name,
                    notes: leave.notes,
                    type: leave.type
                });
            }
        });
        
        return categorized;
    }

    showDayDetails(date) {
        const leavesByCategory = this.getLeavesByCategory(date);
        let content = `<h3>Leave Details for ${date}</h3>`;
        
        let hasData = false;
        this.categories.forEach(category => {
            const employeesInCategory = leavesByCategory[category] || [];
            if (employeesInCategory.length > 0) {
                hasData = true;
                content += `
                    <div class="day-detail-category">
                        <h4>${category}</h4>
                        <div class="day-detail-employees">
                            ${employeesInCategory.map(emp => `
                                <div class="day-detail-employee">
                                    <strong>${emp.name}</strong>
                                    <div>${emp.type}</div>
                                    ${emp.notes ? `<div class="day-detail-notes">${emp.notes}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        if (!hasData) {
            content += '<p>No leaves scheduled for this day.</p>';
        }

        const dialog = document.createElement('div');
        dialog.className = 'leave-dialog';
        dialog.innerHTML = `
            <div class="dialog-content day-details-dialog">
                ${content}
                <div class="dialog-buttons">
                    <button id="closeDayDetails">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('closeDayDetails').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.updateHeader();
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.updateHeader();
            this.renderCalendar();
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-leave-btn')) {
                const date = e.target.dataset.date;
                this.showLeaveDialog(date);
            } else if (e.target.classList.contains('cancel-leave-btn')) {
                e.stopPropagation();
                const date = e.target.dataset.date;
                const employeeName = e.target.dataset.employee;
                this.cancelLeave(date, employeeName);
            } else if (e.target.classList.contains('employee-tag') || e.target.closest('.employee-tag')) {
                const employeeTag = e.target.classList.contains('employee-tag') ? 
                    e.target : e.target.closest('.employee-tag');
                const date = employeeTag.dataset.date;
                const employeeName = employeeTag.dataset.employee;
                this.showNotesDialog(date, employeeName);
            } else if (e.target.classList.contains('view-day-btn')) {
                const date = e.target.dataset.date;
                this.showDayDetails(date);
            }
        });
    }

    showLeaveDialog(date) {
        const employeesOnLeave = (this.leaveData[date] || []).map(l => l.name);
        const availableEmployees = this.employees.filter(emp => 
            !employeesOnLeave.includes(emp.name)
        );

        // Group employees by category
        const employeesByCategory = {};
        this.categories.forEach(category => {
            const categoryEmployees = availableEmployees.filter(emp => emp.category === category);
            if (categoryEmployees.length > 0) {
                employeesByCategory[category] = categoryEmployees;
            }
        });

        const dialog = document.createElement('div');
        dialog.className = 'leave-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Add Leave for ${date}</h3>
                <select id="employeeSelect" class="employee-select">
                    <option value="">Select Employee</option>
                    ${Object.entries(employeesByCategory).map(([category, employees]) => `
                        <optgroup label="${category}">
                            ${employees.map(emp => 
                                `<option value="${emp.name}" data-category="${emp.category}">${emp.name}</option>`
                            ).join('')}
                        </optgroup>
                    `).join('')}
                </select>
                <select id="leaveType" class="leave-type-select">
                    ${this.leaveTypes.map(type => 
                        `<option value="${type}">${type}</option>`
                    ).join('')}
                </select>
                <textarea id="leaveNotes" rows="4" placeholder="Add notes here..."></textarea>
                <div class="dialog-buttons">
                    <button id="confirmLeave" class="confirm-btn">Add</button>
                    <button id="cancelLeave" class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const employeeSelect = document.getElementById('employeeSelect');
        const leaveTypeSelect = document.getElementById('leaveType');
        const notesTextarea = document.getElementById('leaveNotes');
        const confirmBtn = document.getElementById('confirmLeave');
        const cancelBtn = document.getElementById('cancelLeave');

        // Add event listeners
        confirmBtn.addEventListener('click', () => {
            const selectedEmployee = employeeSelect.value;
            const selectedCategory = employeeSelect.options[employeeSelect.selectedIndex]?.dataset?.category;
            const leaveType = leaveTypeSelect.value;
            const notes = notesTextarea.value.trim();

            if (selectedEmployee && selectedCategory) {
                if (!this.leaveData[date]) {
                    this.leaveData[date] = [];
                }
                this.leaveData[date].push({
                    name: selectedEmployee,
                    category: selectedCategory,
                    type: leaveType,
                    notes: notes
                });
                this.saveData();
                this.renderCalendar();
                document.body.removeChild(dialog);
            } else {
                alert('Please select an employee');
            }
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        // Focus the select element after dialog is shown
        setTimeout(() => employeeSelect.focus(), 100);
    }

    showNotesDialog(date, employeeName) {
        const leave = (this.leaveData[date] || []).find(l => l.name === employeeName);
        if (!leave) return;

        const dialog = document.createElement('div');
        dialog.className = 'leave-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Notes for ${employeeName} on ${date}</h3>
                <textarea id="leaveNotes" rows="4" placeholder="Enter notes here...">${leave.notes || ''}</textarea>
                <div class="dialog-buttons">
                    <button id="saveNotes">Save</button>
                    <button id="cancelNotes">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('saveNotes').addEventListener('click', () => {
            const notes = document.getElementById('leaveNotes').value;
            leave.notes = notes;
            this.saveData();
            this.renderCalendar();
            document.body.removeChild(dialog);
        });

        document.getElementById('cancelNotes').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    cancelLeave(date, employeeName) {
        if (confirm(`Cancel leave for ${employeeName} on ${date}?`)) {
            this.leaveData[date] = (this.leaveData[date] || []).filter(
                leave => leave.name !== employeeName
            );
            this.saveData();
            this.renderCalendar();
        }
    }
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new LeaveCalendar();
});
