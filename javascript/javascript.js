
const OpenEye = document.getElementById("open-eye");
const PassWordInput = document.getElementById("password");

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
// gọi hàm hiển thị mật khẩu cho mật khẩu và nhập lại mật khẩu
OpenEye.addEventListener("click", () => {
    ShowPassWord(PassWordInput,OpenEye);
});

const OpenEye2 = document.getElementById("open-eye-2");
const PassWordInput2 = document.getElementById("password2");
OpenEye2.addEventListener("click",() => {
    ShowPassWord(PassWordInput2,OpenEye2);
})
