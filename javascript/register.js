import {
  openForm,
  closeForm
} from './Ham.js';

// lấy element của form đn/dk và overlay
const formRegister = document.getElementById('register-container');
const TextRegisterMessage = document.getElementById('registerMessage');
const overlay = document.getElementById("overlay");
const btnRegisterSubmit = document.getElementById("btnRegisterSubmit");

btnRegisterSubmit.addEventListener("click", async (e) => {
    // lấy giá trị của các element
const TextFirtName = document.getElementById('firtname').value.trim();
const TextLastName = document.getElementById('lastname').value.trim();
const TextUsername = document.getElementById('Username').value.trim();
const TextEmail = document.getElementById('email').value.trim();
const TextPhoneNumber = document.getElementById('sdt').value.trim();
const TextPassWord1 = document.getElementById('passwordRegister').value;
const TextPassWord2 = document.getElementById('confirmPassword').value;
    //không cho load trang
    e.preventDefault();
    //điều kiện đk
    if (TextPassWord1 != TextPassWord2) {
        TextRegisterMessage.innerHTML = 'Xác nhận mật khẩu không chính xác!';
        return;
    }
    if (!TextFirtName || !TextLastName || !TextUsername || !TextEmail || !TextPhoneNumber || !TextPassWord1 || !TextPassWord2) {
        TextRegisterMessage.innerHTML = 'Vui long điều đầy đủ thông tin!';
        return;
    }
    if (TextPassWord1.length < 6) {
        TextRegisterMessage.innerHTML = 'Mật khẩu phải có ít nhất 6 ký tự';
        return;
    }
      try {
    // Gọi API
    const rawResponse = await fetch('http://localhost:8080/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: TextFirtName,
        lastName: TextLastName,
        username: TextUsername,
        email: TextEmail,
        phone: TextPhoneNumber,
        password:TextPassWord1
      })
    });

    const data = await rawResponse.json();
    // Hiển thị phản hồi
    if (rawResponse.ok) {
      alert("Đăng ký thành công!");
        setTimeout(() => {
            closeForm(formRegister,overlay);
            openForm(formLogin,overlay);
        }, 1500);

    } else {
      alert("Đăng ký thất bại: " + (data.message || "Có lỗi xảy ra"));
    }
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    alert("Không thể kết nối server!");
  }
});