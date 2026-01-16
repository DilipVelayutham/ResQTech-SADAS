const $ = id => document.getElementById(id);
const button = document.querySelector('.login-button');
const error = $('error');

$('togglePassword').onclick = () => {
    const p = $('password');
    p.type = p.type === 'password' ? 'text' : 'password';
    event.target.classList.toggle('fa-eye-slash');
};

function login(){
    const u = $('username').value.trim();
    const p = $('password').value.trim();

    error.classList.remove('show');

    if(!u || !p){
        error.textContent = "Please fill all fields";
        error.classList.add('show');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

    setTimeout(()=>{
        if(u === "admin" && p === "admin123"){
            button.innerHTML = "Login Successful ✔";
            button.style.background = "linear-gradient(45deg,#10b981,#34d399)";
            setTimeout(()=>location.href="dashboard.html",1000);
        }else{
            error.textContent = "Invalid username or password";
            error.classList.add('show');
            button.style.animation = "shake .5s";
            setTimeout(()=>button.style.animation="",500);
            button.innerHTML = 'Sign In <i class="fas fa-sign-in-alt"></i>';
            button.disabled = false;
        }
    },1500);
}
