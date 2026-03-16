document.addEventListener('DOMContentLoaded', () => {
    setupScrollSpy();
    setupFormListener();
});

function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));
}

const formLoadTime = Date.now();

function setupFormListener() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const emailVal = document.getElementById('email').value;
            const messageVal = document.getElementById('message').value;
            const nameVal = document.getElementById('fullName').value; 

            // 1. Email Validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailVal)) {
                alert("Please enter a valid email address.");
                return;
            }

            // 2. Time-Based Bot Check
            const submitTime = Date.now();
            const timeDifference = (submitTime - formLoadTime) / 1000; 
            if (timeDifference < 2) {
                alert("Submission too fast! You might be a bot.");
                return;
            }

            // 3. Keyword Spam Filter
            const spamKeywords = ["free money", "buy now", "click here", "subscribe", "promo"];
            const lowerCaseMessage = messageVal.toLowerCase();
            const foundSpam = spamKeywords.some(keyword => lowerCaseMessage.includes(keyword));

            if (foundSpam) {
                alert("Spam detected: Your message contains blocked keywords.");
                return;
            }

            // 4. Send to Web3Forms
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(form);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(async (response) => {
                if (response.status === 200) {
                    const wrapper = document.getElementById('form-wrapper');
                    wrapper.innerHTML = `
                        <div class="text-center py-5 text-success">
                            <h2 class="display-6 mb-3">✅ Message Sent!</h2>
                            <p class="lead text-dark">Thank you, <strong>${nameVal}</strong>.</p>
                            <p class="text-muted">I have received your message and will get back to you soon.</p>
                            <button onclick="location.reload()" class="btn btn-outline-primary mt-3">Send Another</button>
                        </div>
                    `;
                } else {
                    alert("Something went wrong. Please try again.");
                    submitBtn.innerHTML = 'Send Message';
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error("Network Error:", error);
                alert("Network Error: Your connection might be blocking this form.");
                submitBtn.innerHTML = 'Send Message';
                submitBtn.disabled = false;
            });
        });
    }
}