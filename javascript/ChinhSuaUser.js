

// lấy thông tin 1 người dùng start
const LoadNguoiDung = async () => {
      const params = new URLSearchParams(window.location.search);
      const UserName = params.get("username");


      const res = await fetch(`http://localhost:8081/api/v1/auth/users/${UserName}`);
      const data = await res.json();

      document.getElementById("id").value = data.id;
      document.getElementById("fullname").value = data.fullname;
      document.getElementById("username").value = data.username;
      document.getElementById("email").value = data.email;
      document.getElementById("phone").value = data.phone;

}
// lấy thông tin 1 người dùng end

LoadNguoiDung();



const btnSave = document.getElementById("btnSave");
btnSave.addEventListener("click", async () => {

      const id = document.getElementById("id").value;
      const fullname = document.getElementById("fullname").value;
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;      

      const res = await fetch(`http://localhost:8081/api/v1/auth/users/${id}`, {
            method: 'PUT',
            headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                  fullname: fullname,
                  username: username,
                  email: email,
                  phone: phone
            })
      });
      if(res.ok)
      {
            alert("Cập Nhật Thông Tin Thành Công");
            window.location.href = "/html/TrangNguoiDung.html";
      }
      else
      {
            alert("Cập Nhật Thông Tin Người Dùng Thất Bại")
      }
})


const btnDoiMatKhau = document.getElementById("btnDoiMatKhau");
btnDoiMatKhau.addEventListener("click", ()=>{
      const idUser = document.getElementById("id").value;
      window.location.href=`/html/Trang Admin/TrangNguoiDung.html?id=${idUser}`;
})