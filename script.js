// Sticky Header
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Form Submission Alert
document.getElementById('waiting-list-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for joining our waiting list! We will contact you soon.');
    e.target.reset();
});

// Tabs Functionality
const tabItems = document.querySelectorAll('.tab-item');
const tabPanes = document.querySelectorAll('.tab-pane');

tabItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all tabs and panes
        tabItems.forEach(tab => tab.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked tab and corresponding pane
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});