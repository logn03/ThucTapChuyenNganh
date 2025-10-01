// nút humberger để mở sidebars khi ở ipad mobile start
const clickHumberger = document.getElementById("toggleSidebar");
const clickCloseSideBars = document.getElementById("IconClose");
const sidebar = document.getElementById("sidebars");
clickHumberger.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    clickCloseSideBars.classList.toggle("d-lg-none");
    clickCloseSideBars.classList.add("d-lg-none");
})
// nút humberger để mở sidebars khi ở ipad mobile end

// nút tắt sidebars khi ở ipad, mobile start
clickCloseSideBars.addEventListener("click", () => {
    sidebar.classList.remove("show");
})
// nút tắt sidebars khi ở ipad, mobile end