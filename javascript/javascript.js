
const OpenEye = document.getElementById("open-eye");
const PassWordInput = document.getElementById("passwordLogin");

// Hàm hiển thi mật khẩu
const ShowPassWord = (PassWordInput,OpenEye) => {
    if(PassWordInput.type === "password")
{
    PassWordInput.type = "LC.Store";
    OpenEye.classList.remove("ri-eye-line"); 
    OpenEye.classList.add("ri-eye-off-line");
}
else
{
    PassWordInput.type = "password";
    OpenEye.classList.remove("ri-eye-off-line"); 
    OpenEye.classList.add("ri-eye-line");
}
}
// gọi hàm hiển thị mật khẩu cho mật khẩu
OpenEye.addEventListener("click", () => {
    ShowPassWord(PassWordInput,OpenEye);
});




// mở menu
const SubMenuMobile = document.querySelectorAll(".Humberger-menu-mobile");
const iconHumberger = document.getElementById("Humberger-icon-open");
iconHumberger.addEventListener('click', () => {
    SubMenuMobile.forEach( element => {
        element.classList.toggle("active");
    });
    if (iconHumberger.classList.contains("ri-menu-line")) {
    iconHumberger.classList.remove("ri-menu-line");
    iconHumberger.classList.toggle("ri-close-large-line");
  } else {
    iconHumberger.classList.remove("ri-close-large-line");
    iconHumberger.classList.toggle("ri-menu-line");
  }
});

// mở submenu
const showsubmenu = document.querySelectorAll(".Humberger-Submenu-Mobile");
const menuSubmenu = document.querySelectorAll(".Humberger-menu-mobile > li");
menuSubmenu.forEach((item, index) => {
  item.addEventListener('click', () => {
    showsubmenu[index].classList.toggle("active");
  });
});


// mở from đăng ký
const clickDangKy = document.getElementById("PropMenuUserRegister");
const formDangKy = document.querySelectorAll(".register-container");
const overlay = document.getElementById("overlay");

const clickDangNhap = document.getElementById("PropMenuUserLogin");
const formDangNhap = document.querySelectorAll(".login-container");



// HÀM ĐÓNG VÀ HÀM MỞ FORM start
const HamMoForm = (form) => {
   form.forEach(element => {
    element.classList.add("active");
    overlay.classList.add("active");

  });  
}
const HamDongFrom = (form) => {
    form.forEach(element => {
    element.classList.remove("active");
    overlay.classList.remove("active");  
    document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  });  
}
// HÀM ĐÓNG VÀ HÀM MỞ FORM end

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký
clickDangNhap.addEventListener("click", () => {
  HamMoForm(formDangNhap);
   document.documentElement.classList.add("no-scroll"); 
  document.body.classList.add("no-scroll"); 
});

overlay.addEventListener("click", () => {
 HamDongFrom(formDangKy);
 HamDongFrom(formDangNhap);
});

clickDangKy.addEventListener("click", () => {
 HamMoForm(formDangKy);
    document.documentElement.classList.add("no-scroll"); 
  document.body.classList.add("no-scroll"); 
});

//Mở thanh tìm kiếm
const kinhlup = document.getElementById("KinhLup");
const ThanhTimKiem = document.getElementById("Search-Mobile");
kinhlup.addEventListener('click', () => {
    ThanhTimKiem.classList.add("active");
    overlay.classList.add("active");
    if(overlay.classList.contains)
    {
      overlay.addEventListener('click', () => {
        ThanhTimKiem.classList.remove("active");
      });
    }
});

const TextHoTen = document.getElementById('fullname');
  const TextEmail = document.getElementById('email');
  const TextPassWord1 = document.getElementById('password');
  const TextPassWord2 = document.getElementById('confirmPassword');
  const checkbox = document.getElementById('agree');
  const BtnDangKy = document.getElementById('Btnregister');

  BtnDangKy.addEventListener('click', async () => {
    // Kiểm tra dữ liệu cơ bản
    if (!TextHoTen.value || !TextEmail.value || !TextPassWord1.value || !TextPassWord2.value || !checkbox.checked) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (TextPassWord1.value !== TextPassWord2.value) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    try {
      // Gọi API
      const rawResponse = await fetch('http://localhost:8081/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          HoTen: TextHoTen.value,
          Email: TextEmail.value,
          MatKhau: TextPassWord1.value
        })
      });
      const content = await rawResponse.json();
      console.log('Phản hồi API:', content);
      // Hiển thị phản hồi
      if (rawResponse.ok) {
        alert("Đăng ký thành công!");
      } else {
        alert("Đăng ký thất bại: " + (content.message || "Có lỗi xảy ra"));
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      alert("Không thể kết nối server!");
    }
  });
