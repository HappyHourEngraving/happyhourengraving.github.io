document.addEventListener("DOMContentLoaded", async () => {
  const titleRenames = new Map([
    ["Custom Slate Coaster Set", "Slate Coaster Set"],
    ["Custom Dog Portrait Coaster", "Dog Portrait Coaster"],
    ["Custom Cat Portrait Coaster", "Cat Portrait Coaster"],
    ["Custom Anniversary Tumbler", "Anniversary Tumbler"],
    ["Custom QR Code Setup", "Logo & QR Code Setup"]
  ]);

  document.querySelectorAll(".gallery-card h3").forEach((heading) => {
    const replacement = titleRenames.get(heading.textContent.trim());
    if (replacement) heading.textContent = replacement;
  });

  const deferredImages = document.querySelectorAll("img[data-base64-parts]");

  await Promise.all(
    [...deferredImages].map(async (image) => {
      const parts = image.dataset.base64Parts
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      try {
        const responses = await Promise.all(parts.map((part) => fetch(part)));

        if (responses.some((response) => !response.ok)) {
          throw new Error("Gallery image data failed to load.");
        }

        const chunks = await Promise.all(
          responses.map((response) => response.text())
        );

        image.src = `data:image/jpeg;base64,${chunks
          .join("")
          .replace(/\s/g, "")}`;
        image.classList.add("is-loaded");
      } catch (error) {
        image.closest(".gallery-card")?.classList.add("image-error");
        console.error(error);
      }
    })
  );
});
