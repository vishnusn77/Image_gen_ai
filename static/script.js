document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value; // Get user input
    const resultDiv = document.getElementById("result"); // Result container
    const loading = document.getElementById("loading"); // Loading spinner

    // Define the word limit
    const wordLimit = 30;

    // Validate word count
    const wordCount = prompt.trim().split(/\s+/).length; // Count words by splitting on spaces
    if (wordCount > wordLimit) {
        resultDiv.innerHTML = `<p style="color: red;">Error: The prompt exceeds the ${wordLimit} word limit. Please shorten it.</p>`;
        return;
    }

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

        if (response.status === 429) {
            // Handle rate limit error
            const data = await response.json();
            resultDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
            loading.style.display = "none";
            return;
        }

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

            // If not, create the <a> element for download
            if (!downloadButton) {
                downloadButton = document.createElement("a");
                downloadButton.id = "downloadButton";
                downloadButton.className = "btn";
                downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Image'; // Add icon and text
                resultDiv.appendChild(downloadButton); // Append the button to the result div
            }

            // Set the download attributes
            downloadButton.href = `/download-image?image_url=${encodeURIComponent(data.image_url)}`;
            downloadButton.style.display = "inline-block";
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.error || "Unknown error occurred."}</p>`;
        }
    } catch (err) {
        // Hide the spinner and display the error
        loading.style.display = "none";
        resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
});
