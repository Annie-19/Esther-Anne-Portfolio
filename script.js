document.addEventListener("DOMContentLoaded", function () {

    console.log("Esther Anne Portfolio loaded successfully.");


    // Smooth scrolling
    const internalLinks = document.querySelectorAll(
        'nav a[href^="#"], .hero-buttons a[href^="#"]'
    );

    internalLinks.forEach(function (link) {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });


    // Highlight navigation while scrolling
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", function () {

        let current = "";

        sections.forEach(function (section) {

            const sectionTop = section.offsetTop;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute("id");
            }

        });


        navLinks.forEach(function (link) {

            if (link.getAttribute("href") === "#" + current) {
                link.style.color = "#c084fc";
            } else {
                link.style.color = "#94a3b8";
            }

        });

    });


    // Contact form
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", async function (e) {

            e.preventDefault();


            const emailInput = document.getElementById("visitorEmail");
            const messageInput = document.getElementById("visitorMessage");
            const submitBtn = document.getElementById("submitBtn");
            const statusDiv = document.getElementById("formStatus");


            const email = emailInput.value.trim();
            const message = messageInput.value.trim();


            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";

            statusDiv.style.display = "none";


            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/send-message",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            message: message
                        })
                    }
                );


                const data = await response.json();


                statusDiv.style.display = "block";


                if (response.ok && data.success) {

                    statusDiv.style.color = "#4ade80";

                    statusDiv.textContent =
                        "✓ Message sent successfully!";

                    contactForm.reset();

                } else {

                    statusDiv.style.color = "#f87171";

                    statusDiv.textContent =
                        "✕ " + (data.error || "Failed to send message.");

                }


            } catch (error) {

                console.error("Contact form error:", error);

                statusDiv.style.display = "block";

                statusDiv.style.color = "#f87171";

                statusDiv.textContent =
                    "✕ Network error. Is the Python backend server running?";

            }


            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";

        });

    }

});
