// Add your backend API
const API_URL = "http://localhost:8000/ask";


// Smooth scroll to demo section
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

// Handle form submission (REAL API)
async function handleQuery(event) {
    event.preventDefault();
    
    const videoId = document.getElementById('videoId').value.trim();
    const question = document.getElementById('question').value.trim();
    const responseArea = document.getElementById('responseArea');
    const loadingArea = document.getElementById('loadingArea');
    const responseContent = document.getElementById('responseContent');
    const sourceInfo = document.getElementById('sourceInfo');
    
    // Validation
    if (!videoId) {
        showNotification('Please enter a YouTube video ID', 'error');
        return;
    }
    
    if (!question) {
        showNotification('Please ask a question', 'error');
        return;
    }
    
    // Show loading
    responseArea.style.display = 'none';
    loadingArea.style.display = 'flex';
    
    try {
        // REAL BACKEND CALL
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                video_id: videoId,
                question: question
            })
        });

        const response = await res.json();

        // Hide loading
        loadingArea.style.display = 'none';
        responseArea.style.display = 'block';
        
        // Render answer
        responseContent.innerHTML = `
            <div class="response-text">
                <strong>Question:</strong> ${escapeHtml(question)}
                <br><br>
                <strong>Answer:</strong> ${escapeHtml(response.answer || "No answer received")}
            </div>
        `;
        
        // Render sources
        if (response.sources && response.sources.length > 0) {
            sourceInfo.innerHTML = `
                <strong>📊 Source Information:</strong><br>
                Video ID: ${escapeHtml(videoId)}<br>
                <ul>
                    ${response.sources.map(src => `<li>${escapeHtml(src)}</li>`).join("")}
                </ul>
            `;
        } else {
            sourceInfo.innerHTML = `
                <strong>📊 Source Information:</strong><br>
                Video ID: ${escapeHtml(videoId)}<br>
                No sources available
            `;
        }
        
        // Scroll to response
        responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        showNotification('Response generated successfully!', 'success');

    } catch (error) {
        loadingArea.style.display = 'none';
        responseArea.style.display = 'block';

        responseContent.innerHTML = `
            <p style="color:red;">❌ Failed to connect backend</p>
        `;
        sourceInfo.innerHTML = "";

        console.error(error);
        showNotification('Backend connection failed', 'error');
    }
}


// Close response
function closeResponse() {
    document.getElementById('responseArea').style.display = 'none';
    document.getElementById('question').value = '';
}

// Escape HTML to prevent XSS
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

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                font-weight: 600;
                z-index: 2000;
                animation: slideInRight 0.3s ease-out;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            
            .notification-error {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// Active nav highlight
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});


// Form animation
const formInputs = document.querySelectorAll('.form-input');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});


// Intersection animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

document.querySelectorAll('.feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = '0.6s';
    observer.observe(el);
});


// Focus on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('videoId').focus();
});