window.onload = () => {
    let Valid_Account_Name = false
    let Valid_Email_Address = false
    let Valid_Password_Strength = false
    let Valid_Recheck_Password = false
    let public_key = ''
    let newAccount = document.querySelector('.new-account')
    let registerEmailAddress = document.querySelector('.email')
    let registerPassword = document.querySelector('#registerPassword')
    let recheckPassword = document.querySelector('#recheckPassword')
    const checkBoxChange = document.querySelector('.remember-forgot.register')
    const checkBoxLink = document.querySelector('.remember-forgot.register a')
    const logregBox = document.querySelector('.logreg-box')
    const loginLink = document.querySelector('.login-link')
    const registerLink = document.querySelector('.register-link')
    const backLink = document.querySelector('.verify-link')
    const signUpLink = document.querySelector('#SignUp')
    const terms = document.querySelector('.terms')
    const closure = document.querySelector('.close')
    const termsAgree = document.querySelector('.terms-agreement .agree')
    const termsDisagree = document.querySelector('.terms-agreement .disagree')
    const submitCode = document.querySelector('#Submit')
    const submitLogin = document.querySelector('#SignIn')
    registerLink.addEventListener('click', () => {
        logregBox.classList.add('active1');
    });
    loginLink.addEventListener('click', () => {
        logregBox.classList.remove('active1');
    });
    terms.addEventListener('scroll', () => {
        terms.classList.add('scroll-setting')
        setTimeout(() => {
           terms.classList.remove('scroll-setting')
        }, 1000)
    });
    checkBoxChange.addEventListener('click', () => {
        const checkBox = $('#registerCheckbox')[0]
        if (checkBox.checked) {
            terms.classList.add('active')
        }
        else {
            terms.classList.remove('active')
        }
    });
    checkBoxLink.addEventListener('click', () => {
        $('#registerCheckbox')[0].checked = true
    });
    closure.addEventListener('click', () => {
        terms.classList.remove('active')
        terms.classList.add('inactive')
        $('#registerCheckbox')[0].checked = false
        setTimeout(() => {
            terms.classList.remove('inactive')
        }, 1000)
    });
    termsAgree.addEventListener('click', () => {
        terms.classList.remove('active')
        terms.classList.add('inactive')
        $('#registerCheckbox')[0].checked = true
        setTimeout(() => {
            terms.classList.remove('inactive')
        }, 1000)
    });
    termsDisagree.addEventListener('click', () => {
        closure.click()
    });
    function randomString(length) {
        let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i)
            result += str[Math.floor(Math.random() * str.length)];
        return result;
    }
    async function encryptInfo(originKey, pub_key) {
        return new Promise((resolve) => {
            const aesKey = CryptoJS.enc.Utf8.parse(originKey)
            const account = CryptoJS.enc.Utf8.parse(document.querySelector('.new-account').value)
            const password = CryptoJS.enc.Utf8.parse(document.querySelector('#registerPassword').value)
            const email = CryptoJS.enc.Utf8.parse(document.querySelector('.email').value)
            const encrypted_account = CryptoJS.AES.encrypt(account, aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encrypted_password = CryptoJS.AES.encrypt(password, aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encrypted_email = CryptoJS.AES.encrypt(email, aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(pub_key)
            const encrypted_originKey = encryptor.encrypt(originKey)
            resolve({"encrypted_account": encrypted_account, "encrypted_password": encrypted_password,
                "encrypted_email": encrypted_email, "encrypted_aesKey": encrypted_originKey})
        })
    }
    async function postPersonalInfo() {
        return new Promise((resolve) => {
            const socket = new WebSocket('ws://' + window.location.host + '/ws/register/')
            socket.onmessage = (e) => {
                let {pub_key, result} = JSON.parse(e.data)
                if (pub_key !== undefined) {
                    const originKey = randomString(32)
                    public_key = pub_key
                    encryptInfo(originKey, pub_key).then((encryptData) => {
                        socket.send(JSON.stringify(encryptData))
                    })
                }
                else {
                    resolve(result)
                }
            }
        })
    }
    async function encryptLogin(originKey, pub_key) {
        return new Promise((resolve) => {
            const aesKey = CryptoJS.enc.Utf8.parse(originKey)
            const encrypted_account = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(
                $('#chatbot-account')[0].value), aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encrypted_password = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(
                $('#chatbot-password')[0].value), aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(pub_key)
            const encrypted_aesKey = encryptor.encrypt(originKey)
            resolve({'encrypted_account': encrypted_account, 'encrypted_password': encrypted_password,
                'remember': $('#remember')[0].checked, 'encrypted_aesKey': encrypted_aesKey})
        })
    }
    function getCookiesObject() {
        // 首先，获取当前所有的cookie
        let allCookies = document.cookie.split(';');
        // 初始化一个对象来存储cookie的键值对
        let cookiesObj = {};
        // 解析cookie字符串
        for (let i = 0; i < allCookies.length; i++) {
            let cookie = allCookies[i].trim();
            let equalsIndex = cookie.indexOf('=');
            let name = equalsIndex > -1 ? cookie.substring(0, equalsIndex) : cookie;
            cookiesObj[name] = equalsIndex > -1 ? cookie.substring(equalsIndex + 1) : '';
        }
        return cookiesObj
    }
    async function postLoginInfo() {
        return new Promise((resolve) => {
            const socket = new WebSocket('ws://' + window.location.host + '/ws/login/')
            socket.onmessage = (e) => {
                let {pub_key, token, imagesetID} = JSON.parse(e.data)
                if (pub_key !== undefined) {
                    const originKey = randomString(32)
                    public_key = pub_key
                    encryptLogin(originKey, pub_key).then((sendMessage) => {
                        socket.send(JSON.stringify(sendMessage))
                    })
                }
                else if (token !== undefined) {
                    if (token !== null) {
                        // 登录通过，设置token
                        let expiryDate = new Date()
                        if ($('#remember')[0].checked) {
                            expiryDate.setDate(expiryDate.getDate() + 15);
                        }
                        else {
                            expiryDate.setDate(expiryDate.getDate() + 5);
                        }
                        document.cookie = 'token=' + token + '; expires=' + expiryDate.toUTCString() + '; path=/;';
                        document.cookie = 'imagesetID=' + imagesetID + '; expires=' + expiryDate.toUTCString() + '; path=/';
                        resolve(true)
                    }
                    else {
                        // 登录未通过，提示信息
                        resolve(false)
                    }
                }
            }
        })
    }
    submitLogin.addEventListener('click', () => {
        const account = document.querySelector('#chatbot-account').value
        const password = document.querySelector('#chatbot-password').value
        const signInLabel = document.querySelector('#SignIn div')
        if (account !== '' && password !== '') {
            signInLabel.classList.add('active')
            postLoginInfo().then((result) => {
                signInLabel.classList.remove('active')
                if (result) {
                    submitLogin.innerHTML = 'Sign In&nbsp;&nbsp;<i class="bi bi-check-circle-fill"></i>'
                    setTimeout(() => {
                        submitLogin.innerHTML = 'Sign In<div class="circle"></div>'
                        window.location.reload()
                    }, 1000)
                }
                else {
                    const loginErrorInfo = document.querySelector('.login-error')
                    loginErrorInfo.style.zIndex = '99'
                    loginErrorInfo.style.animation = 'showLoginError .5s linear forwards'
                    setTimeout(() => {
                        loginErrorInfo.style.animation = 'packUpLoginError .5s linear forwards'
                        setTimeout(() => {
                            loginErrorInfo.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
            })
        }
        else {
            submitLogin.style.animation = 'errorShow .4s linear forwards'
            setTimeout(() => {
                submitLogin.style.animation = ''
            }, 400)
        }
    })
    function SignUpErrorProcess (SignUpDiv) {
        SignUpDiv.classList.remove('active')
        signUpLink.setAttribute('disabled', 'disabled')
        signUpLink.style.cursor = 'default'
        let totalTime = 10
        let x = setInterval(() => {
            signUpLink.innerText = 'Sign Up' + '(' + totalTime + ')';
            totalTime--;
            if (totalTime < 0) {
                signUpLink.innerHTML = 'Sign Up<div class="circle"></div>'
                signUpLink.removeAttribute('disabled')
                signUpLink.style.cursor = 'pointer'
                clearInterval(x)
            }
        }, 1000)
    }
    signUpLink.addEventListener('click', () => {
        if (Valid_Account_Name && Valid_Email_Address && Valid_Password_Strength && Valid_Recheck_Password &&
            $('#registerCheckbox')[0].checked) {
            const SignUpDiv = $('#SignUp div')[0]
            SignUpDiv.classList.add('active')
            postPersonalInfo().then((result) => {
                if (result === 'Waiting For Registration') {
                    SignUpDiv.classList.remove('active')
                    let totalTime = 30
                    let x = setInterval(() => {
                        signUpLink.innerText = 'Sign Up' + '(' + totalTime + ')';
                        totalTime--;
                        if (totalTime < 0) {
                            signUpLink.innerHTML = 'Sign Up<div class="circle"></div>'
                            signUpLink.removeAttribute('disabled')
                            signUpLink.style.cursor = 'pointer'
                            clearInterval(x)
                        }
                    }, 1000)
                    logregBox.classList.remove('active1');
                    logregBox.classList.add('active2');
                    signUpLink.setAttribute('disabled', 'disabled')
                    signUpLink.style.cursor = 'default'
                }
                else if (result === 'Already Registered'){
                    let registerAccount = document.querySelectorAll('.input-box.register label')[0]
                    registerAccount.innerHTML = 'New Account Name [Already Registered] <i class="bx bxs-error-circle"></i>'
                    registerAccount.style.color = 'red'
                    Valid_Account_Name = false
                    SignUpErrorProcess(SignUpDiv)
                }
                else if (result === 'Email Failure') {
                    let registerEmailLabel = document.querySelectorAll('.input-box.register label')[1]
                    registerEmailLabel.innerHTML = 'Email [Invalid Address] <i class="bx bxs-error-circle"></i>'
                    registerEmailLabel.style.color = 'red'
                    Valid_Email_Address = false
                    SignUpErrorProcess(SignUpDiv)
                }
            })
        }
        else {
            signUpLink.style.animation = 'errorShow .4s linear forwards'
            setTimeout(() => {
                signUpLink.style.animation = ''
            }, 400)
        }
    });
    async function postChange() {
        return new Promise((resolve) => {
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(public_key)
            $.ajax({
                url: '/back/',
                type: 'post',
                beforeSend: function(xhr, settings) {
                    // 在请求头中添加csrf_token
                    xhr.setRequestHeader("X-CSRFToken", $("[name='csrfmiddlewaretoken']").val());
                },
                data: {
                    'encrypted_account': encryptor.encrypt(document.querySelector('.new-account').value),
                    'public_key': public_key
                },
                async: false,
                success: (data) => {
                    let dataObj = eval("("+data+")")
                    resolve(dataObj["result"])
                }
            })
        })
    }
    backLink.addEventListener('click', () => {
        postChange().then((res) => {
            if (res) {
                logregBox.classList.remove('active2');
                logregBox.classList.add('active1');
            }
            else {
                location.reload()
            }
        })
    });
    async function postCode(code) {
        return new Promise((resolve) => {
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(public_key)
            $.ajax({
                url: '/verify/',
                type: 'post',
                beforeSend: function(xhr, settings) {
                    // 在请求头中添加csrf_token
                    xhr.setRequestHeader("X-CSRFToken", $("[name='csrfmiddlewaretoken']").val());
                },
                data: {
                    'encrypted_code': encryptor.encrypt(code),
                    'encrypted_password': encryptor.encrypt(document.querySelector('#registerPassword').value),
                    'public_key': public_key
                },
                async: false,
                success: (data) => {
                    let dataObj = eval("("+data+")")
                    resolve(dataObj["result"])
                }
            })
        })
    }
    submitCode.addEventListener('click', () => {
        const SubmitDiv = $('#Submit div')[0]
        const code = document.querySelector('.code').value
        if (code.length === 6) {
            SubmitDiv.classList.add('active')
            postCode(code).then((res) => {
                setTimeout(() => {
                    SubmitDiv.classList.remove('active')
                    const registerVerifyLabel = document.querySelector('.input-box.verify label')
                    const Submit = $('#Submit')[0]
                    if (res) {
                        registerVerifyLabel.innerHTML = 'Email Verify Number'
                        registerVerifyLabel.style.color = '#e4e4e4'
                        Submit.innerHTML = 'Successful&nbsp;<i class="bi bi-check-circle-fill"></i>';
                        Submit.style.cursor = 'pointer'
                        setTimeout(() => {
                            window.location.reload()
                        }, 1000)
                    }
                    else {
                        registerVerifyLabel.innerHTML = 'Email Verify Number&nbsp;[Invalid]&nbsp;<i class="bx bxs-error-circle"></i>'
                        registerVerifyLabel.style.color = 'red'
                        Submit.setAttribute('disabled', 'disabled')
                        Submit.style.cursor = 'default'
                        let totalTime = 10
                        let x = setInterval(() => {
                            Submit.innerText = 'Submit' + '(' + totalTime + ')';
                            totalTime--;
                            if (totalTime < 0) {
                                Submit.innerHTML = 'Submit<div class="circle"></div>'
                                Submit.removeAttribute('disabled')
                                Submit.style.cursor = 'pointer'
                                clearInterval(x)
                            }
                        }, 1000)
                    }
                }, 800)
            })
        }
        else {
            submitCode.style.animation = 'errorShow .4s linear forwards'
            setTimeout(() => {
                submitCode.style.animation = ''
            }, 400)
        }
    })
    newAccount.onchange = async () => {
        let account = document.querySelector('.new-account').value
        let registerAccount = document.querySelectorAll('.input-box.register label')[0]
        if (account !== '') {
            $.ajax({
                url: '/accounts/',
                type: 'post',
                beforeSend: function(xhr, settings) {
                    // 在请求头中添加csrf_token
                    xhr.setRequestHeader("X-CSRFToken", $("[name='csrfmiddlewaretoken']").val());
                },
                data: {
                    'account': account
                },
                async: false,
                success: (data) => {
                    let dataObj = eval("("+data+")")
                    if (dataObj["result"] === true) {
                        registerAccount.innerHTML = 'New Account Name <i class="bi bi-check-circle-fill"></i>'
                        registerAccount.style.color = 'lightgreen'
                        Valid_Account_Name = true
                    }
                    else {
                        registerAccount.innerHTML = 'New Account Name [Already Registered] <i class="bx bxs-error-circle"></i>'
                        registerAccount.style.color = 'red'
                        Valid_Account_Name = false
                    }
                }
            })
        }
        else {
            registerAccount.innerHTML = 'New Account Name'
            registerAccount.style.color = '#e4e4e4'
            Valid_Account_Name = false
        }
    };
    function IsEmail(str) {
        let reg = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/;
        return  reg.test(str);
    }
    registerEmailAddress.onchange = () => {
        let val = document.querySelector('.email').value
        let registerEmailLabel = document.querySelectorAll('.input-box.register label')[1]
        Valid_Email_Address = IsEmail(val);
        if (!Valid_Email_Address) {
            registerEmailLabel.innerHTML = 'Email <i class="bx bxs-error-circle"></i>'
            registerEmailLabel.style.color = 'red'
        }
        else {
            registerEmailLabel.innerHTML = 'Email <i class="bi bi-check-circle-fill"></i>'
            registerEmailLabel.style.color = 'lightgreen'
        }
        if (val === '') {
            registerEmailLabel.innerHTML = 'Email'
            registerEmailLabel.style.color = '#e4e4e4'
        }
    };
    registerPassword.oninput = () => {
        let val = document.querySelector('#registerPassword').value
        let registerPasswordLabel = document.querySelectorAll('.input-box.register label')[2]
        let recheckPasswordLabel = document.querySelectorAll('.input-box.register label')[3]
        recheckPassword.value = ''
        Valid_Recheck_Password = false
        recheckPasswordLabel.innerHTML = 'Recheck your password'
        recheckPasswordLabel.style.color = '#e4e4e4'
        let lv = 0; //初始化提示消息为空
        if (val.match(/[a-z]/g)) { lv++; } //验证是否包含字母
        if (val.match(/[0-9]/g)) { lv++; }  // 验证是否包含数字
        if (val.match(/(.[^a-z0-9])/g)) { lv++; } //验证是否包含字母，数字，字符
        if (val.length < 6) { lv = 1; } //如果密码长度小于6位，提示消息为空
        if (lv > 3) { lv = 3; }
        if (lv === 1) {
            recheckPassword.setAttribute('disabled', 'disabled')
            registerPasswordLabel.innerHTML = 'Password [Weak] <i class="bx bxs-error-circle"></i>'
            registerPasswordLabel.style.color = 'red'
            Valid_Password_Strength = false
        }
        else if (lv === 2) {
            recheckPassword.removeAttribute('disabled')
            registerPasswordLabel.innerHTML = 'Password [Moderate] <i class="bi bi-check-circle-fill"></i>'
            registerPasswordLabel.style.color = 'lightgreen'
            Valid_Password_Strength = true
        }
        else if (lv === 3) {
            recheckPassword.removeAttribute('disabled')
            registerPasswordLabel.innerHTML = 'Password [Strong] <i class="bi bi-check-circle-fill"></i>'
            registerPasswordLabel.style.color = 'lightgreen'
            Valid_Password_Strength = true
        }
        if (val === '') {
            recheckPassword.removeAttribute('disabled')
            registerPasswordLabel.innerHTML = 'Password'
            registerPasswordLabel.style.color = '#e4e4e4'
            Valid_Password_Strength = false
        }
    };
    recheckPassword.oninput = () => {
        let password = document.querySelector('#registerPassword').value
        let recheck = document.querySelector('#recheckPassword').value
        let recheckPasswordLabel = document.querySelectorAll('.input-box.register label')[3]
        Valid_Recheck_Password = password === recheck;
        if (!Valid_Recheck_Password) {
            recheckPasswordLabel.innerHTML = 'Recheck your password <i class="bx bxs-error-circle"></i>'
            recheckPasswordLabel.style.color = 'red'
        }
        else {
            recheckPasswordLabel.innerHTML = 'Recheck your password <i class="bi bi-check-circle-fill"></i>'
            recheckPasswordLabel.style.color = 'lightgreen'
        }
        if (recheck === '') {
            recheckPasswordLabel.innerHTML = 'Recheck your password'
            recheckPasswordLabel.style.color = '#e4e4e4'
        }
    };
    $('#FormSignUp').submit(function (event) {
        event.preventDefault()
    });
    $('#FormVerify').submit(function (event) {
        event.preventDefault()
    });
    $('#FormSignIn').submit(function (event) {
        event.preventDefault()
    });
}

