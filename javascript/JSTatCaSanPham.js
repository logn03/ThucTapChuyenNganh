//giá
const MuitenGia = document.querySelector(".PiceItem i")
const TitlePrice = document.getElementById("PriceItem");
const ContentPrice = document.getElementById("Price");
//màu
const MuitenMau = document.querySelector(".Color i")
const TitleColor = document.getElementById("TitleColor");
const ContentColor = document.getElementById("ContentColor");
//size
const MuitenSize = document.querySelector(".Size i")
const TitleSize = document.getElementById("TitleSize");
const ContentSize = document.getElementById("ContenSize");

// Hàm Ẩn hiện thanh giá tiền của sidebars start
const AnHien = function(title, contents, muiten){
    title.addEventListener('click', () => {
        contents.classList.toggle('show');
        muiten.classList.toggle('xoay');
    });
}
// Hàm Ẩn hiện thanh giá tiền của sidebars end
AnHien(TitlePrice,ContentPrice,MuitenGia);
AnHien(TitleColor,ContentColor,MuitenMau);
AnHien(TitleSize,ContentSize,MuitenSize);




// ẩn hiện cho sidebars mobile start
const BtnSideBarMobile = document.getElementById("BtnSideBarMobile");
const Sidebar = document.getElementById("Sidebars");
const IconFilter = document.getElementById("IconFilter");
BtnSideBarMobile.addEventListener('click', () => {
    Sidebar.classList.toggle('show');
    IconFilter.classList.toggle("ri-sound-module-line");
    IconFilter.classList.toggle("ri-close-large-line");
});
// Nhấn icon X để đóng sidebar
IconFilter.addEventListener('click', () => {
    if (Sidebar.classList.contains('show')) {
        Sidebar.classList.remove('show');
        IconFilter.classList.remove("ri-close-large-line");
        IconFilter.classList.add("ri-sound-module-line");
    }
});
// ẩn hiện cho sidebars mobile end



// mở menu mobile
const SubMenuMobile = document.getElementById("Humberger-menu-mobile");
const iconHumberger = document.getElementById("Humberger-icon-open");
if(iconHumberger){
iconHumberger.addEventListener('click', () => {
  SubMenuMobile.classList.toggle("active");
    iconHumberger.classList.toggle("ri-menu-line");
    iconHumberger.classList.toggle("ri-close-large-line");
});
}
// mở submenu mobile
const showsubmenu = document.querySelectorAll(".Humberger-Submenu-Mobile");
const menuSubmenu = document.querySelectorAll("#Humberger-menu-mobile > li");
const XoayMuiTen = document.querySelectorAll("#Humberger-menu-mobile > li > a > i");

menuSubmenu.forEach((titleSubmenu, vitri) => {
  titleSubmenu.addEventListener('click', () => {
    showsubmenu[vitri].classList.toggle("active");
    XoayMuiTen[vitri].classList.toggle('xoay');
  });
});


const clickDangKy = document.getElementById("btnRegister");
const formDangKy = document.getElementById("register-container");
const overlay = document.getElementById("overlay");
const clickDangNhap = document.getElementById("btnLogin");
const formDangNhap = document.getElementById("login-container");


// HÀM ĐÓNG VÀ HÀM MỞ FORM start
const HamMoForm = (form) => {
    form.classList.add("active");
    overlay.classList.add("active");
}

const HamDongFrom = (form) => {
    form.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}


// HÀM ĐÓNG VÀ HÀM MỞ FORM end

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký start


clickDangNhap.addEventListener("click", () => {
  HamMoForm(formDangNhap);
  document.body.classList.add("no-scroll");
});

overlay.addEventListener("click", () => {
  HamDongFrom(formDangKy);
  HamDongFrom(formDangNhap);
});

clickDangKy.addEventListener("click", () => {
  HamMoForm(formDangKy);
  document.body.classList.add("no-scroll");
});



// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký end

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký mobile start
const clickDangNhapMobile = document.getElementById("PropMenuUserLogin");
const clickDangKyMobile = document.getElementById("PropMenuUserRegister");




clickDangNhapMobile.addEventListener("click", () => {
  HamMoForm(formDangNhap);
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
});

clickDangKyMobile.addEventListener("click", () => {
  HamMoForm(formDangKy);
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
});

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký mobile end


// Icon đóng form Login
document.querySelector(".login-form-title .iconX i").addEventListener("click", () => {
  HamDongFrom(formDangNhap);
});
// Icon đóng form Register
document.querySelector(".register-form-title .iconX i").addEventListener("click", () => {
  HamDongFrom(formDangKy);
});




const OpenEye = document.getElementById("open-eye");
const PassWordInput = document.getElementById("passwordLogin");

// Hàm hiển thi mật khẩu
const ShowPassWord = (PassWordInput, OpenEye) => {
  if (PassWordInput.type === "password") {
    PassWordInput.type = "LC.Store";
    OpenEye.classList.remove("ri-eye-line");
    OpenEye.classList.add("ri-eye-off-line");
  }
  else {
    PassWordInput.type = "password";
    OpenEye.classList.remove("ri-eye-off-line");
    OpenEye.classList.add("ri-eye-line");
  }
}
// gọi hàm hiển thị mật khẩu cho mật khẩu
OpenEye.addEventListener("click", () => {
  ShowPassWord(PassWordInput, OpenEye);
});

