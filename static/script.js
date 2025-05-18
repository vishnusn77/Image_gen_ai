document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value;
    const resultDiv = document.getElementById("result");
    const loading = document.getElementById("loading");

    loading.style.display = "flex";
    resultDiv.innerHTML = "";

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        loading.style.display = "none";

        if (!response.ok) {
            if (response.status === 429) {
                resultDiv.innerHTML = `<p style="color: red;">You’ve reached the daily limit. Please try again tomorrow.</p>`;
                return;
            }

            let errorMsg = "Something went wrong.";
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch {

            }

            resultDiv.innerHTML = `<p style="color: red;">Error: ${errorMsg}</p>`;
            return;
        }

        const data = await response.json();

        if (!data.image_url) {
            resultDiv.innerHTML = `<p style="color: red;">Image generation failed. Please try again.</p>`;
            return;
        }

        let generatedImage = document.getElementById("generatedImage");
        if (!generatedImage) {
            generatedImage = document.createElement("img");
            generatedImage.id = "generatedImage";
            generatedImage.className = "generated-image";
            generatedImage.alt = "Your AI-generated image";
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

    } catch (err) {
        loading.style.display = "none";
        resultDiv.innerHTML = `<p style="color: red;">Unexpected Error: ${err.message}</p>`;
    }
});
