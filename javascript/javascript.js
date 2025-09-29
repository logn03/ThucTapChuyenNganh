
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




// mở menu
const SubMenuMobile = document.querySelectorAll(".Humberger-menu-mobile");
const iconHumberger = document.getElementById("Humberger-icon-open");
iconHumberger.addEventListener('click', () => {
  SubMenuMobile.forEach(element => {
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
const clickDangKy = document.getElementById("btnRegister");
const formDangKy = document.querySelectorAll(".register-container");
const overlay = document.getElementById("overlay");
const clickDangNhap = document.getElementById("btnLogin");
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

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký start
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

//Mở thanh tìm kiếm
const kinhlup = document.getElementById("KinhLup");
const ThanhTimKiem = document.getElementById("Search-Mobile");
kinhlup.addEventListener('click', () => {
  ThanhTimKiem.classList.add("active");
  overlay.classList.add("active");
  if (overlay.classList.contains) {
    overlay.addEventListener('click', () => {
      ThanhTimKiem.classList.remove("active");
    });
  }
});



//API CHO FORM ĐĂNG KÝ
async function APIDANGKY(event) {
  event.preventDefault();

  const TextHoTen = document.getElementById('fullname').value;
  const TextUsername = document.getElementById('Username').value;
  const TextEmail = document.getElementById('email').value;
  const TextPhoneNumber = document.getElementById('sdt').value;
  const TextPassWord1 = document.getElementById('passwordRegister').value;
  const TextPassWord2 = document.getElementById('confirmPassword').value;
  const TextRegisterMessage = document.getElementById('registerMessage');
  if (TextPassWord1 != TextPassWord2) {
    alert('Xác nhận mật khẩu không chính xác!');
    return;
  }
  if (!TextHoTen || !TextUsername || !TextEmail || !TextPhoneNumber || !TextPassWord1 || !TextPassWord2) {
    alert('Vui long điều đầy đủ thông tin!')
    return;
  }
  if (TextPassWord1.length < 6) {
    TextRegisterMessage.innerHTML = 'Mật khẩu phải có ít nhất 6 ký tự';
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
        fullname: TextHoTen,
        username: TextUsername,
        email: TextEmail,
        phone: TextPhoneNumber,
        password: TextPassWord1
      })
    });

    const data = await rawResponse.json();
    // Hiển thị phản hồi
    if (rawResponse.ok) {
      alert("Đăng ký thành công!");

      setTimeout(() => {
        HamMoForm(formDangNhap)
    },1500);

    } else {
      alert("Đăng ký thất bại: " + (data.message || "Có lỗi xảy ra"));
    }
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    alert("Không thể kết nối server!");
  }
}

//API CHP FORM ĐĂNG NHẬP
async function APIDANGNHAP(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("passwordLogin").value;
  if(!username || !password)
  {
    alert('vui lòng nhập thông tin đăng nhập');
    return;
  }
  try {
    const rawResponse = await fetch('http://localhost:8081/api/v1/auth/login', {
              method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
    const data = await rawResponse.json();
      if (rawResponse.ok)
      {
        alert('Đăng Nhập Thành Công!');
      
        if(data.token)
        {
          localStorage.setItem('authToken', data.token);
        }
        if(data.user)
        {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
          HamDongFrom(formDangNhap);
          setTimeout(() => {
            window.location.href="/html/index.html";
          }, 1500);
      }

      else
      {
        alert('Đăng nhập thất bại')
      }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    alert("Không thể kết nối server!");
  }
}