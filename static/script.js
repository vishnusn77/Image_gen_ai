document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value; // Get user input
    const resultDiv = document.getElementById("result"); // Result container

    // Show a loading message
    resultDiv.innerHTML = "<p>Generating image... Please wait.</p>";

    try {
        // Send a POST request to the Flask backend
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        const data = await response.json();

        // Check if the image URL is received
        if (data.image_url) {
            // Check if the <img> element already exists
            let generatedImage = document.getElementById("generatedImage");

            // If not, create the <img> element
            if (!generatedImage) {
                generatedImage = document.createElement("img");
                generatedImage.id = "generatedImage";
                generatedImage.alt = "Your AI-generated image will appear here.";
                resultDiv.appendChild(generatedImage); // Append <img> to the result div
            }

            // Update the <img> element's attributes
            generatedImage.src = data.image_url;
            generatedImage.style.display = "block";

            // Update the result message
            resultDiv.innerHTML = "<h2>Generated Image:</h2>";
            resultDiv.appendChild(generatedImage); // Ensure the image is appended
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.error || "Unknown error occurred."}</p>`;
        }
    } catch (err) {
        // Handle any errors
        resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
});
