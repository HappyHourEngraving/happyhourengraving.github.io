document.addEventListener("DOMContentLoaded", async () => {
  const titleRenames = new Map([
    ["Custom Slate Coaster Set", "Slate Coaster Set"],
    ["Custom Dog Portrait Coaster", "Dog Portrait Coaster"],
    ["Custom Cat Portrait Coaster", "Cat Portrait Coaster"],
    ["Custom Anniversary Tumbler", "Anniversary Tumbler"],
    ["Custom QR Code Setup", "Logo & QR Code Setup"],
    ["Personalized Laser Clips", "Flashlight Clips"]
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

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.setAttribute("aria-label", "Gallery image viewer");
  lightbox.innerHTML = `
    <button class="gallery-lightbox-close" type="button" aria-label="Close image viewer">×</button>
    <button class="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="View previous image">‹</button>
    <figure class="gallery-lightbox-figure">
      <img class="gallery-lightbox-image" alt="" />
      <figcaption class="gallery-lightbox-caption"></figcaption>
    </figure>
    <button class="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="View next image">›</button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
  const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");
  const closeButton = lightbox.querySelector(".gallery-lightbox-close");
  const previousButton = lightbox.querySelector(".gallery-lightbox-prev");
  const nextButton = lightbox.querySelector(".gallery-lightbox-next");

  let galleryImages = [];
  let currentIndex = -1;
  let lastFocusedElement = null;

  const getAvailableImages = () =>
    [...document.querySelectorAll(".gallery-card img")].filter((image) => {
      if (image.closest(".gallery-card")?.classList.contains("image-error")) {
        return false;
      }

      return !image.classList.contains("deferred-gallery-image") ||
        image.classList.contains("is-loaded");
    });

  const getImageTitle = (image) =>
    image.closest(".gallery-card")?.querySelector("h3")?.textContent.trim() ||
    image.alt ||
    "Gallery image";

  const showImage = (index) => {
    if (!galleryImages.length) return;

    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const selectedImage = galleryImages[currentIndex];
    const title = getImageTitle(selectedImage);

    lightboxImage.src = selectedImage.currentSrc || selectedImage.src;
    lightboxImage.alt = selectedImage.alt || title;
    lightboxCaption.textContent = title;

    const showNavigation = galleryImages.length > 1;
    previousButton.hidden = !showNavigation;
    nextButton.hidden = !showNavigation;
  };

  const openLightbox = (image) => {
    galleryImages = getAvailableImages();
    const index = galleryImages.indexOf(image);
    if (index < 0) return;

    lastFocusedElement = image;
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains("is-open")) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    lastFocusedElement?.focus();
  };

  document.querySelectorAll(".gallery-card img").forEach((image) => {
    const title = getImageTitle(image);
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `View ${title} fullscreen`);
  });

  document.addEventListener("click", (event) => {
    const image = event.target.closest(".gallery-card img");
    if (image) openLightbox(image);
  });

  document.addEventListener("keydown", (event) => {
    const image = event.target.closest?.(".gallery-card img");

    if (image && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openLightbox(image);
      return;
    }

    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    if (event.key === "ArrowRight") showImage(currentIndex + 1);
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => showImage(currentIndex - 1));
  nextButton.addEventListener("click", () => showImage(currentIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
});
