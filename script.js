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
                    "/send-message",
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


// CERTIFICATE VIEWER

const certificateModal = document.getElementById("certificateModal");
const closeCertificateModal = document.getElementById("closeCertificateModal");

const certificateImage = document.getElementById("certificateImage");
const certificatePDF = document.getElementById("certificatePDF");

const modalTitle = document.getElementById("modalTitle");


// Open certificate
document.querySelectorAll(".view-certificate").forEach(button => {

    button.addEventListener("click", function () {

        const file = this.dataset.file;
        const type = this.dataset.type;

        certificateModal.classList.add("active");

        document.body.style.overflow = "hidden";

        certificateImage.hidden = true;
        certificatePDF.hidden = true;

        certificateImage.src = "";
        certificatePDF.src = "";

        if (type === "image") {

            certificateImage.src = file;
            certificateImage.hidden = false;

        } else if (type === "pdf") {

            certificatePDF.src = file;
            certificatePDF.hidden = false;

        }

        modalTitle.textContent = this.closest(".certificate-card")
            .querySelector("h3").textContent;

    });

});


// Close certificate viewer
function closeCertificateViewer() {

    certificateModal.classList.remove("active");

    certificateImage.src = "";
    certificatePDF.src = "";

    document.body.style.overflow = "";

}


// Close using X
closeCertificateModal.addEventListener("click", closeCertificateViewer);


// Close by clicking outside
certificateModal.addEventListener("click", function(event) {

    if (event.target === certificateModal) {
        closeCertificateViewer();
    }

});


// Close using Escape key
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        closeCertificateViewer();
    }

});
