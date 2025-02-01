document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".gallery-img").forEach(img => {
        img.addEventListener("click", () => {
            let popup = Object.assign(document.createElement("div"), {
                style: "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;"
            });

            let fullImage = Object.assign(document.createElement("img"), {
                src: img.src.replace("-sm.jpeg", "-full.jpeg"),
                style: "max-width:90%;max-height:90%;"
            });

            let closeButton = Object.assign(document.createElement("button"), {
                innerText: "X",
                style: "position:absolute;top:10px;right:10px;background:white;border:none;padding:10px;cursor:pointer;font-size:16px;",
                onclick: () => document.body.removeChild(popup)
            });

            popup.append(fullImage, closeButton);
            document.body.appendChild(popup);
        });
    });

    document.querySelector(".menu-btn").addEventListener("click", () => {
        document.querySelector("nav").classList.toggle("hide");
    });
    
    function handleResize() {
        document.querySelector("nav").classList.toggle("hide", window.innerWidth <= 1000);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
});
