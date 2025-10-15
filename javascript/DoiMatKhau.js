
const btnSave = document.getElementById('btnSave');

btnSave.addEventListener("click" , async () =>{
      const params = new URLSearchParams(window.location.search);
      const idUser = params.get("id");

    const Pass = document.getElementById('Pass').value.trim();
    const XacNhanPass = document.getElementById('XacNhanPass').value.trim();
      if (!Pass || !XacNhanPass) {
    alert("Vui lòng nhập đầy đủ mật khẩu");
    return;
  }
    
    if(Pass !== XacNhanPass)
    {
        alert("Mật khẩu không khớp");
        return;
    }
    
    else{
    const res = await fetch(`http://localhost:8081/api/v1/auth/users/${idUser}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: Pass })
    });
    if(res.ok)
    {
        alert("Đổi mật khẩu thành công");
    }
    else 
    {
        alert('Đổi mật khẩu thất bại');
    }
    }

})
