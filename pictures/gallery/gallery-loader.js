document.addEventListener("DOMContentLoaded", async () => {
  const placeholder =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  const addCard = ({ sectionId, cardId, title, alt, src, parts }) => {
    if (document.getElementById(cardId)) return;

    const grid = document.querySelector(`#${sectionId} .gallery-grid`);
    if (!grid) return;

    const card = document.createElement("article");
    card.className = "card gallery-card";
    card.id = cardId;

    const image = document.createElement("img");
    image.alt = alt;

    if (parts) {
      image.className = "deferred-gallery-image";
      image.src = placeholder;
      image.dataset.base64Parts = parts.join(",");
    } else {
      image.src = src;
    }

    const copy = document.createElement("div");
    copy.className = "gallery-card-copy";

    const heading = document.createElement("h3");
    heading.textContent = title;

    copy.appendChild(heading);
    card.append(image, copy);
    grid.appendChild(card);
  };

  addCard({
    sectionId: "keychains",
    cardId: "dog-portrait-dog-tag-keychain-card",
    title: "Custom Dog Portrait Keychain",
    alt: "Custom engraved dog portrait on a black dog-tag keychain",
    src: "pictures/gallery/dog-portrait-dog-tag-keychain.jpg?v=1"
  });

  addCard({
    sectionId: "keychains",
    cardId: "pet-memorial-keychain-set-card",
    title: "Pet Memorial Keychain Set",
    alt: "Personalized pet memorial keychain set featuring Bailey",
    parts: [
      "pictures/gallery/data/pet-memorial-keychain-set-small-00.txt",
      "pictures/gallery/data/pet-memorial-keychain-set-small-01.txt",
      "pictures/gallery/data/pet-memorial-keychain-set-small-02.txt"
    ]
  });

  addCard({
    sectionId: "custom",
    cardId: "memorial-wallet-card-card",
    title: "Memorial Wallet Card",
    alt: "Custom engraved memorial wallet card featuring a man holding a dog",
    parts: [
      "pictures/gallery/data/memorial-wallet-card-00.txt",
      "pictures/gallery/data/memorial-wallet-card-01.txt",
      "pictures/gallery/data/memorial-wallet-card-02.txt",
      "pictures/gallery/data/memorial-wallet-card-03.txt"
    ]
  });

  addCard({
    sectionId: "custom",
    cardId: "personalized-laser-clips-card",
    title: "Personalized Laser Clips",
    alt: "Two personalized laser clips engraved with Nick and Happy",
    src: "pictures/gallery/custom-engraved-laser-clips.jpg?v=1"
  });

  addCard({
    sectionId: "behind-the-scenes",
    cardId: "design-qr-code-setup-card",
    title: "Design & QR Code Setup",
    alt: "Happy Hour Engraving logo and Instagram QR code being prepared in laser software",
    parts: [
      "pictures/gallery/data/xcs-qr-design-setup-00.txt",
      "pictures/gallery/data/xcs-qr-design-setup-01.txt",
      "pictures/gallery/data/xcs-qr-design-setup-02.txt",
      "pictures/gallery/data/xcs-qr-design-setup-03.txt"
    ]
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
