document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value; // Get user input
    const resultDiv = document.getElementById("result"); // Result container
    const loading = document.getElementById("loading"); // Loading spinner

    // Show the spinner and clear the result container
    loading.style.display = "flex";
    resultDiv.innerHTML = "";

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

        // Hide the spinner
        loading.style.display = "none";

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

            // Create a Download button
            let downloadButton = document.getElementById("downloadButton");

            // If not, create the <button> element for download
            if (!downloadButton) {
                downloadButton = document.createElement("a");
                downloadButton.id = "downloadButton";
                downloadButton.className = "btn";
                downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Image';
                resultDiv.appendChild(downloadButton); // Append the button to the result div
            }

            // Set the download functionality to use the Flask endpoint
            downloadButton.href = `/download-image?image_url=${encodeURIComponent(data.image_url)}`;
            downloadButton.style.display = "inline-block";
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.error || "Unknown error occurred."}</p>`;
        }
    } catch (err) {
        // Hide the spinner and display the error
        loading.style.display = "none";
        resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
});
