//hàm hiện sidebars khi ở ipad mobile start
const HamMoSideBars = function (sidebar, iconClose, iconhumberger) {
  iconhumberger.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    iconClose.classList.toggle("d-lg-none");
    iconClose.classList.add("d-lg-none");
  });
}
//hàm hiện sidebars khi ở ipad mobile end
// hàm tắt sidebars start
const TatSideBar = function (sidebar, iconClose) {
  iconClose.addEventListener("click", () => {
    sidebar.classList.remove("show");
  })
}
// hàm tắt sidebars end

// nút humberger để mở sidebars khi ở ipad mobile start
const clickHumberger = document.getElementById("toggleSidebar");
const clickCloseSideBars = document.getElementById("IconClose");
const sidebar = document.getElementById("sidebars");
HamMoSideBars(sidebar, clickCloseSideBars, clickHumberger);
// nút humberger để mở sidebars khi ở ipad mobile end

// nút tắt sidebars khi ở ipad, mobile start
TatSideBar(sidebar, clickCloseSideBars);
// nút tắt sidebars khi ở ipad, mobile end




// lấy danh sách người dùng start
const LoadDanhSachUser = async () => {
  const res = await fetch("http://localhost:8081/api/v1/auth/users");
  const data = await res.json();
  const tbody = document.getElementById("table");
  tbody.innerHTML ="";
  data.forEach(element => {

    tbody.innerHTML += `
<tr>
  <td>${element.id}</td>
  <td>${element.fullname}</td>
  <td>${element.username}</td>
  <td>${element.email}</td>
  <td>${element.phone}</td>
  <td><button 
      data-userName="${element.username}"
      class="BtnChinhSua">
      Chỉnh Sửa
  </button></td>
  <td><button 
      data-id="${element.id}"
      class="BtnXoa">
      Xóa
  </button></td>
</tr>
`
  });

  //Khi nhấn chỉnh sửa chuyển qua trang chỉnh sửa của user đó dựa vào username start
  const BtnChinhSua = document.querySelectorAll(".BtnChinhSua");
  BtnChinhSua.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nameUser = btn.getAttribute("data-userName");
      window.location.href = `/html/Trang Admin/ChinhSuaUser.html?username=${nameUser}`;
    })
  })
  //Khi nhấn chỉnh sửa chuyển qua trang chỉnh sửa của user đó dựa vào username end

  //xóa 1 user start
const BtnXoa = document.querySelectorAll(".BtnXoa");
if(BtnXoa)
{
  BtnXoa.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const idUser = btn.getAttribute("data-id");
    const res = await fetch(`http://localhost:8081/api/v1/auth/users/${idUser}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const row = btn.closest('tr');
    row.remove();
    if(res.ok)
    {
      alert("Xóa thành công!");
      LoadDanhSachUser();
    }
    else
    {
      alert("Xóa thất bại");
    }
  })
})
}
//xóa 1 user end



}
// lấy danh sách người dùng end







LoadDanhSachUser();
