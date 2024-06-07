window.onload = () => {
    const acceptFileType = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp']
    let public_key = ''
    let Face_Classification = []
    let detailComparisonInfo = []
    let processing_index = [0]
    const sidebar = document.querySelector('.sidebar')
    const toggleBtn = document.querySelector('.toggle-btn')
    const hoverLike = document.querySelector('.hover-like')
    const audio = document.getElementById('backgroundMusic')
    const listItem = document.querySelectorAll('.list-item')
    const detectedFacesButton = document.querySelector('#detected-faces')
    const historyButton = document.querySelector('#history')
    const settingsButton = document.querySelector('#settings')
    const content = document.querySelectorAll('.content')
    const submit = document.querySelector('.submit')
    const detailLabelClick = document.querySelector('#face-detail-feature-btn')
    let imagesForTarget = document.querySelectorAll('.image.target')
    let imagesForPreRecognition = document.querySelectorAll('.image.pre-recognition')
    let imagesInputForTarget = document.querySelectorAll('.image-input.target')
    let imagesInputForPreRecognition = document.querySelectorAll('.image-input.pre-recognition')
    const targetImage = document.querySelector('.target-image')
    const preRecognitionImage = document.querySelector('.pre-recognition-image')
    const startButton = document.querySelector('#compare')
    const compareBackButton = document.querySelector('.result-title button')
    const logOutButton = document.querySelector('.log-out')
    const detailComparisonButton = document.querySelector('.detail-comparison-title button')
    const detailComparisonNav = document.querySelectorAll('.detail-comparison-nav a')
    const thresholdSaveButton = document.querySelector('.threshold-save')
    const imageContainer = '<div class="image pre-recognition" style="animation: addContainer .5s forwards">\n' +
        '                    <i class="bi bi-plus"></i>\n' +
        '                    <img src="" alt="" class="preview-image" id="pre-recognition-image">\n' +
        '                    <input class="image-input pre-recognition" type="file" accept="image/png, image/jpeg, image/jpg, image/bmp" \n' +
        '                           style="display: none"/ multiple>\n' +
        '                </div>'
    const slider = document.querySelector('.slider-box')
    let thumb = slider.querySelector('.thumb');
    let rate = document.querySelector('.rate');
    let shiftX;
    const total = slider.offsetWidth - thumb.offsetWidth;
    function onThumbDown(event) {
        event.preventDefault(); // prevent selection start (browser action)
        shiftX = event.clientX - thumb.getBoundingClientRect().left;
        thumb.setPointerCapture(event.pointerId);
        thumb.style.transform = "scale(1)";
        thumb.onpointermove = onThumbMove;
        thumb.onpointerup = (event) => {
            thumb.onpointermove = null;
            thumb.onpointerup = null;
            thumb.style.transform = "scale(1.2)";
        };
    }
    function onThumbMove(event) {
        let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;
         // if the pointer is out of slider => adjust left to be within the boundaries
         if (newLeft < 0) {
            newLeft = 0;
         }
         let rightEdge = slider.offsetWidth - thumb.offsetWidth;
         if (newLeft > rightEdge) {
            newLeft = rightEdge;
         }
         thumb.style.left = newLeft + "px";
         setRate(newLeft);
    }
    function onThumbEnter(event) {
        thumb.style.transform = "scale(1.2)";
    }
    function onThumbLeave(event) {
        thumb.style.transform = "scale(1)";
    }
    function setRate(left) {
        // noinspection JSCheckFunctionSignatures
        rate.innerText = parseFloat(left / total).toFixed(2);
    }
    thumb.onpointerdown = onThumbDown;
    thumb.onpointerenter = onThumbEnter;
    thumb.onpointerleave = onThumbLeave;
    thumb.ondragstart = () => false;
    function deleteCookie(name) {
        document.cookie = name + '=; expires=' + new Date(0).toUTCString() + '; path=/';
    }
    function getCookieValue(cookieName) {
    // 初始清理cookie字符串，替换掉前后的空白字符
        let cookieArray = document.cookie.split('; ');
        // 遍历cookie数组
        for(let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            // 查找cookie名称，并截取等号后面的值
            let cookieNameEq = cookieName + '=';
            // 检查当前cookie是否是我们要找的cookie
            if (cookie.indexOf(cookieNameEq) === 0) {
                // 返回cookie的值，即等号后的部分
                return cookie.substring(cookieNameEq.length);
            }
        }
        // 如果没有找到cookie，则返回null或undefined
        return null;
    }
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active')
        hoverLike.classList.toggle('active')
    })
    detailLabelClick.addEventListener('click', () => {
        const checkbox = $('#cbx-12')[0]
        checkbox.checked = !checkbox.checked;
    })
    startButton.addEventListener('click', () => {
        allImagesUpload()
    })
    logOutButton.addEventListener('click', () => {
        deleteCookie('token')
        deleteCookie('imagesetID')
        location.reload()
    })
    settingsButton.addEventListener('click', () => {
        settingsButton.style.pointerEvents = 'none'
        $.ajax({
            url: '/threshold/',
            type: 'get',
            beforeSend: function(xhr, settings) {
                // 在请求头中添加csrf_token
                xhr.setRequestHeader("X-CSRFToken", getCookieValue('csrftoken'));
            },
            async: false,
            success: (data) => {
                let dataObj = eval("("+data+")")
                settingsButton.style.pointerEvents = 'initial'
                if (dataObj["threshold"] !== undefined && dataObj["threshold"] !== null) {
                    rate.innerHTML = dataObj["threshold"]
                    thumb.style.left = dataObj["threshold"] * 280 + 'px'
                }
                else {
                    const thresholdErrorShow = document.querySelector('.threshold-error')
                    thresholdErrorShow.style.zIndex = '999'
                    thresholdErrorShow.style.animation = 'showImageError .5s linear forwards'
                    setTimeout(() => {
                        thresholdErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                        setTimeout(() => {
                            thresholdErrorShow.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
            }
        })
    })
    thresholdSaveButton.addEventListener('click', () => {
        const rate = document.querySelector('.rate');
        $.ajax({
            url: '/threshold/',
            type: 'post',
            beforeSend: function(xhr, settings) {
                // 在请求头中添加csrf_token
                xhr.setRequestHeader("X-CSRFToken", getCookieValue('csrftoken'));
            },
            data: {
                'threshold': rate.innerHTML
            },
            async: false,
            success: (data) => {
                let dataObj = eval("("+data+")")
                if (dataObj["result"]) {
                    const thresholdSuccessShow = document.querySelector('.threshold-success')
                    thresholdSuccessShow.style.zIndex = '999'
                    thresholdSuccessShow.style.animation = 'showImageError .5s linear forwards'
                    setTimeout(() => {
                        thresholdSuccessShow.style.animation = 'packUpImageError .5s linear forwards'
                        setTimeout(() => {
                            thresholdSuccessShow.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
                else {
                    const thresholdErrorShow = document.querySelector('.threshold-error')
                    thresholdErrorShow.style.zIndex = '999'
                    thresholdErrorShow.style.animation = 'showImageError .5s linear forwards'
                    setTimeout(() => {
                        thresholdErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                        setTimeout(() => {
                            thresholdErrorShow.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
            }
        })
    })
    detailComparisonNav.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('active')) {
                const detailComparisonContent = document.querySelectorAll('#detail-comparison-content')
                detailComparisonContent.forEach((item) => {
                    if (item.classList.contains('active')) {
                        item.style.animation = 'packUpResult .25s forwards'
                        setTimeout(() => {
                            item.style.animation = ''
                            item.classList.remove('active')
                            item.querySelector('#comparison-title').classList.remove('active')
                            item.querySelector('#comparison-content').classList.remove('active')
                            item.querySelector('#comparison-image').classList.remove('active')
                            item.querySelector('#detail-target-image').classList.remove('active')
                            item.querySelector('#all-pre-recognition-image').classList.remove('active')
                            item.querySelectorAll('#detail-comparison-similarity').forEach((item) => {
                                item.classList.remove('active')
                            })
                            item.querySelectorAll('#pre-recognition-image').forEach((item) => {
                                item.classList.remove('active')
                            })
                        }, 250)
                    }
                })
                detailComparisonNav.forEach((item) => {
                    item.classList.remove('active')
                })
                item.classList.add('active')
                setTimeout(() => {
                    detailComparisonContent[index].style.animation = 'showResult .25s forwards'
                    detailComparisonContent[index].classList.add('active')
                    detailComparisonContent[index].querySelector('#comparison-title').classList.add('active')
                    detailComparisonContent[index].querySelector('#comparison-content').classList.add('active')
                    detailComparisonContent[index].querySelector('#comparison-image').classList.add('active')
                    detailComparisonContent[index].querySelector('#detail-target-image').classList.add('active')
                    detailComparisonContent[index].querySelector('#all-pre-recognition-image').classList.add('active')
                    detailComparisonContent[index].querySelectorAll('#detail-comparison-similarity').forEach((item) => {
                        item.classList.add('active')
                    })
                    detailComparisonContent[index].querySelectorAll('#pre-recognition-image').forEach((item) => {
                        item.classList.add('active')
                    })
                }, 250)
            }
        })
    })
    listItem.forEach((item, clickIndex) => {
        item.addEventListener('click', qualifiedName => {
            listItem.forEach((item, index) => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active')
                    hoverLike.style.setProperty('--start', index.toString())
                    hoverLike.style.setProperty('--end', clickIndex.toString())
                    hoverLike.style.animation = 'move .5s forwards'
                    setTimeout(() => {
                        hoverLike.style.marginTop = (clickIndex * 65).toString() + 'px'
                        hoverLike.style.animation = ''
                    }, 500)
                }
            })
            content.forEach((item, index) => {
                item.classList.remove('active')
                if (clickIndex === index) {
                    item.classList.add('active')
                }
            })
            if (clickIndex === 0) {
                submit.classList.add('active')
            }
            else {
                submit.classList.remove('active')
            }
            item.classList.add('active')
            sidebar.classList.remove('active')
            hoverLike.classList.remove('active')
            document.querySelector('.result').classList.remove('active')
            document.querySelector('.detail-comparison').classList.remove('active')
        })
    })
    content.forEach((item) => {
        item.addEventListener('scroll', () => {
            item.classList.add('scroll-setting')
            setTimeout(() => {
               item.classList.remove('scroll-setting')
            }, 1000)
        });
    })
    document.querySelector('.result').addEventListener('scroll', () => {
        document.querySelector('.result').classList.add('scroll-setting')
        setTimeout(() => {
           document.querySelector('.result').classList.remove('scroll-setting')
        }, 1000)
    })
    document.querySelector('.detail-comparison').addEventListener('scroll', () => {
        document.querySelector('.detail-comparison').classList.add('scroll-setting')
        setTimeout(() => {
           document.querySelector('.detail-comparison').classList.remove('scroll-setting')
        }, 1000)
    })
    compareBackButton.addEventListener('click', () => {
        if (compareBackButton.classList.contains('dashboard')) {
            document.querySelector('.result').classList.remove('active')
            document.querySelector('.detail-comparison').classList.remove('active')
            document.querySelector('.content.btn-space').classList.add('active')
            document.querySelector('.submit').classList.add('active')
            compareBackButton.classList.remove('dashboard')
        }
        else {
            document.querySelector('.result').classList.remove('active')
            document.querySelector('.detail-comparison').classList.remove('active')
            document.querySelector('.content.history').classList.add('active')
        }
    })
    detailComparisonButton.addEventListener('click', () => {
        document.querySelector('.detail-comparison').classList.remove('active')
        document.querySelector('.result').classList.add('active')
        document.querySelectorAll('.detail-comparison-nav a')[0].click()
    })
    const changeLineHeight = () => {
        const line = document.querySelector('.line')
        const activeContent = document.querySelector('.content.btn-space')
        line.style.height = ''
        line.style.removeProperty('--height')
        line.style.height = activeContent.scrollHeight + 'px'
        line.style.setProperty('--height', activeContent.scrollHeight + 'px')
    }
    changeLineHeight();
    window.addEventListener('resize', changeLineHeight)
    const setUpImagesForTarget = () => {
        imagesForTarget.forEach((item, index) => {
            item.addEventListener('click', () => {
                imagesInputForTarget[index].click()
            })
            item.addEventListener('dragover', (event) => {
                event.stopPropagation();
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                if (acceptFileType.indexOf(event.dataTransfer.items[0].type) !== -1) {
                    item.classList.remove('reject')
                    item.classList.add('dragover', 'accept')
                }
                else{
                    item.classList.remove('accept')
                    item.classList.add('dragover', 'reject')
                }
            })
            item.addEventListener('dragleave', (event) => {
                item.classList.remove('dragover', 'accept', 'reject');
            })
            item.addEventListener('drop', (event) => {
                event.stopPropagation();
                event.preventDefault();
                item.classList.remove('dragover', 'accept', 'reject');
                if (acceptFileType.indexOf(event.dataTransfer.items[0].type) !== -1) {
                    item.querySelector('i').classList.add('active')
                    const files = event.dataTransfer.files;
                    if (files.length > 0) {
                        itemOnChangeWithDrag(item, index, files[0]);
                    }
                }
                else {
                    const imageErrorShow = document.querySelector('.image-error')
                    imageErrorShow.style.zIndex = '999'
                    imageErrorShow.style.animation = 'showImageError .5s linear forwards'
                    setTimeout(() => {
                        imageErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                        setTimeout(() => {
                            imageErrorShow.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
            })
        })
    }
    setUpImagesForTarget();
    async function checkImageType(event, item) {
        return new Promise((resolve) => {
            for (let i = 0; i < event.dataTransfer.items.length; i++) {
                if (acceptFileType.indexOf(event.dataTransfer.items[i].type) === -1) {
                    item.classList.remove('accept')
                    item.classList.add('dragover', 'reject')
                    resolve(false)
                }
            }
            resolve(true)
        })
    }
    const setUpImagesForPreRecognition = () => {
        imagesForPreRecognition.forEach((item, index) => {
            item.addEventListener('click', () => {
                imagesInputForPreRecognition[index].click()
            })
            item.addEventListener('dragover', (event) => {
                event.stopPropagation();
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                checkImageType(event, item).then((result) => {
                    if (result) {
                        item.classList.remove('reject')
                        item.classList.add('dragover', 'accept')
                    }
                })
            })
            item.addEventListener('dragleave', (event) => {
                item.classList.remove('dragover', 'accept', 'reject');
            })
            item.addEventListener('drop', (event) => {
                event.stopPropagation();
                event.preventDefault();
                checkImageType(event, item).then((result) => {
                    item.classList.remove('dragover', 'accept', 'reject');
                    if (result) {
                        item.querySelector('i').classList.add('active')
                        const files = event.dataTransfer.files;
                        if (files.length > 0) {
                            if (item.querySelector('img').getAttribute('src') === '' || files.length > 1) {
                                itemsOnChangeWithDrag(item, index, files);
                            }
                            else {
                                const imageReader = new FileReader();
                                imageReader.readAsDataURL(files[0]); // 读取文件内容为base64编码
                                imageReader.onload = function(ImageEvent) {
                                    let base64 = ImageEvent.target.result
                                    // noinspection JSCheckFunctionSignatures
                                    item.querySelector('img').setAttribute('src', base64)
                                }
                            }
                        }
                    }
                    else {
                        const imageErrorShow = document.querySelector('.image-error')
                        imageErrorShow.style.zIndex = '999'
                        imageErrorShow.style.animation = 'showImageError .5s linear forwards'
                        setTimeout(() => {
                            imageErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                            setTimeout(() => {
                                imageErrorShow.style.zIndex = '-1'
                            }, 500)
                        }, 3000)
                    }
                })
            })
        })
    }
    setUpImagesForPreRecognition();
    async function addNewContainer() {
        return new Promise((resolve) => {
            preRecognitionImage.insertAdjacentHTML('beforeend', imageContainer)
            resolve(true)
        })
    }
    async function addNewFaceContainer(i, index) {
        return new Promise((resolve) => {
            const faceContainer = '<div class="image detected-face" style="animation: addContainer .5s forwards;">\n' +
            '                    <img src="" alt="" class="preview-image active" id="detected-face-image-' + i + '">\n' +
            '                    <div class="checkbox-wrapper-46">\n' +
            '                        <input type="checkbox" id="' + i + '" class="inp-cbx" />\n' +
            '                        <label for="'+ i + '" class="cbx">\n' +
            '                            <span>\n' +
            '                                <svg viewBox="0 0 12 10" height="10px" width="12px">\n' +
            '                                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>\n' +
            '                                </svg>\n' +
            '                            </span>\n' +
            '                        </label>\n' +
            '                    </div>\n' +
            '                </div>'
            const detectedFaceShow = document.querySelector('#detected-face-show-content-' + index)
            detectedFaceShow.insertAdjacentHTML('beforeend', faceContainer)
            resolve(true)
        })
    }
    function addNewFaceContainersListener(Face_Classification) {
        for (let i = 0; i < Face_Classification.length; i++) {
            const faceTitle = document.querySelector('#detected-face-show-title-' + i)
            const faceTitleCheckBox = faceTitle.querySelector('.detected-face-show-title-checkbox input')
            const faceContent = document.querySelector('#detected-face-show-content-' + i)
            const faceImage = faceContent.querySelectorAll('.image.detected-face')
            const faceContentCheckBox = faceContent.querySelectorAll('.image.detected-face .checkbox-wrapper-46 input')
            faceTitleCheckBox.addEventListener('change', () => {
                if (faceTitleCheckBox.checked) {
                    for (let j = 0; j < Face_Classification[i].length; j++) {
                        const checkbox = document.getElementById(Face_Classification[i][j])
                        checkbox.checked = true
                    }
                    for (let k = 0; k < Face_Classification.length; k++) {
                        const title = document.querySelector('#detected-face-show-title-' + k)
                        const checkbox = title.querySelector('.detected-face-show-title-checkbox input')
                        if (k !== i && checkbox.checked) {
                            checkbox.click()
                        }
                    }
                }
                else {
                    for (let j = 0; j < Face_Classification[i].length; j++) {
                        const checkbox = document.getElementById(Face_Classification[i][j])
                        checkbox.checked = false
                    }
                }
            })
            faceImage.forEach((item, index) => {
                item.addEventListener('click', () => {
                    faceContentCheckBox[index].click()
                    const faceContentCheckBoxParent = item.parentElement.id.split('-')
                    const classificationIndex = parseInt(faceContentCheckBoxParent[faceContentCheckBoxParent.length - 1])
                    for (let j = 0; j < Face_Classification.length; j++) {
                        if (j !== classificationIndex) {
                            document.querySelector('#detected-face-show-title-checkbox-' + j).checked = false
                            for (let k = 0; k < Face_Classification[j].length; k++) {
                                document.getElementById(Face_Classification[j][k]).checked = false
                            }
                        }
                    }
                })
            })
            faceContentCheckBox.forEach((item) => {
                item.addEventListener('change', () => {
                    const CheckBoxCheckedLength = Array.from(faceContentCheckBox).filter(function (checkbox) {
                        return checkbox.checked
                    }).length
                    faceTitleCheckBox.checked = CheckBoxCheckedLength > 1 || CheckBoxCheckedLength === Face_Classification[i].length;
                })
            })
        }
    }
    async function addNewFaceTitleContainer(i) {
        return new Promise((resolve) => {
            const faceTitleContainer = '<div class="detected-face-show-title" id="detected-face-show-title-' + i + '" style="animation: addContainer .5s forwards;">\n' +
                                    '                    <input class="detected-face-show-label-input" placeholder="Face Label" value="Untitled Face ' + (i + 1) + '">\n' +
                                    '                    <div class="detected-face-show-title-checkbox">\n' +
                                    '                        <input type="checkbox" class="ui-checkbox detected-face-title-checkbox" id="detected-face-show-title-checkbox-' + i + '">\n' +
                                    '                        <label style="cursor: pointer" for="detected-face-show-title-checkbox-' + i + '">Use Synthetic Face Vector</label>\n' +
                                    '                    </div>\n' +
                                    '                </div>\n' +
                                    '<div class="detected-face-show-content" id="detected-face-show-content-' + i + '"></div>'
            const detectedFaceShow = document.querySelector('.detected-face-show')
            detectedFaceShow.insertAdjacentHTML('beforeend', faceTitleContainer)
            resolve(true)
        })
    }
    function itemOnChangeWithoutDrag(item) {
        item.addEventListener('change', (event) => {
            let files = event.target.files
            if (files.length > 0) {
                const imageReader = new FileReader();
                imageReader.readAsDataURL(files[0]); // 读取文件内容为base64编码
                imageReader.onload = function(ImageEvent) {
                    let base64 = ImageEvent.target.result
                    const circle = document.querySelector('.target-image-box .detected-face-title .circle')
                    const detectFaceShow = document.querySelector('.target-image-box .detected-face-show')
                    document.querySelectorAll('.image.target i')[0].classList.add('active')
                    // noinspection JSCheckFunctionSignatures
                    document.querySelectorAll('.image.target img')[0].setAttribute('src', base64)
                    document.querySelectorAll('.image.target img')[0].classList.add('active')
                    document.querySelector('.target-image-box .detected-face-title').classList.add('active')
                    detectFaceShow.classList.add('active')
                    detectFaceShow.innerHTML = ''
                    circle.classList.add('active')
                    item.setAttribute('disabled', 'disabled')
                    targetImageUpload().then((res) => {
                        // noinspection JSCheckFunctionSignatures
                        let result = Object.values(res[0])
                        Face_Classification = res[1]
                        if (result.length === 0) {
                            detectFaceShow.innerHTML = 'No Face was detected!<br>Please make sure that the picture is bigger than 640*640!'
                        }
                        else {
                            const detectedFaceAttention = '<p style="width: 92.5%; margin-bottom: .5rem; text-align: center; font-size: .8rem; animation: addContainer .5s forwards;">\n' +
                                '                    Attention: You can choose only one face as target image!</p>'
                            detectFaceShow.insertAdjacentHTML('beforeend', detectedFaceAttention)
                            for (let i = 0; i < Face_Classification.length; i++) {
                                addNewFaceTitleContainer(i).then((res) => {
                                    for (let j = 0; j < Face_Classification[i].length; j++) {
                                        addNewFaceContainer(Face_Classification[i][j], i).then((res) => {
                                            const detectedFaces = document.querySelector('#detected-face-image-' + Face_Classification[i][j])
                                            // noinspection JSCheckFunctionSignatures
                                            detectedFaces.setAttribute('src', result[Face_Classification[i][j]])
                                            if (i === Face_Classification.length - 1 && j === Face_Classification[i].length - 1) {
                                                addNewFaceContainersListener(Face_Classification)
                                                changeLineHeight()
                                            }
                                        })
                                    }
                                })
                            }
                        }
                        circle.classList.remove('active')
                        item.removeAttribute('disabled')
                    })
                }
            }
        })
    }
    function itemsOnChangeWithoutDrag(item, index) {
        item.addEventListener('change', (event) => {
            let files = event.target.files
            if (files.length > 0) {
                if (document.querySelectorAll('.image.pre-recognition img')[index].getAttribute('src') === '' || files.length > 1) {
                    for (let i = 0; i < files.length; i++) {
                        let length = preRecognitionImage.children.length
                        addNewContainer().then((result) => {
                            imagesForPreRecognition = document.querySelectorAll('.image.pre-recognition')
                            imagesInputForPreRecognition = document.querySelectorAll('.image-input.pre-recognition')
                            addNewContainerListener(imagesForPreRecognition[length], length)
                            imagesInputForPreRecognition[length].addEventListener('click', () => {
                                itemsOnChangeWithoutDrag(imagesInputForPreRecognition[length], length);
                            })
                            addLastImageSrc(files[i], length - 1)
                        })
                    }
                    changeLineHeight()
                }
                else {
                    const imageReader = new FileReader();
                    imageReader.readAsDataURL(files[0]); // 读取文件内容为base64编码
                    imageReader.onload = function(ImageEvent) {
                        let base64 = ImageEvent.target.result
                        // noinspection JSCheckFunctionSignatures
                        document.querySelectorAll('.image.pre-recognition img')[index].setAttribute('src', base64)
                    }
                }
            }
        })
    }
    function itemOnChangeWithDrag(item, index, file) {
        const imageReader = new FileReader();
        imageReader.readAsDataURL(file); // 读取文件内容为base64编码
        imageReader.onload = function(ImageEvent) {
            let base64 = ImageEvent.target.result
            const previewImageForTarget = document.querySelectorAll('#target-image')
            const circle = document.querySelector('.target-image-box .detected-face-title .circle')
            // noinspection JSCheckFunctionSignatures
            previewImageForTarget[index].setAttribute('src', base64)
            previewImageForTarget[index].classList.add('active')
            const detectFaceShow = document.querySelector('.target-image-box .detected-face-show')
            document.querySelector('.target-image-box .detected-face-title').classList.add('active')
            detectFaceShow.classList.add('active')
            detectFaceShow.innerHTML = ''
            circle.classList.add('active')
            item.setAttribute('disabled', 'disabled')
            targetImageUpload().then((res) => {
                // noinspection JSCheckFunctionSignatures
                let result = Object.values(res[0])
                Face_Classification = res[1]
                if (result.length === 0) {
                    detectFaceShow.innerHTML = 'No Face was detected!<br>Please make sure that the picture is bigger than 640*640!'
                }
                else {
                    const detectedFaceAttention = '<p style="width: 92.5%; margin-bottom: .5rem; text-align: center; font-size: .8rem; animation: addContainer .5s forwards;">\n' +
                        '                    Attention: You can choose only one face as target image!</p>'
                    detectFaceShow.insertAdjacentHTML('beforeend', detectedFaceAttention)
                    for (let i = 0; i < Face_Classification.length; i++) {
                        addNewFaceTitleContainer(i).then((res) => {
                            for (let j = 0; j < Face_Classification[i].length; j++) {
                                addNewFaceContainer(Face_Classification[i][j], i).then((res) => {
                                    const detectedFaces = document.querySelector('#detected-face-image-' + Face_Classification[i][j])
                                    // noinspection JSCheckFunctionSignatures
                                    detectedFaces.setAttribute('src', result[Face_Classification[i][j]])
                                    if (i === Face_Classification.length - 1 && j === Face_Classification[i].length - 1) {
                                        addNewFaceContainersListener(Face_Classification)
                                        changeLineHeight()
                                    }
                                })
                            }
                        })
                    }
                }
                circle.classList.remove('active')
                item.removeAttribute('disabled')
            })
        }
    }
    function addNewContainerListener(item, index) {
        item.addEventListener('click', () => {
            imagesInputForPreRecognition[index].click()
        })
        item.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            checkImageType(event, item).then((result) => {
                if (result) {
                    item.classList.remove('reject')
                    item.classList.add('dragover', 'accept')
                }
            })
        })
        item.addEventListener('dragleave', (event) => {
            item.classList.remove('dragover', 'accept', 'reject');
        })
        item.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            checkImageType(event, item).then((result) => {
                item.classList.remove('dragover', 'accept', 'reject');
                if (result) {
                    item.querySelector('i').classList.add('active')
                    const files = event.dataTransfer.files;
                    if (files.length > 0) {
                        if (item.querySelector('img').getAttribute('src') === '' || files.length > 1) {
                            itemsOnChangeWithDrag(item, index, files);
                        }
                        else {
                            const imageReader = new FileReader();
                            imageReader.readAsDataURL(files[0]); // 读取文件内容为base64编码
                            imageReader.onload = function(ImageEvent) {
                                let base64 = ImageEvent.target.result
                                // noinspection JSCheckFunctionSignatures
                                item.querySelector('img').setAttribute('src', base64)
                            }
                        }
                    }
                }
                else {
                    const imageErrorShow = document.querySelector('.image-error')
                    imageErrorShow.style.zIndex = '999'
                    imageErrorShow.style.animation = 'showImageError .5s linear forwards'
                    setTimeout(() => {
                        imageErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                        setTimeout(() => {
                            imageErrorShow.style.zIndex = '-1'
                        }, 500)
                    }, 3000)
                }
            })
        })
    }
    function addLastImageSrc(file, index) {
        imagesForPreRecognition[index].querySelector('i').classList.add('active')
        const imageReader = new FileReader();
        imageReader.readAsDataURL(file); // 读取文件内容为base64编码
        imageReader.onload = function(ImageEvent) {
            let base64 = ImageEvent.target.result
            const previewImageForPreRecognition = document.querySelectorAll('#pre-recognition-image')
            // noinspection JSCheckFunctionSignatures
            previewImageForPreRecognition[index].setAttribute('src', base64)
            previewImageForPreRecognition[index].classList.add('active')
        }
    }
    function itemsOnChangeWithDrag(item, index, files) {
        for (let i = 0; i < files.length; i++) {
            let length = preRecognitionImage.children.length
            addNewContainer().then((result) => {
                imagesForPreRecognition = document.querySelectorAll('.image.pre-recognition')
                imagesInputForPreRecognition = document.querySelectorAll('.image-input.pre-recognition')
                addNewContainerListener(imagesForPreRecognition[length], length)
                addLastImageSrc(files[i], length - 1)
            })
        }
        changeLineHeight()
    }
    imagesInputForTarget.forEach((item) => {
        itemOnChangeWithoutDrag(item);
    })
    imagesInputForPreRecognition.forEach((item, index) => {
        itemsOnChangeWithoutDrag(item, index);
    })
    function randomString(length) {
        let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i)
            result += str[Math.floor(Math.random() * str.length)];
        return result;
    }
    async function encryptTargetImage(originKey, pub_key) {
        return new Promise((resolve) => {
            const aesKey = CryptoJS.enc.Utf8.parse(originKey)
            const targetImage = CryptoJS.enc.Utf8.parse(document.querySelector('.image.target img').getAttribute('src'))
            const encrypted_image = CryptoJS.AES.encrypt(targetImage, aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString()
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(pub_key)
            const encrypted_originKey = encryptor.encrypt(originKey)
            resolve({'encrypted_image': encrypted_image, 'encrypted_aesKey': encrypted_originKey})
        })
    }
    async function targetImageUpload() {
        return new Promise((resolve) => {
            const socket = new WebSocket('ws://' + window.location.host + '/ws/target/')
            socket.onmessage = (e) => {
                let {pub_key, result, Face_Classification} = JSON.parse(e.data)
                if (pub_key !== undefined) {
                    const originKey = randomString(32)
                    public_key = pub_key
                    encryptTargetImage(originKey, pub_key).then((encryptData) => {
                        socket.send(JSON.stringify(encryptData))
                    })
                }
                else if (result !== undefined && Face_Classification !== undefined) {
                    resolve([result, Face_Classification])
                }
            }
        })
    }
    function addImagesToContainer(src) {
        const container = document.querySelector('.container')
        const insideImage = `<img src='${src}' alt=''>`
        container.insertAdjacentHTML('beforeend', insideImage)
    }
    async function selectImageInfoForUpload(){
        return new Promise((resolve) => {
            let selectedFacesIndex = []
            const detectedFaceShowContents = document.querySelectorAll('.detected-face-show-content')
            detectedFaceShowContents.forEach((detectedFaceShowContent) => {
                const detectedFaceImages = detectedFaceShowContent.querySelectorAll('.image.detected-face')
                detectedFaceImages.forEach((detectedFaceImage) => {
                    const detectedFaceCheckBox = detectedFaceImage.querySelector('.checkbox-wrapper-46 input')
                    const detectedFaceImg = detectedFaceImage.querySelector('img')
                    if (detectedFaceCheckBox.checked) {
                        selectedFacesIndex.push(detectedFaceCheckBox.id)
                        addImagesToContainer(detectedFaceImg.getAttribute('src'))
                    }
                })
            })
            resolve(selectedFacesIndex)
        })
    }
    function addImagesToSlider(src) {
        const slider = document.querySelector('.slider')
        const imageItem = '<div class="item">\n' +
            `                <img src="${src}" alt="">\n` +
            '            </div>'
        slider.insertAdjacentHTML('beforeend', imageItem)
    }
    async function encryptAllImageForUpload(selectedFacesIndex, originKey, pub_key) {
        return new Promise((resolve) => {
            const preRecognitionImages = document.querySelectorAll('.image.pre-recognition img')
            const detailComparisonResult = document.querySelector('#cbx-12').checked
            const aesKey = CryptoJS.enc.Utf8.parse(originKey)
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(pub_key)
            const encrypted_originKey = encryptor.encrypt(originKey)
            let Images = []
            preRecognitionImages.forEach((item) => {
                let imageDetail = item.getAttribute('src')
                if (imageDetail !== '') {
                    addImagesToSlider(imageDetail)
                    imageDetail = CryptoJS.enc.Utf8.parse(imageDetail)
                    Images.push(CryptoJS.AES.encrypt(imageDetail, aesKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7}).toString())
                }
            })
            resolve({'FacesIndex': selectedFacesIndex, 'Pre-Recognition-Images': Images, 'detail_comparison': detailComparisonResult, 'encrypted_aesKey': encrypted_originKey})
        })
    }
    const similarFaceBoxContentList = ['<div class="similar-face-box" id="similar-face-box-0">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/first.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                    <button>For Detail Comparison</button>\n' +
    '                </div>', '<div class="similar-face-box" id="similar-face-box-1">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/second.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                    <button>For Detail Comparison</button>\n' +
    '                </div>', '<div class="similar-face-box" id="similar-face-box-2">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/third.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                    <button>For Detail Comparison</button>\n' +
    '                </div>']
    const similarFaceBoxContentWithoutButtonList = ['<div class="similar-face-box" id="similar-face-box-0">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/first.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                </div>', '<div class="similar-face-box" id="similar-face-box-1">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/second.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                </div>', '<div class="similar-face-box" id="similar-face-box-2">\n' +
    '                    <img class="similar-face-rank" src="/static/image/main/third.png" alt="">\n' +
    '                    <img class="similar-face-container" src="" alt="">\n' +
    '                    <img class="preview-image similar-face active" src="" alt="">\n' +
    '                    <p class="similarity-result"></p>\n' +
    '                </div>']
    const noTopFaceContent = '<div class="similar-face-column-box">\n' +
        '                    <img src="/static/image/main/empty.png" alt="">\n' +
        '                    <p class="empty-box-tag" style="font-size: 1.1rem">Sorry, no target faces have been detected.<br>If our calculations are wrong, you can lower the threshold in Settings to get better detection results, or you can send us the problem you meet in About Us.<br>Thank you!</p>\n' +
        '                </div>'
    const noSimilarOtherFaceContent = '<div class="similar-face-column-box">\n' +
        '                    <img src="/static/image/main/empty.png" alt="">\n' +
        '                    <p class="empty-box-tag">No faces to show.<br>Upload more pictures to show your style!</p>\n' +
        '                </div>'
    const noDifferentFaceContent = '<div class="different-face-box active">\n' +
        '                    <img src="/static/image/main/empty.png" alt="">\n' +
        '                    <p class="empty-box-tag">No other faces to show.<br>Upload more pictures to capture the beautiful moments of others!</p>\n' +
        '                </div>'
    async function addSimilarFaceBoxContent(i, similarImages) {
        return new Promise((resolve) => {
            const similarTopFaceContainer = document.querySelector('.similar-top-face-container')
            const faceDetailCheck = similarImages[0].includes(similarImages[0][3])
            if (faceDetailCheck) {
                similarTopFaceContainer.insertAdjacentHTML('beforeend', similarFaceBoxContentList[i])
            }
            else {
                similarTopFaceContainer.insertAdjacentHTML('beforeend', similarFaceBoxContentWithoutButtonList[i])
            }
            const allSimilarFaceBox = document.querySelectorAll('.similar-face-box')
            const lastSimilarFaceBox = allSimilarFaceBox[allSimilarFaceBox.length - 1]
            resolve(lastSimilarFaceBox)
        })
    }
    async function addSimilarOtherFaceContent(i, similarOtherFaceContainer, similarImages) {
        return new Promise((resolve) => {
            // noinspection JSCheckFunctionSignatures
            const similarOtherFaceContent = `<div class="similar-face-row-box" id="similar-face-box-${i}">\n` +
                `                    <h1>${i + 1}</h1>\n` +
                `                    <img class="similar-face-container" src="${similarImages[i][1]}" alt="">\n` +
                `                    <img class="preview-image similar-face active" src="${similarImages[i][0]}" alt="">\n` +
                `                    <p class="similarity-result">Similarity: ${parseInt(similarImages[i][2] * 100)}%</p>\n` +
                '                    <button>For Detail Comparison</button>\n' +
                '                </div>'
            // noinspection JSCheckFunctionSignatures
            const similarOtherFaceContentWithoutButton = `<div class="similar-face-row-box" id="similar-face-box-${i}">\n` +
                `                    <h1>${i + 1}</h1>\n` +
                `                    <img class="similar-face-container" src="${similarImages[i][1]}" alt="">\n` +
                `                    <img class="preview-image similar-face active" src="${similarImages[i][0]}" alt="">\n` +
                `                    <p class="similarity-result">Similarity: ${parseInt(similarImages[i][2] * 100)}%</p>\n` +
                '                </div>'
            const faceDetailCheck = similarImages[0].includes(similarImages[0][3])
            if (faceDetailCheck) {
                similarOtherFaceContainer.insertAdjacentHTML('beforeend', similarOtherFaceContent)
            }
            else {
                similarOtherFaceContainer.insertAdjacentHTML('beforeend', similarOtherFaceContentWithoutButton)
            }
            const similarFaceRowBox = document.querySelectorAll('.similar-face-row-box')
            resolve(similarFaceRowBox[similarFaceRowBox.length - 1])
        })
    }
    async function RenderingResultPage(similarImages, differentImages) {
        return new Promise((resolve) => {
            const originImages = document.querySelector('.container').innerHTML
            const targetFaceContainer = document.querySelector('.target-face-container')
            const similarOtherFaceContainer = document.querySelector('.similar-other-face-container')
            const differentFaceContainer = document.querySelector('.different-face-container')
            const topImagesLength = similarImages.length > 3 ? [3, true]: [similarImages.length, false]
            targetFaceContainer.innerHTML = originImages
            if (topImagesLength[0] > 0) {
                for (let i = 0; i < topImagesLength[0]; i++) {
                    addSimilarFaceBoxContent(i, similarImages).then((lastSimilarFaceBox) => {
                        const similarFaceContainer = lastSimilarFaceBox.querySelector('.similar-face-container')
                        const previewImage = lastSimilarFaceBox.querySelector('.preview-image.similar-face.active')
                        const similarityResult = lastSimilarFaceBox.querySelector('.similarity-result')
                        similarFaceContainer.setAttribute('src', similarImages[i][1])
                        previewImage.setAttribute('src', similarImages[i][0])
                        if (similarImages[0].includes(similarImages[0][3])) {
                            const forDetailButton = lastSimilarFaceBox.querySelector('button')
                            forDetailButton.addEventListener('click', () => {
                                RenderingDetailPage(i).then((res) => {
                                    document.querySelector('.result').classList.remove('active')
                                    document.querySelector('.detail-comparison').classList.add('active')
                                })
                            })
                        }
                        // noinspection JSCheckFunctionSignatures
                        similarityResult.innerHTML = 'Similarity: ' + parseInt(similarImages[i][2] * 100) + '%'
                    })
                }
            }
            else {
                const similarTopFaceContainer = document.querySelector('.similar-top-face-container')
                similarTopFaceContainer.insertAdjacentHTML('beforeend', noTopFaceContent)
            }
            if (topImagesLength[1]) {
                for (let i = 3; i < similarImages.length; i++) {
                    addSimilarOtherFaceContent(i, similarOtherFaceContainer, similarImages).then((lastSimilarOtherFaceBox) => {
                        if (similarImages[0].includes(similarImages[0][3])) {
                            const forDetailButton = lastSimilarOtherFaceBox.querySelector('button')
                            forDetailButton.addEventListener('click', () => {
                                RenderingDetailPage(i).then((res) => {
                                    document.querySelector('.result').classList.remove('active')
                                    document.querySelector('.detail-comparison').classList.add('active')
                                })
                            })
                        }
                    })
                }
            }
            else {
                similarOtherFaceContainer.insertAdjacentHTML('beforeend', noSimilarOtherFaceContent)
            }
            if (differentImages.length > 0) {
                for (let i = 0; i < differentImages.length; i++) {
                    // noinspection JSCheckFunctionSignatures
                    const differentFaceContent = '<div class="different-face-box">\n' +
                        `                    <img class="different-face-container-box" src="${differentImages[i][1]}" alt="">\n` +
                        `                    <img class="preview-image different-face active" src="${differentImages[i][0]}" alt="">\n` +
                        `                    <p class="similarity-result">Similarity: ${parseInt(differentImages[i][2] * 100)}%</p>\n` +
                        '                </div>'
                    differentFaceContainer.insertAdjacentHTML('beforeend', differentFaceContent)
                }
            }
            else {
                differentFaceContainer.insertAdjacentHTML('beforeend', noDifferentFaceContent)
            }
            resolve(true)
        })
    }
    function allImagesUpload() {
        startButton.setAttribute('disabled', 'disabled')
        const container = document.querySelector('.container')
        const slider = document.querySelector('.slider')
        container.innerHTML = ''
        detailComparisonInfo = []
        document.querySelector('.similar-top-face-container').innerHTML = ''
        document.querySelector('.similar-other-face-container').innerHTML = ''
        document.querySelector('.different-face-container').innerHTML = ''
        slider.innerHTML = "<h1>We're dealing with the image below.</h1>"
        processing_index = []
        selectImageInfoForUpload().then((result) => {
            if (result.length > 0) {
                const socket = new WebSocket('ws://' + window.location.host + '/ws/recognize/')
                startButton.innerHTML = 'Start&nbsp;<div class="circle active"></div>'
                socket.onmessage = (e) => {
                    let {pub_key, Process, Already, PreRecognition_Over_Threshold, PreRecognition_Under_Threshold} = JSON.parse(e.data)
                    if (pub_key !== undefined) {
                        const originKey = randomString(32)
                        public_key = pub_key
                        encryptAllImageForUpload(result, originKey, pub_key).then((encryptData) => {
                            if (encryptData['Pre-Recognition-Images'].length > 0) {
                                socket.send(JSON.stringify(encryptData))
                            }
                            else {
                                startButton.innerHTML = 'Start&nbsp;<i class="fa-solid fa-bolt"></i>'
                                const selectErrorShow = document.querySelector('.select-error')
                                selectErrorShow.style.zIndex = '999'
                                selectErrorShow.style.animation = 'showImageError .5s linear forwards'
                                setTimeout(() => {
                                    selectErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                                    setTimeout(() => {
                                        selectErrorShow.style.zIndex = '-1'
                                    }, 500)
                                }, 3000)
                                startButton.removeAttribute('disabled')
                                socket.close()
                            }
                        })
                    }
                    else if (Process === 'Started') {
                        const items = document.querySelectorAll('.slider .item')
                        const targetFaces = document.querySelectorAll('.target-face-show .container img')
                        const percent = document.querySelector('#percent')
                        const loading = document.querySelector('.loading h4')
                        let target = 0
                        let active = 0
                        function loadShow() {
                            let stt = 0
                            items[active].style.transform = 'none';
                            items[active].style.zIndex = '1';
                            items[active].style.filter = 'none';
                            items[active].style.opacity = '1';
                            for (let i = active + 1; i < items.length; i++) {
                                stt++;
                                items[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
                                items[i].style.zIndex = (-stt).toString();
                                items[i].style.filter = 'blur(5px)';
                                items[i].style.opacity = stt > 2 ? '0': '0.6';
                            }
                            stt = 0
                            for(let i = active - 1; i >= 0; i--) {
                                stt++;
                                items[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
                                items[i].style.zIndex = (-stt).toString();
                                items[i].style.filter = 'blur(5px)';
                                items[i].style.opacity = stt > 2 ? '0': '0.6';
                            }
                        }
                        loadShow();
                        let x = setInterval(() => {
                            active = Math.max(...processing_index) < 0 ? 0 : Math.max(...processing_index)
                            if (active >= items.length) {
                                // noinspection JSCheckFunctionSignatures
                                const percentage = `${parseInt(active / items.length * 100)}%`
                                percent.style.setProperty('--last', percentage)
                                loading.innerText = percentage
                                clearInterval(x)
                            }
                            else {
                                // noinspection JSCheckFunctionSignatures
                                const percentage = `${parseInt(active / items.length * 100)}%`
                                loadShow();
                                percent.style.setProperty('--last', percentage)
                                loading.innerText = percentage
                            }
                        }, 100)
                        function actionStarter() {
                            let x = setInterval(() => {
                                if (target >= targetFaces.length) {
                                    target = 0
                                    clearInterval(x)
                                    setTimeout(() => {
                                        if (document.querySelector('.loader').classList.contains('active')) {
                                            actionStarter()
                                        }
                                    }, 2000)
                                }
                                else {
                                    targetFaces[target].style.animation = 'faceUp .28s forwards'
                                    setTimeout(() => {
                                        targetFaces[target].style.animation = ''
                                        target = target + 1
                                    }, 280)
                                }
                            }, 300)
                        }
                        actionStarter();
                        const currentPage = document.querySelector('.content.btn-space')
                        const submitFooter = document.querySelector('.submit')
                        const loaderPage = document.querySelector('.loader')
                        currentPage.classList.remove('active')
                        submitFooter.classList.remove('active')
                        startButton.innerHTML = 'Start&nbsp;<i class="fa-solid fa-bolt"></i>'
                        loaderPage.classList.add('active')
                        audio.play()
                    }
                    else if (Already !== undefined) {
                        processing_index.push(parseInt(Already))
                    }
                    else if (PreRecognition_Over_Threshold !== undefined) {
                        const loaderPage = document.querySelector('.loader')
                        const resultPage = document.querySelector('.result')
                        if (document.querySelector('#cbx-12').checked) {
                            for (let i = 0; i < PreRecognition_Over_Threshold.length; i++) {
                                detailComparisonInfo.push([PreRecognition_Over_Threshold[i][3]])
                            }
                        }
                        loaderPage.querySelector('.slider h1').innerText = 'Ready To Complete...'
                        RenderingResultPage(PreRecognition_Over_Threshold, PreRecognition_Under_Threshold).then((res) => {
                            setTimeout(() => {
                                loaderPage.classList.remove('active')
                                resultPage.classList.add('active')
                                compareBackButton.classList.add('dashboard')
                                startButton.removeAttribute('disabled')
                                audio.pause()
                            }, 1000)
                        })
                    }
                }
            }
            else {
                const selectErrorShow = document.querySelector('.select-error')
                selectErrorShow.style.zIndex = '999'
                selectErrorShow.style.animation = 'showImageError .5s linear forwards'
                setTimeout(() => {
                    selectErrorShow.style.animation = 'packUpImageError .5s linear forwards'
                    setTimeout(() => {
                        selectErrorShow.style.zIndex = '-1'
                    }, 500)
                }, 3000)
                startButton.removeAttribute('disabled')
            }
        })
    }
    async function RenderingDetailPage(i) {
        return new Promise((resolve) => {
            const detailTargetImages = document.querySelectorAll('#detail-target-image img')
            const allPreRecognitionImage = document.querySelectorAll('#all-pre-recognition-image')
            const browPreRecognitionImages = document.querySelector('.brow-pre-recognition-images')
            const nosePreRecognitionImages = document.querySelector('.nose-pre-recognition-images')
            const eyePreRecognitionImages = document.querySelector('.eye-pre-recognition-images')
            const lipPreRecognitionImages = document.querySelector('.lip-pre-recognition-images')
            detailTargetImages.forEach((item, index) => {
                item.setAttribute('src', detailComparisonInfo[i][0][0][index + 8])
            })
            allPreRecognitionImage.forEach((item) => {
                item.innerHTML = ''
            })
            for (let j = 0; j < detailComparisonInfo[i][0].length; j++) {
                // noinspection JSCheckFunctionSignatures
                const browPreRecognitionImageContent = '<div class="brow-pre-recognition-image active" id="pre-recognition-image">\n' +
                    `                                <img class="comparison-image" src="${detailComparisonInfo[i][0][j][4]}" alt="">\n` +
                    `                                <p class="detail-comparison-similarity active" id="eyebrow-similarity-${j}">Eyebrow Similarity: ${parseInt(detailComparisonInfo[i][0][j][0] * 100)}%</p>\n` +
                    '                            </div>'
                // noinspection JSCheckFunctionSignatures
                const nosePreRecognitionImageContent = '<div class="nose-pre-recognition-image" id="pre-recognition-image">\n' +
                    `                                <img class="comparison-image" src="${detailComparisonInfo[i][0][j][5]}" alt="">\n` +
                    `                                <p class="detail-comparison-similarity" id="nose-similarity-${j}">Nose Similarity: ${parseInt(detailComparisonInfo[i][0][j][1] * 100)}%</p>\n` +
                    '                            </div>'
                // noinspection JSCheckFunctionSignatures
                const eyePreRecognitionImageContent = '<div class="eye-pre-recognition-image" id="pre-recognition-image">\n' +
                    `                                <img class="comparison-image" src="${detailComparisonInfo[i][0][j][6]}" alt="">\n` +
                    `                                <p class="detail-comparison-similarity" id="eye-similarity-${j}">Eye Similarity: ${parseInt(detailComparisonInfo[i][0][j][2] * 100)}%</p>\n` +
                    '                            </div>'
                // noinspection JSCheckFunctionSignatures
                const lipPreRecognitionImageContent = '<div class="lip-pre-recognition-image" id="pre-recognition-image">\n' +
                    `                                <img class="comparison-image" src="${detailComparisonInfo[i][0][j][7]}" alt="">\n` +
                    `                                <p class="detail-comparison-similarity" id="lip-similarity-${j}">Lip Similarity: ${parseInt(detailComparisonInfo[i][0][j][3] * 100)}%</p>\n` +
                    '                            </div>'
                browPreRecognitionImages.insertAdjacentHTML('beforeend', browPreRecognitionImageContent)
                nosePreRecognitionImages.insertAdjacentHTML('beforeend', nosePreRecognitionImageContent)
                eyePreRecognitionImages.insertAdjacentHTML('beforeend', eyePreRecognitionImageContent)
                lipPreRecognitionImages.insertAdjacentHTML('beforeend', lipPreRecognitionImageContent)
            }
            resolve(true)
        })
    }
    async function getDetectedFace() {
        let response = await fetch('faces/', {
            method: 'GET',
            credentials: 'include', // 确保携带cookies
            headers: {
                'X-CSRFToken': getCookieValue('csrftoken')
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let dataObj = await response.json();
        return dataObj['All_Faces'];
    }
    async function addNewDetectedFaceContainer(i, srcList) {
        return new Promise((resolve) => {
            const detectedFaceContainer = '<div class="detected-face-box">\n' +
                `                <h1>${i + 1}</h1>\n` +
                '                <div class="detected-face-container">\n' +
                `                    <img class="detected-face-image" src="${srcList[0]}" alt="">\n` +
                '                </div>\n' +
                '                <div class="included-images">\n' +
                '                    <h3>Included In: </h3>\n' +
                '                </div>\n' +
                '            </div>'
            const detectedFacesContent = document.querySelector('.detected-faces-content')
            detectedFacesContent.insertAdjacentHTML('beforeend', detectedFaceContainer)
            const detectedFace = document.querySelectorAll('.detected-face-box')
            resolve(detectedFace[detectedFace.length - 1])
        })
    }
    detectedFacesButton.addEventListener('click', () => {
        try {
            document.querySelector('.detected-faces-content').innerHTML = ''
            detectedFacesButton.style.pointerEvents = 'none'
            const circle = document.querySelector('.detected-faces .content-title .circle')
            circle.classList.add('active')
            getDetectedFace().then((result) => {
                detectedFacesButton.style.pointerEvents = 'initial'
                circle.classList.remove('active')
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        addNewDetectedFaceContainer(i, result[i]).then((detectedFace) => {
                            const includedImages = detectedFace.querySelector('.included-images')
                            for (let j = 0; j < result[i][1].length; j++) {
                                const image = `<img class="preview-image active" src="${result[i][1][j]}" alt="">`
                                includedImages.insertAdjacentHTML('beforeend', image)
                            }
                        })
                    }
                }
                else {
                    const detectedFacesContent = document.querySelector('.detected-faces-content')
                    detectedFacesContent.insertAdjacentHTML('beforeend', noSimilarOtherFaceContent)
                }
            })
        } catch (error) {
            console.error('Error:', error);
        }
    })
    async function getHistory() {
        let response = await fetch('history/', {
            method: 'GET',
            credentials: 'include', // 确保携带cookies
            headers: {
                'X-CSRFToken': getCookieValue('csrftoken')
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let dataObj = await response.json();
        return dataObj['All_History'];
    }
    async function addNewHistoryBoxContainer(i, result) {
        return new Promise((resolve) => {
            const historyBoxContent = `<div class="history-content" id="history-content-${i}">\n` +
                '                <div class="history-info">\n' +
                `                    <div class="year"><i class="bx bxs-calendar"></i>${result[4]}</div>\n` +
                '                    <div class="history-detail">\n' +
                '                        <div class="target-face-history">\n' +
                '                            <h2>Target Image</h2>\n' +
                `                            <img class="history-image" src="${result[0]}" alt="">\n` +
                '                        </div>\n' +
                '                        <div class="pre-recognition-history">\n' +
                '                            <h2>Pre-recognition Image</h2>\n' +
                '                            <div class="pre-recognition-history-container"></div>\n' +
                '                        </div>\n' +
                '                    </div>\n' +
                '                    <button>Show Final Result&nbsp;&nbsp;<i class="bi bi-arrow-up-right-circle-fill"></i></button>\n' +
                '                </div>\n' +
                '            </div>'
            const historyBox = document.querySelector('.history-box')
            historyBox.insertAdjacentHTML('beforeend', historyBoxContent)
            const historyContent = document.querySelectorAll('.history-content')
            resolve(historyContent[historyContent.length - 1])
        })
    }
    async function deleteNewTargetFacesInHistory() {
        return new Promise((resolve) => {
            const targetFaceContainer = document.querySelector('.target-face-container')
            targetFaceContainer.innerHTML = ''
            resolve(targetFaceContainer)
        })
    }
    historyButton.addEventListener('click', () => {
        try {
            document.querySelector('.history-box').innerHTML = ''
            historyButton.style.pointerEvents = 'none'
            const circle = document.querySelector('.history .history-title .circle')
            circle.classList.add('active')
            getHistory().then((result) => {
                circle.classList.remove('active')
                historyButton.style.pointerEvents = 'initial'
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        addNewHistoryBoxContainer(i, result[i]).then((historyContent) => {
                            let showImages = []
                            const preRecognitionHistoryContainer = historyContent.querySelector('.pre-recognition-history-container')
                            const button = historyContent.querySelector('button')
                            if (result[i][2].length <= 5) {
                                for (let j = 0; j < result[i][2].length; j++) {
                                    if (!showImages.includes(result[i][2][j][0])){
                                        const image = `<img class="history-image" src="${result[i][2][j][0]}" alt="">`
                                        preRecognitionHistoryContainer.insertAdjacentHTML('beforeend', image)
                                        showImages.push(result[i][2][j][0])
                                    }
                                }
                                for (let j = 0; j < 5 - result[i][2].length; j++) {
                                    if (!showImages.includes(result[i][3][j][0])){
                                        const image = `<img class="history-image" src="${result[i][3][j][0]}" alt="">`
                                        preRecognitionHistoryContainer.insertAdjacentHTML('beforeend', image)
                                        showImages.push(result[i][3][j][0])
                                    }
                                }
                            }
                            else {
                                let j = 0
                                while (showImages.length < 5) {
                                    if (!showImages.includes(result[i][2][j][0])){
                                        const image = `<img class="history-image" src="${result[i][2][j][0]}" alt="">`
                                        preRecognitionHistoryContainer.insertAdjacentHTML('beforeend', image)
                                        showImages.push(result[i][2][j][0])
                                    }
                                    j++;
                                }
                            }
                            button.addEventListener('click', () => {
                                document.querySelector('.similar-top-face-container').innerHTML = ''
                                document.querySelector('.similar-other-face-container').innerHTML = ''
                                document.querySelector('.different-face-container').innerHTML = ''
                                detailComparisonInfo = []
                                if (result[i][2][0].includes(result[i][2][0][3])) {
                                    for (let j = 0; j < result[i][2].length; j++) {
                                        detailComparisonInfo.push([result[i][2][j][3]])
                                    }
                                }
                                RenderingResultPage(result[i][2], result[i][3]).then((res) => {
                                    deleteNewTargetFacesInHistory().then((targetFaceContainer) => {
                                        for (let j = 0; j < result[i][1].length; j++) {
                                            const insideImage = `<img src='${result[i][1][j]}' alt=''>`
                                            targetFaceContainer.insertAdjacentHTML('beforeend', insideImage)
                                        }
                                        const history = document.querySelector('.history')
                                        const resultPage = document.querySelector('.result')
                                        history.classList.remove('active')
                                        resultPage.classList.add('active')
                                    })
                                })
                            })
                        })
                    }
                }
                else {
                    const historyBox = document.querySelector('.history-box')
                    historyBox.insertAdjacentHTML('beforeend', noSimilarOtherFaceContent)
                }
            })
        } catch (error) {
            console.error('Error:', error);
        }
    })
}