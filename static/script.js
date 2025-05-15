document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value;
    const resultDiv = document.getElementById("result");
    const loading = document.getElementById("loading");

    const wordLimit = 30;

    const wordCount = prompt.trim().split(/\s+/).length;
    if (wordCount > wordLimit) {
        resultDiv.innerHTML = `<p style="color: red;">Error: The prompt exceeds the ${wordLimit} word limit. Please shorten it.</p>`;
        return;
    }

    loading.style.display = "flex";
    resultDiv.innerHTML = "";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (response.status === 429) {
            const data = await response.json();
            resultDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
            loading.style.display = "none";
            return;
        }

        const data = await response.json();

        loading.style.display = "none";

        if (data.image_url) {
            let generatedImage = document.getElementById("generatedImage");

            if (!generatedImage) {
                generatedImage = document.createElement("img");
                generatedImage.id = "generatedImage";
                generatedImage.alt = "Your AI-generated image will appear here.";
                resultDiv.appendChild(generatedImage); 
            }

            generatedImage.src = data.image_url;
            generatedImage.style.display = "block";

            let downloadButton = document.getElementById("downloadButton");

            if (!downloadButton) {
                downloadButton = document.createElement("a");
                downloadButton.id = "downloadButton";
                downloadButton.className = "btn";
                downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Image'; 
                resultDiv.appendChild(downloadButton);
            }

            downloadButton.href = `/download-image?image_url=${encodeURIComponent(data.image_url)}`;
            downloadButton.style.display = "inline-block";
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.error || "Unknown error occurred."}</p>`;
        }
    } catch (err) {
        loading.style.display = "none";
        resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
});
