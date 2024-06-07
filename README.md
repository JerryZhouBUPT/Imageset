# **1、系统概述**
**1.1、系统简介**

Imageset是一个基于云的人脸识别服务平台，旨在为用户提供一个易于使用的界面来集成和使用先进的人脸识别技术。该系统应用于人物查找、相册整理。

背景：

1. 随着人工智能和计算机视觉技术的发展，人脸识别技术已经成为一种广泛应用的技术，被应用于安全验证、人脸检测、人脸识别等领域。在个人照片管理方面，人脸识别技术可以用于自动识别人脸，进行人脸比对，提供更好的用户体验和便利性。
1. 用户在个人照片管理方面的需求和痛点，例如手动比对照片困难、浏览照片效率低下等问题。

   **1.2、术语表**  

   定义系统或产品中涉及的重要术语，为读者在阅读文档时提供必要的参考信息。

|&emsp;**序号**|&emsp;**术语或缩略语**|&emsp;**说明性定义**|
| :- | :- | :- |
|&emsp;1|&emsp;PM|&emsp;Project Manager,项目经理|
|&emsp;2|&emsp;|&emsp;|
|&emsp;|&emsp;|&emsp;|

   **1.3、系统运行环境** 

   包括对硬件平台、操作系统、数据库系统、编程平台、网络协议等的描述。  

   服务器：

   操作系统：Linux CentOS

   数据库系统：使用关系型数据库MySQL，用于存储结构化数据，如用户信息和识别记录。

   非关系型数据库：如MongoDB或Redis，适合存储非结构化数据，如人脸特征向量。

   Web服务器：Nginx,于处理HTTP请求和提供Web服务。

   后端框架：Django（Python）用于构建后端逻辑。

   前端技术：JQuery用于构建用户界面。

   网络协议：HTTP/HTTPS：用于客户端和服务器之间的超文本传输。

   TCP/IP：互联网通信的基础协议套件。

   WebSocket：提供全双工通信渠道，适用于需要实时数据传输的应用。

   安全协议：SSL：用于在网络通信过程中对数据进行加密。

   OAuth：开放授权标准，用于用户身份验证。

   PyCharm：专为Python开发的IDE，提供智能代码补全和其他高级编程功能。

   **1.4、开发环境** 

   列举进行系统分析、程序设计和程序开发时要使用的工程工具和开发语言。应描述每一工具软件的名称、版本等。

   环境：python 3.9

   编程语言：Python，HTML5，CSS，JavaScript

   框架：Django

   开发工具：PyCharm：专为Python开发的IDE

   `          `MySQL 8.0

   特殊要求: 

   Numpy==1.22.4（需要Numpy.Object支持）

   channels==4.1.0，daphne==4.1.0（需要WebSocket通信支持）

   onnx==1.16.0，onnxruntime==1.17.3（需要预训练模型加载支持）

   Django时区设置：标准UTC时间

   数据库：TencentDB MySQL 5.7

   Session设置：

   会话在浏览器关闭时过期

   会话cookie有效期设置为10分钟
   # <a name="_toc266115742"></a>**2、数据结构说明**
   本章说明本程序系统中使用的全局数据常量、变量和数据结构。

   <a name="_toc266115743"></a>2.1、常量

   <a name="_toc213555692"></a><a name="_toc140045430"></a>包括数据文件名称及其所在目录，功能说明，具体常量说明等。

   <a name="_toc266115744"></a>2.2、变量

   本章说明本程序系统中使用的全局数据常量、变量和数据结构。

   <a name="_toc266115745"></a>2.3、数据结构

   <a name="_toc140045432"></a><a name="_toc213555694"></a>包括数据结构名称，功能说明，具体数据结构说明（定义、注释、取值）等。
   # **3、模块设计**  
   **3.1、软件结构**  

   **3.2、功能设计说明** 

   用户界面 高内聚地处理与用户交互相关的所有功能。

   业务逻辑层与 数据访问层之间通过接口松耦合，允许独立的开发和测试。

   数据库系统作为一个独立的组件，通过数据访问层与业务逻辑层交互，进一步降低耦合度。

   通过这些设计思想和理念，我们可以创建一个灵活、可维护、可扩展且易于测试的软件系统。

   **3.3、注册模块**

   3\.3.1、设计图

   3\.3.2、功能描述

   用户注册JerryChat账号，并设置登录密码。

   3\.3.3、输入数据

   `	`1. New Account Name：用户新注册的账号名称；有效性检验规则：不能与已注册的账号重名；需要使用数据表：app01\_image\_users\_info，通过post请求校验当前新注册的账号名称。

   `	`2. Email：用户注册使用的邮箱；有效性检验规则：符合邮箱命名规则。

   `	`3. Password：用户设置的登录密码；有效性检验规则：符合中等/强密码通用规则（大小写+数字/其他符号）。

   `	`4. Recheck your password：用户重新检验密码；有效性检验规则：必须与上述设置的密码相同。

   `	`5. Agreement: 用户隐私协议；有效性检验规则：用户必须勾选同意隐私协议。

   3\.3.4、输出数据

   跳转至Verify your email界面。

   3\.3.5、数据设计

   数据结构名称：

1. Id：编号
1. Account\_sha256：使用sha256哈希算法加密的账号名称
1. Password\_sha256：使用sha256哈希算法加密的密码
1. Email：用户注册时提供的邮箱
1. SignUp\_timestamp：注册时的UTC时间戳
1. Pri\_key：用户登录时服务器RSA算法随机生成的私钥
1. Pub\_key：用户登录时服务器RSA算法随机生成的公钥
1. Sign\_in\_expire\_time：用户登录的过期UTC时间
1. Threshold：用户设置的人脸识别阈值，默认为0.45。

1. Id：编号
1. Account：未加密的账号名称
1. Email：用户注册时提供的邮箱
1. Verify\_number：随机生成的6位数字邮箱验证码
1. expire\_time：邮箱验证码的过期UTC时间
1. Pri\_key：用户登录时服务器RSA算法随机生成的私钥
1. Pub\_key：用户登录时服务器RSA算法随机生成的公钥

3\.3.6、算法和流程

`	`用户发起websocket请求：ws://{window.location.host}/register。首先会校验用户登录状态，检查用户请求时携带的cookies中的token和imagesetID，然后校验通过后，再与服务器建立安全TCP连接。接下来，使用Crypto.PublicKey.RSA模块生成随机RSA的公钥和私钥，并将公钥发送给用户，且在此session下，将公钥和私钥存储session\_data。接下来，用户收到公钥后，将自动生成16位字符串作为AES的密钥，并将所有数据用AES的密钥加密后，带上使用公钥加密的AES密钥一起打包发送给服务器，服务器首先将会使用私钥解密AES密钥，再使用AES密钥解密得到用户原始数据。然后，服务器将生成6位数字邮箱验证码，并向用户所提供的邮箱发送邮箱验证邮件，若邮件发送成功，则将数据录入数据库app01\_image\_register\_users\_info中，并反馈给前端{'result': 'Waiting For Registration'}，否则反馈给前端{'result': 'Email Failure'}。

3\.3.7、函数说明

`	`实现文件：register.py

类：RegisterConsumer

函数：

1. SHA256\_Encrypt(plaintext: str) -> str

   **功能**：对输入的字符串进行SHA-256哈希加密。

   **格式**：

   def SHA256\_Encrypt(plaintext: str) -> str:

   `    `*# 函数体*

   **参数**：

- plaintext (str): 需要加密的原始文本字符串。

**全局变量**：此函数不使用全局变量。

**局部变量**：

- 此函数内部不显式定义局部变量，但hashlib.sha256()函数会创建一个SHA-256哈希对象。

**返回值**：返回一个字符串，表示原始文本的SHA-256哈希值。

**算法说明**：

- SHA-256是SHA-2（安全哈希算法第二版）的一部分，是一种加密哈希函数，可以产生一个256位（32字节）的哈希值。
- 该函数首先将输入的字符串plaintext编码为UTF-8格式的字节串。
- 然后使用hashlib库中的sha256函数创建一个SHA-256哈希对象，并使用update()方法更新哈希对象的状态。
- 最后，调用hexdigest()方法将哈希对象转换成十六进制的字符串表示形式。

**使用约束**：

- 输入必须是字符串类型。
- 输出的哈希值是固定的，对于相同的输入总是产生相同的输出。
- SHA-256哈希函数是单向的，即不能从哈希值反推出原始输入。
- 由于SHA-256是确定性的，它通常用于验证数据的完整性和安全性，但不适合用作需要保密性的加密算法。
1. generate\_verification\_code(length=6)

**功能**：生成一个随机的数字验证码。

**格式**：

def generate\_verification\_code(length=6):

`    `*# 函数体*

**参数**：

- length (int): 可选参数，验证码的长度，默认值为6。

**全局变量**：

- string.digits：这是一个全局变量，包含所有数字字符（'0', '1', '2', ..., '9'）。

**局部变量**：

- characters：局部变量，存储数字字符集。
- code：局部变量，存储生成的验证码字符串。

**返回值**：返回一个字符串，表示生成的随机验证码。

**算法说明**：

- 使用string.digits获取一个包含所有数字字符的字符串。
- 使用random.choices()方法从characters中随机选择length个字符。
- random.choices()方法允许字符被重复选择，因此同一个字符可能会在验证码中出现多次。
- 使用''.join()将选择的字符列表连接成一个字符串。

**使用约束**：

- length参数必须是一个正整数，表示验证码的长度。
- 由于使用了random模块，确保在调用此函数之前已经导入了random和string模块。
- 此函数生成的验证码是随机的，但不是加密安全的。如果需要用于安全敏感的应用，应考虑使用更安全的随机数生成器。
1. Check\_Account\_Exists(account: str) -> bool

**功能**：检查指定账户名是否已存在于数据库中。

**格式**：

def Check\_Account\_Exists(account: str) -> bool:

`    `*# 函数体*

**参数**：

- account (str): 需要检查的账户名。

**全局变量**：

- Image\_Users\_Info 和 Image\_Register\_Users\_Info：用于访问和查询用户信息。它们是在函数外部定义的。

**返回值**：返回一个布尔值。

- 如果账户存在，则返回False。
- 如果账户不存在，则返回True。

**算法说明**：

1. 使用SHA256\_Encrypt函数对传入的账户名account进行SHA-256加密。
1. 查询Image\_Users\_Info表，检查是否存在一个条目，其account\_sha256字段与加密后的账户名相匹配。
1. 同时查询Image\_Register\_Users\_Info表，检查是否存在一个条目，其account字段与原始账户名相匹配。
1. 如果在任一表中找到匹配项，则认为账户已存在，返回False。
1. 如果在两个表中都没有找到匹配项，则认为账户不存在，返回True。

**使用约束**：

- 此函数依赖于外部定义的数据库模型Image\_Users\_Info和Image\_Register\_Users\_Info。
- SHA256\_Encrypt函数需要被定义，并且能够正确执行账户名的SHA-256加密。
1. Send\_Email\_Verify\_Number(account: str, target\_email: str, verification\_code: str) -> bool

**功能**：发送电子邮件验证代码。

**格式**：

def Send\_Email\_Verify\_Number(account: str, target\_email: str, verification\_code: str) -> bool:

`    `*# 函数体*

**参数**：

- account (str): 用户账户名。
- target\_email (str): 接收验证邮件的电子邮件地址。
- verification\_code (str): 需要发送的验证代码。

**全局变量**：

- 此函数不显式定义全局变量，但使用了几个在函数外部定义的配置参数（如mail\_host、mail\_sender和mail\_license）。

**局部变量**：

- mail: 用于构建MIME邮件的MIMEMultipart对象。
- body: HTML格式的邮件正文字符串。
- message\_text: MIMEText对象，包含邮件正文。
- stp: smtplib.SMTP对象，用于连接SMTP服务器。

**返回值**：返回一个布尔值。

- 如果邮件发送成功，返回True。
- 如果邮件发送失败，返回False。

**算法说明**：

1. 设置SMTP服务器地址、发件人邮箱和邮箱授权码。
1. 创建一个MIMEMultipart对象来构建多部分邮件。
1. 设置邮件的发件人、收件人和主题。
1. 构建HTML格式的邮件正文，包含用户账户名、目标电子邮件地址和验证代码。
1. 创建一个MIMEText对象，将HTML正文附加到邮件对象。
1. 使用smtplib.SMTP连接SMTP服务器，登录并发送邮件。
1. 如果邮件发送成功，返回True；如果发送过程中发生异常，捕获异常并返回False。

**使用约束**：

- 需要正确配置SMTP服务器地址、发件人邮箱和邮箱授权码。
- 需要安装email和smtplib模块（通常Python标准库中已包含）。
- 异常处理仅返回False，并没有提供详细的错误信息。

3\.3.8 全局数据结构与该模块的关系

数据库：

from app01.models import Image\_Users\_Info, Image\_Register\_Users\_Info

**3.4、邮箱验证模块** 

3\.4.1、设计图

3\.4.2、功能描述

用户在界面上输入邮箱并请求发送验证码，用于确保注册、重置密码、账户安全等操作的安全性。

3\.4.3、输入数据

`	`1. Email Verify Number：用户收到邮件后，在界面上输入6位数字验证码。需要使用数据表：app01\_image\_register\_users\_info，通过post请求校验邮箱验证码。

3\.4.4、输出数据

若邮箱验证码正确，则跳转到登录页面；若错误，则在本页面显示错误信息。

3\.4.5、数据设计

1. Id：编号
1. Account：未加密的账号名称
1. Email：用户注册时提供的邮箱
1. Verify\_number：随机生成的6位数字邮箱验证码
1. expire\_time：邮箱验证码的过期UTC时间
1. Pri\_key：用户登录时服务器RSA算法随机生成的私钥
1. Pub\_key：用户登录时服务器RSA算法随机生成的公钥

3\.4.6、算法和流程

`	`用户发起post请求：http://{window.location.host}/verify，必须携带X-CSRFToken，用户邮箱验证码将由用户在注册时服务器所派发的RSA的公钥加密，并在post请求时携带被加密的邮箱验证码，用户注册时所设置的密码和服务器派发的RSA公钥，用于验证请求的合法性。服务器在接收到用户请求后，首先验证用户所提交的公钥是否合法，然后再使用从数据库中获取的RSA私钥解密用户所发送的邮箱验证码和设置的密码。若邮箱验证码正确，则将用户在数据库app01\_image\_register\_users\_info中的数据转移到app01\_image\_users\_info的数据库中，并删除用户在app01\_image\_register\_users\_info的数据，实现成功注册，且反馈给前端{'result': True}；若邮箱验证码错误，则反馈给前端{'result': False}。

3\.4.7、函数说明

`	`实现文件：view.py

函数：

1\. verifyEmail(request)

**功能**：验证用户提交的加密邮箱验证码和密码，如果验证成功，则创建用户记录并删除临时注册信息。

**格式**：

def verifyEmail(request):

`    `*# 函数体*

**参数**：

- request: 一个请求对象，包含了用户通过HTTP请求发送的所有信息。

**全局变量**：

- 此函数不显式定义全局变量，依赖于外部定义的模型Image\_Register\_Users\_Info和Image\_Users\_Info，以及一些加密和解密函数。

**局部变量**：

- token, imagesetID, sessionToken: 从请求的cookies中获取的值。
- encrypted\_code, encrypted\_password, public\_key: 从POST请求中获取的加密验证码、加密密码和公钥。
- detail: 用于存储数据库查询结果的变量。

**返回值**：

- 如果验证成功并成功创建用户记录，返回一个包含{'result': True}的JSON响应。
- 如果验证失败，返回一个包含{'result': False}的JSON响应。
- 如果请求不是POST请求，重定向到根路径'/'。

**算法说明**：

1. 检查请求方法是否为POST。
1. 从请求的cookies和POST数据中获取必要的信息。
1. 检查是否提供了加密验证码和公钥，且没有提供token、imagesetID或sessionToken（这可能意味着用户未登录或未选择图像集）。
1. 使用公钥在数据库中查找匹配的注册用户信息。
1. 如果找到了用户信息，使用私钥解密验证码，并与数据库中存储的验证码进行比较。
1. 如果验证码匹配，创建一个新的用户记录，删除临时注册信息，并返回成功的响应。
1. 如果验证码不匹配或没有找到用户信息，返回失败的响应。

**使用约束**：

- 函数依赖于Django框架的request对象和HttpResponse类。
- 需要有Image\_Register\_Users\_Info和Image\_Users\_Info这两个Django模型，分别用于存储注册用户信息和已验证用户信息。
- 需要实现rsa\_decryption函数，用于RSA解密操作。
- 需要实现SHA256\_Encrypt函数，用于SHA-256加密操作。
- 需要正确配置Django的session框架，以便使用request.session。

3\.4.8 全局数据结构与该模块的关系

数据库：

from app01.models import Image\_Users\_Info, Image\_Register\_Users\_Info

**3.5、登录模块**

3\.5.1、设计图

3\.5.2、功能描述

用户登录已注册的JerryChat账号，并设置Remember Me。

3\.5.3、输入数据

`	`1. Chatbot Account：用户Chatbot账号名称； 

`	`2. Password：Chatbot账号的登录密码； 

3\.5.4、输出数据

跳转至用户主面板界面。

3\.5.5、数据设计

数据结构名称：

1. Id：编号
1. Account\_sha256：使用sha256哈希算法加密的账号名称
1. Password\_sha256：使用sha256哈希算法加密的密码
1. Email：用户注册时提供的邮箱
1. SignUp\_timestamp：注册时的UTC时间戳
1. Pri\_key：用户登录时服务器RSA算法随机生成的私钥
1. Pub\_key：用户登录时服务器RSA算法随机生成的公钥
1. Sign\_in\_expire\_time：用户登录的过期UTC时间
1. Threshold：用户设置的人脸识别阈值，默认为0.45。

3\.5.6、算法和流程

`	`用户发起websocket请求：ws://{window.location.host}/login。首先会校验用户登录状态，检查用户请求时携带的cookies中的token和imagesetID，然后校验通过后，再与服务器建立安全TCP连接。接下来，使用Crypto.PublicKey.RSA模块生成随机RSA的公钥和私钥，并将公钥发送给用户，且在此session下，将公钥和私钥存储session\_data。接下来，用户收到公钥后，将自动生成16位字符串作为AES的密钥，并将所有数据用AES的密钥加密后，带上使用公钥加密的AES密钥一起打包发送给服务器，服务器首先将会使用私钥解密AES密钥，再使用AES密钥解密得到用户原始数据。然后，服务器先将将账号和密码用SHA256算法加密成字符串，再与app01\_image\_users\_info数据库中的account\_sha256和password\_sha256进行比对，若比对成功，则根据用户是否选择remember me来设置登录过期时间sign\_in\_expire\_time，。

3\.5.7、函数说明

`	`实现文件：login.py

类：LoginConsumer

函数：

1\. RSA\_Encrypt(plaintext: str, public\_key: str) -> str

**功能**：使用RSA公钥加密算法加密明文字符串。

**格式**：

def RSA\_Encrypt(plaintext: str, public\_key: str) -> str:

`    `*# 函数体*

**参数**：

- plaintext (str): 需要加密的原始文本字符串。
- public\_key (str): 用于加密的RSA公钥，通常是一个PEM格式的字符串。

**全局变量**：

- 此函数不使用全局变量。

**局部变量**：

- cipher: 使用PKCS1\_v1\_5和导入的公钥创建的RSA加密对象。
- cipher\_text: 加密后的字节串。

**返回值**：返回一个字符串，表示加密后的文本，该文本是Base64编码的。

**算法说明**：

1. 使用PKCS1\_v1\_5创建一个RSA加密器对象，PKCS1\_v1\_5是PKCS#1 v1.5加密标准的实现。
1. 使用RSA.importKey方法将字符串格式的公钥转换为可用的RSA密钥对象。
1. 使用加密器对象的encrypt方法对明文字符串进行加密，明文需要先转换为字节串。
1. 加密结果是一个字节串，使用base64模块的b64encode方法将其编码为Base64格式。
1. 将Base64编码后的字节串解码为字符串并返回。

**使用约束**：

- 需要安装pycryptodome库，因为函数中使用了RSA、PKCS1\_v1\_5和base64模块。
- public\_key参数需要是有效的PEM格式的RSA公钥。
- 加密后的字符串是Base64编码的，需要使用相应的解码方法才能还原。
- RSA加密通常用于加密小数据量，例如密码或密钥。

2\. CreateToken(encrypted\_username: str, encrypted\_password: str, detail) -> list

**功能**：生成RSA密钥对，保存公钥的哈希和私钥到数据库记录，然后创建并加密一个令牌。

**格式**：

def CreateToken(encrypted\_username: str, encrypted\_password: str, detail) -> list:

`    `*# 函数体*

**参数**：

- encrypted\_username (str): 加密后的用户名。
- encrypted\_password (str): 加密后的密码。
- detail: 一个数据库模型实例，预期包含用户的详细信息，如邮箱等。

**全局变量**：

- 此函数不使用全局变量。

**局部变量**：

- rsa\_key: 使用RSA.generate生成的2048位RSA密钥对。
- pub\_key: RSA公钥，从rsa\_key导出并解码为字符串。
- pri\_key: RSA私钥，从rsa\_key导出并解码为字符串。
- email: 从detail中提取的电子邮件地址。
- raw\_token: 由用户名、密码和邮箱拼接而成的原始令牌字符串。
- token: 使用公钥加密后的令牌。

**返回值**：返回一个列表，包含加密后的令牌和公钥。

**算法说明**：

1. 使用RSA.generate和get\_random\_bytes函数生成一个2048位的RSA密钥对。
1. 导出公钥和私钥，并将公钥转换为字符串。
1. 使用SHA256\_Encrypt函数对公钥进行SHA-256加密，并将结果保存到detail对象的pub\_key属性。
1. 将私钥保存到detail对象的pri\_key属性，并保存detail对象到数据库。
1. 从detail中提取电子邮件地址。
1. 拼接用户名、密码和邮箱，创建原始令牌字符串。
1. 使用RSA\_Encrypt函数和公钥对原始令牌进行加密，得到加密后的令牌。
1. 返回包含加密令牌和公钥的列表。

**使用约束**：

- 需要RSA模块，通常是pycryptodome库的一部分。
- 需要实现SHA256\_Encrypt函数，用于SHA-256加密。
- 需要实现RSA\_Encrypt函数，用于RSA加密。
- detail对象需要有save方法，表明它可能是一个ORM模型实例。
- 函数假设get\_random\_bytes函数可用，这通常是os.urandom函数的别名。

3\.5.8 全局数据结构与该模块的关系

数据库：

from app01.models import Image\_Users\_Info

**3.6、模块3 人脸细节相似度对比（眉毛、眼睛、鼻子、嘴唇）** 

详细描述各功能模块的功能、数据结构、具体算法和流程等。 

3\.6.2、功能描述

`  `进行人脸细节相似度比对，输出两张图片间眉毛、眼睛、鼻子、嘴唇的相似度。

3\.6.3、输入数据

图片类型jpg、png、BMP等均可以，对于图片的内容和尺寸没有要求

3\.6.4、输出数据

`      `细节处相似度 2位小数



3\.6.5、数据设计

给出本程序中的局部数据结构说明，包括数据结构名称，功能说明，具体数据结构说明（定义、注释设计、取值）等。相关数据库表，数据存储设计（具体说明需要以文件方式保存的数据文件名、数据存储格式、数据项及属性等。）

Img1\_path : 图片1的路径。

Img2\_path : 图片2的路径。

V：根据人脸图片提取的某个特征的关键点坐标列表，例如图片1的眉毛关键点列表 [(245, 576), (257, 563), (277, 555), (306, 556), (341, 560)]，元组取值（x坐标，y坐标）。

dis\_matrix ：距离矩阵，元素dij代表第i个关键点到第j个关键点的距离，形状为n\*n （n为描述某个特征的关键点的个数），用于构建直方图。

Angle\_martix: 角度矩阵，元素aij代表第j个关键点在第i个关键点的什么角度上，形状为n\*n （n为描述某个特征的关键点的个数），用于构建直方图，角度取值0~360°

Histogram：关键点的直方图，形状为x\*y（x代表距离维度，y代表距离维度），代表着某个关键点的局部特征，取值：x，y可自行调整，也会影响最后的相似度比对。

Histogramlist：某个特征所有关键点的直方图组成的列表。

Similarity：两张图片间某个特征的相似度，取值0~1之间。

3\.6.6、算法和流程

详细描述根据输入数据产生输出数据的算法和流程。

算法使用的是形状上下文法，以比较两张图片的眉毛相似度为例，比较其他的相似度同理。

1. **提取出眉毛的关键点坐标列表：**对于输入的图片，利用mediapipe库检测，若无人脸，则退出程序，反之根据mediapipe关键点检测，提取出眉毛的关键点坐标列表。
1. **构建眉毛的距离矩阵和角度矩阵：**

`   `距离矩阵，计算出每两个点之间的欧式距离，构建成方阵形式

角度矩阵，计算某两个点之间相对于x轴正方向的角度，规定在0~360度之间。

1. **为每一个关键点构建直方图**Histogram：

`   `综合距离、角度矩阵，将距离维度和角度维度共同进行映射到同一个矩阵上，这个矩阵就是直方图，储存着某个关键点的周围局部特征。每张图片我们会得到Histogramlist，列表存储着眉毛5个关键点的直方图。

1. **计算相似度：**
**
`   `对于两张图片的眉毛Histogramlist，相应的关键点的直方图拉平为1维向量，去计算两张图片相应关键点的相似度，总相似度，通过加权平均所有关键点直方图的相似度得到。

3\.6.7、函数说明

具体说明模块中的各个函数，包括函数名称及其所在文件，功能，格式，参数，全局变量，局部变量，返回值，算法说明，使用约束等。

` `detailCompute.py

1\.计算两点角度函数

2\.构建距离、角度矩阵函数

3\.构建直方图函数

4. 计算相似度

   5\.封装所有的过程的函数，直接可以使用该函数计算特征的相似度。

   主程序：detailSimilarity.py

   **3.7、DetectFace模块**

   3\.7.1、设计图

   3\.7.2、功能描述

   用户需要上传一张目标图片，并在系统探测到的人脸中选择一张或多张人脸作为目标人脸，再上传最多50张待检测的图片，系统将在这些图片中寻找人脸并与用户选择的目标人脸比对，并返回相似度大于用户设置阈值的人脸和对应的原图片。若用户选择了Face Detail Feature Comparison，则除了返回上述信息，还会返回人脸细节特征比对的结果。

   3\.7.3、输入数据

   `	`1. Target Image：目标图片，base64格式； 

   `	`2. Pre-recognition Image：待检测的图片，base64格式； 

   3\.7.4、输出数据

   点击start按钮后，跳转至用户等待结果的loading动画界面。

   3\.7.5、数据设计

   数据结构设计：

   1\. id：编号

   2\. account\_sha256：使用sha256哈希算法加密的账号名称

   3\. image: 用户上传的目标图片的base64编码

   4\. face\_bboxes：该目标图片中的所有人脸坐标列表，以二进制形式存储

   5\. face\_matrices：该目标图片中的所有综合人脸特征向量列表，以二进制形式存储

   6\. landmarks：用户当前提交上传的照片标记

   数据结构设计：

   1\. id：编号

   2\. account\_sha256：使用<a name="_hlk168423323"></a>sha256哈希算法加密的账号名称

   3\. face\_sample: 系统检测到的人脸切割样本，base64格式

   4\. face\_matrices：有关该人脸的所有综合人脸特征向量列表，以二进制形式存储

   5\. image\_face\_index： 有该人脸的目标图片序号列表，以二进制形式存储

   3\.7.6、算法和流程

   `	`用户上创发起websocket请求：ws://{window.location.host}/target。首先会校验用户登录状态，检查用户请求时携带的cookies中的token和imagesetID，然后校验通过后，再与服务器建立安全TCP连接。接下来，使用Crypto.PublicKey.RSA模块生成随机RSA的公钥和私钥，并将公钥发送给用户，且在此session下，将公钥和私钥存储session\_data。接下来，用户收到公钥后，将自动生成16位字符串作为AES的密钥，并将所有数据用AES的密钥加密后，带上使用公钥加密的AES密钥一起打包发送给服务器，服务器首先将会使用私钥解密AES密钥，再使用AES密钥解密得到用户原始数据Target\_Image，再向app01\_image\_users\_info数据库获取threshold（用户设置的阈值），接下来，调用imageAnalysis函数使用insightface模型检测人脸，并得到result, Face\_Classification, faces\_detail结果，并发给前端；发送后，系统将自动构建后台数据，并储存进入数据表。

   `	`用户点击start按钮后，发起websocket请求：ws://{window.location.host}/recognition。首先会校验用户登录状态，检查用户请求时携带的cookies中的token和imagesetID，然后校验通过后，再与服务器建立安全TCP连接。接下来，使用Crypto.PublicKey.RSA模块生成随机RSA的公钥和私钥，并将公钥发送给用户，且在此session下，将公钥和私钥存储session\_data。接下来，用户收到公钥后，将自动生成16位字符串作为AES的密钥，并将所有数据用AES的密钥加密后，带上使用公钥加密的AES密钥一起打包发送给服务器，服务器首先将会使用私钥解密AES密钥，再使用AES密钥解密得到用户原始数据---用户选择的人脸序号，所有待检测的图片，是否选择了人脸细节特征比对。然后，系统将从app01\_images\_to\_faces\_info数据库中取用用户选择比对的目标图片中人脸的特征向量，再调用imageAnalysis2函数获取待检测的图片的人脸特征向量，依次遍历并与目标图片中人脸的特征向量点乘。若点乘结果大于等于阈值，则将所有需要展示的信息添加进列表PreRecognition\_Over\_Threshold\_Images；否则所有需要展示的信息添加进列表PreRecognition\_Under\_Threshold\_Images，每次完成一张待检测图片的处理，向客户端发送完成信号{'Already': index + 1}，最终全部处理完毕后，向客户端发送所有结果{'PreRecognition\_Over\_Threshold': PreRecognition\_Over\_Threshold\_Images,  'PreRecognition\_Under\_Threshold': PreRecognition\_Under\_Threshold\_Images}。发送完后，系统将在后端构建历史记录数据，并存储在数据库app01\_history\_details\_info中。

   3\.7.7、函数说明

   `	`实现文件：target.py, recognize.py

   类：TargetConsumer, RecognizeConsumer

   函数：

   1\. getAccount(imagesetID)

   **功能**：根据imagesetID查找并返回用户的账户SHA-256哈希值。

   **格式**：

   def getAccount(imagesetID):

   `    `*# 函数体*

   **参数**：

- imagesetID：用于搜索数据库中公钥字段的值。

**全局变量**：

- 此函数不使用全局变量。

**局部变量**：

- detail：数据库查询的结果。

**返回值**：

- 如果找到匹配的记录，则返回与imagesetID关联的账户的SHA-256哈希值。
- 如果没有找到匹配的记录，则返回None。

**算法说明**：

1. 使用Image\_Users\_Info.objects.filter(pub\_key\_\_contains=imagesetID)查询数据库，寻找公钥字段包含imagesetID的用户记录。
1. .first()方法用于获取查询结果中的第一个对象，如果没有结果则为None。
1. 如果detail不为None，则返回detail.account\_sha256属性的值。
1. 如果detail为None，则函数返回None。

**使用约束**：

- 需要有一个名为Image\_Users\_Info的数据库模型，该模型至少包含pub\_key和account\_sha256字段。
- imagesetID应该是一个字符串，用于在pub\_key字段中搜索匹配项。
- 函数假设数据库查询是有效的，并且pub\_key字段存储的值包含imagesetID。

2\. imageAnalysis(base64\_str: str, threshold: float)

**功能**：分析图像，识别面部，并根据面部特征进行分类。

**格式**：

def imageAnalysis(base64\_str: str, threshold: float):

`    `*# 函数体*

**参数**：

- base64\_str (str): 包含图像数据的Base64编码字符串。
- threshold (float): 用于面部分类的阈值。

**全局变量**：

- app: 用于获取图像中的面部对象的应用或库（例如，可能是一个面部识别API或库）。
- cv2: OpenCV库，用于图像处理。
- np: NumPy库，用于数值计算。
1. **局部变量**：

如

- parts: 用于存储分割后的Base64字符串的数组。
- img\_data: Base64解码后的图像二进制数据。
- np\_data: 从img\_data转换而来的NumPy数组。
- img: 从np\_data解码得到的图像。
- original\_height, original\_width, channels: 原始图像的尺寸和通道数。
- white\_image: 用于调整图像尺寸的白色背景画布。
- media\_type: 图像的媒体类型，用于编码时指定格式。
- train\_faces: 通过app.get(img)获取的面部对象列表。
- result: 存储每个面部的裁剪图像和数据URI的字典。
- faces\_detail: 存储面部详细信息的列表。
- Face\_Classification: 根据面部特征进行分类的结果。

**返回值**：返回一个列表，包含以下内容：

- result: 每个面部的裁剪图像的数据URI。
- Face\_Classification: 面部分类的结果。
- faces\_detail: 包含面部边界框和归一化嵌入特征的面部详细信息列表。

**算法说明**：

1. 从Base64编码字符串中移除数据URI Scheme前缀。
1. 对Base64编码的图像数据进行解码，得到二进制数据。
1. 将二进制数据转换为NumPy数组。
1. 使用OpenCV从NumPy数组解码图像。
1. 果图像尺寸小于640x640，调整图像尺寸以适应最小尺寸要求。
1. 分割字符串以获取媒体类型，并构建数据URI。
1. 使用app.get(img)获取图像中的面部对象。
1. 对每个面部，裁剪图像并重新编码为Base64字符串，构建数据URI。
1. 将裁剪后的图像的详细信息添加到faces\_detail列表。
1. 如果存在面部，则调用Classify\_Faces\_Based\_On\_Image函数进行面部分类。
1. 返回包含裁剪图像数据URI、面部分类结果和面部详细信息的列表。

**使用约束**：

- 需要安装OpenCV (cv2) 和 NumPy (np) 库。
- app.get(img)需要是一个有效的函数或方法，能够从图像中提取面部对象。
- Classify\_Faces\_Based\_On\_Image需要是一个有效的函数，用于根据面部特征进行分类。
- 函数假设输入的Base64字符串是有效的图像数据。

3\. Classify\_Faces\_Based\_On\_Image(faces\_detail, threshold)

**功能**：对图像中的面部进行相似度比较和分类。

**格式**：

def Classify\_Faces\_Based\_On\_Image(faces\_detail, threshold):

`    `*# 函数体*

**参数**：

- faces\_detail：包含每个面部详细信息的列表，其中应包含归一化的面部特征向量normed\_embedding。
- threshold：相似度阈值，用于判断面部是否属于同一类别。

**全局变量**：

- 此函数不使用全局变量。

**局部变量**：

- face\_matrices：从faces\_detail中提取的归一化面部特征向量列表。
- Faces：存储面部分类结果的列表。
- Similarities：存储面部之间相似度的列表。

**返回值**：返回一个列表，其中每个子列表包含属于同一类别的面部索引。

**算法说明**：

1. 从faces\_detail中提取归一化的面部特征向量，存储在face\_matrices中。
1. 初始化两个列表Faces和Similarities，分别用于存储面部分类和相似度信息。
1. 遍历face\_matrices，使用NumPy的dot函数计算每对面部特征向量之间的相似度。
1. 如果相似度大于或等于threshold，则将这对面部的索引和相似度添加到Similarities中。
1. 根据相似度信息，将相似的面部归为同一类别。
1. 如果面部没有找到相似的面部，则将其单独分类。
1. 返回面部分类的结果。

**使用约束**：

- 需要安装NumPy库，因为函数中使用了NumPy的dot函数进行向量点积计算。
- faces\_detail列表中的每个元素都应该包含一个normed\_embedding键，其值是面部的归一化特征向量。
- threshold应该是一个合理的相似度阈值，用于区分不同类别的面部。
1. Get\_Target\_Faces\_From\_SQL(token, imagesetID, target\_faces\_index\_list)

**功能**：根据提供的令牌、图像集ID和目标面部索引列表，从数据库中检索面部边界框、面部特征矩阵、原始图像、账户SHA-256哈希值、以及图像项目标识符。

**格式**：

def Get\_Target\_Faces\_From\_SQL(token, imagesetID, target\_faces\_index\_list):

`    `*# 函数体*

**参数**：

- token：用于身份验证的令牌字符串。
- imagesetID：用于搜索数据库中公钥字段的值。
- target\_faces\_index\_list：一个包含目标面部索引的列表，这些索引用于从检索到的面部数据中筛选特定的面部。

**全局变量**：

- 此函数不使用全局变量。

**局部变量**：

- detail：数据库查询的结果，包含用户公钥和私钥的信息。
- private\_key：从数据库检索到的私钥。
- decrypted\_token：使用私钥解密后的令牌内容。
- account\_sha256：从解密后的令牌中提取的账户SHA-256哈希值。
- selectedItem：根据账户SHA-256哈希值和面部标记为真的条件检索到的图像到面部信息的对象。
- face\_bboxes：面部边界框的数据。
- face\_matrices：面部特征矩阵的数据。
- face\_image：原始图像数据。
- selectedItem.id：检索到的图像到面部信息对象的标识符。

**返回值**：

- 如果成功检索到数据，返回一个包含面部边界框、面部特征矩阵、原始图像、账户SHA-256哈希值和图像项目标识符的列表。
- 如果在任何步骤中未找到匹配的数据或解密失败，则返回None。

**算法说明**：

1. 使用imagesetID查询Image\_Users\_Info表，获取包含该ID的公钥的用户详细信息。
1. 如果找到用户信息，提取私钥。
1. 使用私钥解密token，获取账户SHA-256哈希值。
1. 根据账户SHA-256哈希值和面部标记为真的条件，查询Images\_To\_Faces\_Info表，获取第一个匹配的记录。
1. 如果找到记录，使用pickle模块加载面部边界框和面部特征矩阵的数据。
1. 根据target\_faces\_index\_list筛选特定的面部边界框和面部特征矩阵。
1. 返回筛选后的面部边界框、面部特征矩阵、原始图像、账户SHA-256哈希值和图像项目标识符。

**使用约束**：

- 需要安装pycryptodome库，因为函数中使用了rsa\_decryption函数进行RSA解密。
- 需要安装pickle库，因为函数中使用了pickle.loads来加载序列化的对象。
- 需要有一个名为Image\_Users\_Info的数据库模型，该模型至少包含pub\_key和pri\_key字段。
- 需要有一个名为Images\_To\_Faces\_Info的数据库模型，该模型至少包含account\_sha256、face\_bboxes、face\_matrices、image和landmarks字段。
- 函数假设rsa\_decryption函数和数据库模型的objects.filter和objects.first方法可用。

6\. Get\_Target\_Faces\_According\_To\_BBOXS(Target\_Faces\_BBOXS: list, base64\_str: str)

**功能**：提取图像中特定BBOX区域的面部，并编码为Base64字符串。

**格式**：

def Get\_Target\_Faces\_According\_To\_BBOXS(Target\_Faces\_BBOXS: list, base64\_str: str):

`    `*# 函数体*

**参数**：

- Target\_Faces\_BBOXS (list): 包含面部边界框坐标的列表，每个边界框由一个包含四个整数的列表表示（x1, y1, x2, y2），分别代表面部区域左上角和右下角的坐标。
- base64\_str (str): 包含图像数据的Base64编码字符串。

**全局变量**：

- cv2: OpenCV库，用于图像处理。
- np: NumPy库，用于数值计算。
- base64: Python标准库，用于Base64编码和解码。

**局部变量**：

- parts: 用于存储分割后的Base64字符串的数组。
- img\_data: Base64解码后的图像二进制数据。
- np\_data: 从img\_data转换而来的NumPy数组。
- img: 从np\_data解码得到的图像。
- media\_type: 图像的媒体类型，用于编码时指定格式。
- ans: 存储提取的面部区域Base64编码字符串的列表。

**返回值**：返回一个包含提取的面部区域Base64编码字符串的列表。

**算法说明**：

1. 从Base64编码字符串中移除数据URI Scheme前缀，并分割字符串以获取媒体类型。
1. 对Base64编码的图像数据进行解码，得到二进制数据。
1. 将二进制数据转换为NumPy数组。
1. 使用OpenCV从NumPy数组解码图像。
1. 遍历Target\_Faces\_BBOXS列表，根据每个边界框从原始图像中提取面部区域。
1. 对每个提取的面部区域使用OpenCV重新编码为图像格式，并转换为Base64编码字符串。
1. 构建包含媒体类型前缀的数据URI，并将其添加到结果列表ans中。
1. 返回包含所有提取面部区域数据URI的列表。

**使用约束**：

- 需要安装OpenCV (cv2) 和 NumPy (np) 库。
- 输入的base64\_str应该是有效的Base64编码图像数据。
- Target\_Faces\_BBOXS中的边界框坐标需要正确指定，以便准确提取面部区域。
7. imageAnalysis2(base64\_str: str)

**功能**：分析图像数据，提取面部特征和裁剪图像，并生成裁剪图像的Base64编码。

**格式**：

def imageAnalysis2(base64\_str: str):

`    `*# 函数体*

**参数**：

- base64\_str (str): 包含图像数据的Base64编码字符串。

**全局变量**：

- app: 用于面部识别的应用或库（例如，可能是一个面部识别API或库）。
- cv2: OpenCV库，用于图像处理。
- np: NumPy库，用于数值计算。
- base64: Python标准库，用于Base64编码和解码。

**局部变量**：

- parts: 用于存储分割后的Base64字符串的数组。
- img\_data: Base64解码后的图像二进制数据。
- np\_data: 从img\_data转换而来的NumPy数组。
- img: 从np\_data解码得到的图像。
- original\_height, original\_width, channels: 原始图像的尺寸和通道数。
- white\_image: 用于调整图像尺寸的白色背景画布。
- media\_type: 图像的媒体类型，用于编码时指定格式。
- train\_faces: 通过app.get(img)获取的面部对象列表。
- faces\_detail: 存储面部详细信息的列表。

**返回值**：返回一个列表，其中每个元素是一个字典，包含面部的边界框、归一化的嵌入特征向量和裁剪图像的Base64编码。

**算法说明**：

1. 从Base64编码字符串中移除数据URI Scheme前缀，并解码Base64字符串以获取图像数据。
1. 将解码后的二进制数据转换为NumPy数组，然后使用OpenCV解码图像。
1. 检查图像尺寸，如果小于640x640，则扩展图像以满足最小尺寸要求。
1. 从Base64字符串中提取媒体类型，用于后续编码。
1. 使用app.get(img)获取图像中的面部对象。
1. 遍历每个面部对象，提取面部区域，并尝试将其编码为Base64字符串。
1. 如果编码失败，重新提取面部区域并再次尝试编码。
1. 构建包含面部边界框、归一化嵌入特征向量和裁剪图像Base64编码的字典。
1. 将面部详细信息字典添加到faces\_detail列表中。
1. 返回包含所有面部详细信息的列表。

**使用约束**：

- 需要安装OpenCV (cv2) 和 NumPy (np) 库。
- app.get(img)需要是一个有效的函数或方法，能够从图像中提取面部对象。
- 输入的base64\_str应该是有效的Base64编码图像数据。

3\.7.8 全局数据结构与该模块的关系

数据库：

from app01.models import Image\_Users\_Info, Images\_To\_Faces\_Info, History\_Details\_Info

函数调用：

from app01.views import checkToken

from app01.TargetImageAnalysis import imageAnalysis

from app01.ImageSave import Images\_To\_Faces\_Save, Faces\_To\_Images\_Save

from app01.TargetImageAnalysis import imageAnalysis2

from app01.views import rsa\_decryption

from app01.detailSimilarity import get\_similarity

**3.8、设置模块**

3\.8.1、设计图


3\.8.2、功能描述

让用户调整输出相似人脸的阈值，并提供一个反馈建议的表单。

3\.8.3、输入数据

通过sliderbar滑动改变threshold值，在表单中填写的个人信息以及message

3\.8.4、输出数据

更新数据库中Image\_Users\_Info表的threshold字段。

3\.8.5、函数说明

1、更新和获取用户设置的阈值（threshold），同时确保请求的安全和有效性

**3.9、团队介绍模块**

3\.9.1、设计图

3\.9.2、功能描述

一个展示模块，不过多赘述。

**3.10、历史记录模块**

3\.10.1、设计图

3\.10.2、功能描述

展示用户的搜索记录

3\.10.3、输出数据

输出变量名：response - 包含JSON格式数据的HTTP响应。

输出变量名：ans - 包含裁剪后的人脸图像数据URI的列表。

输出变量名：history\_list - 包含历史记录详细信息的列表。

输出变量名：response - 包含JSON格式数据的HTTP响应。

3\.10.4、数据设计

同模块3.7DetectFace模块

3\.10.5、函数说明

1\. getDetectedFaces(request)

功能: 处理GET请求，返回检测到的面孔列表。

函数说明:

验证请求合法性，通过比较sessionToken和token，或者调用checkToken函数。

如果验证通过，调用detectedFaces函数并传入用户账号信息，获取检测到的面孔。

将检测结果转换为JSON格式并返回。

2\. Get\_Target\_Faces\_According\_To\_BBOXS(Target\_Faces\_BBOXS, base64\_str)

功能: 根据提供的边界框列表和base64编码的图像字符串，提取并编码图像中的特定人脸区域。

函数说明:

从base64字符串中提取图像数据并解码。

使用OpenCV库解码图像，并根据边界框裁剪出人脸区域。

尝试对人脸区域进行重新编码并构建数据URI，如果失败则重新裁剪并编码。

返回包含所有裁剪人脸区域数据URI的列表。

3\. getHistoryFromSQL(account\_sha256)

功能: 根据账户SHA256散列值，从数据库中检索历史记录。

函数说明:

从数据库中筛选与account\_sha256匹配且提交时间小于等于当前时间的历史记录。

对于每条历史记录，获取目标图像信息、人脸边界框、预识别阈值等。

调用Get\_Target\_Faces\_According\_To\_BBOXS函数获取裁剪的人脸图像。

格式化提交时间，并添加到历史记录列表中。

返回包含历史记录详细信息的列表。

4\. getHistory(request)

功能: 处理GET请求，返回用户的历史记录。

函数说明:

验证请求合法性，通过比较sessionToken和token，或者调用checkToken函数。

如果验证通过，调用getHistoryFromSQL函数并传入用户账号信息，获取历史记录。

将历史记录转换为JSON格式并返回。

如果请求不是GET请求或Token验证失败，返回首页并清除Cookies。

3\.3.8 全局数据结构与该模块的关系

数据库：

from app01.models import Image\_Users\_Info, Images\_To\_Faces\_Info, History\_Details\_Info， Image\_Register\_Users\_Info

函数调用：

from app01.detectedFaces import detectedFaces

4、 接口设计

**4.1、 用户接口**

url接口：

urlpatterns = [
`    `# DEBUG = False 时使用
`    `re\_path(r"^static/(?P<path>.\*)$", static.serve, {"document\_root": settings.STATIC\_ROOT}, name='static'),
`    `path('', views.home),
`    `path('accounts/', views.checkAccount),
`    `path('back/', views.changePersonalInfo),
`    `path('verify/', views.verifyEmail),
`    `path('faces/', views.getDetectedFaces),
`    `path('history/', views.getHistory),
`    `path('threshold/', views.changeThreshold)
]

**websocket asgi接口：**

websocket\_urlpatterns = [

`    `re\_path(r'ws/register/$', register.RegisterConsumer.as\_asgi()),

`    `re\_path(r'ws/login/$', login.LoginConsumer.as\_asgi()),

`    `re\_path(r'ws/target/$', target.TargetConsumer.as\_asgi()),

`    `re\_path(r'ws/recognize/$', recognize.RecognizeConsumer.as\_asgi())

]

**4.2、 外部接口**

1\. 调用网易163邮箱的邮箱服务接口去发送验证码，采用https和SMTP协议，确保验证码不会被恶意篡改，邮件能够被正确发送到用户的邮箱中。

**4.3、 内部接口**

4\.3.1、 接口说明

例如：xx子模块通过xx从xx子模块取得xx等，相关标准，调用示例，可根据需要增加章节描述接口。

1\. def checkToken(token: str, imagesetID: str) -> bool:

**接口名称**: checkToken 

**功能**: 验证用户令牌是否有效

**输入参数**

|**参数名称**|**类型**|**必填**|**描述**|
| :- | :- | :- | :- |
|token|string|是|需要验证的令牌|
|imagesetID|string|是|图像集唯一标识符|

**输出参数**

|**参数名称**|**类型**|**描述**|
| :- | :- | :- |
|返回值|bool|令牌验证成功返回 True，否则 False|

Eg.  checkToken(token, imagesetID)

2\. imageAnalysis(base64\_str: str, threshold: float)

**接口名称**: imageAnalysis **功能**: 对输入的 Base64 编码图像进行人脸检测和分类

**输入参数**

|**参数名称**|**类型**|**必填**|**描述**|
| :- | :- | :- | :- |
|base64\_str|string|是|输入的 Base64 编码图像字符串|
|threshold|float|是|人脸分类的阈值|

**输出参数**

|**参数名称**|**类型**|**描述**|
| :- | :- | :- |
|返回值|list|包含三个元素的列表：人脸图像字典、人脸分类结果、人脸详细信息|

Eg.  result, face\_classification, faces\_detail = imageAnalysis(base64\_str, 0.75)

3\. Images\_To\_Faces\_Save(account\_sha256, base64\_image, faces\_detail)

**接口名称**: Images\_To\_Faces\_Save **功能**: 保存用户图像及其人脸详细信息到数据库

**输入参数**

|**参数名称**|**类型**|**必填**|**描述**|
| :- | :- | :- | :- |
|account\_sha256|string|是|用户账户的 SHA-256 哈希值|
|base64\_image|string|是|Base64 编码图像字符串|
|faces\_detail|list|是|包含人脸详细信息的列表|

**输出参数**

|**参数名称**|**类型**|**描述**|
| :- | :- | :- |
|返回值|dict|包含保存记录的 ID|

Eg. result = Images\_To\_Faces\_Save(account\_sha256, base64\_image, faces\_detail)

4\. Faces\_To\_Images\_Save(account\_sha256, result, Face\_Classification, faces\_detail, image\_id, threshold)

**接口名称**: Faces\_To\_Images\_Save **功能**: 保存或更新人脸分类结果到数据库

**输入参数**

|**参数名称**|**类型**|**必填**|**描述**|
| :- | :- | :- | :- |
|account\_sha256|string|是|用户账户的 SHA-256 哈希值|
|result|dict|是|裁剪后的人脸图像的 Base64 编码字符串的字典|
|Face\_Classification|list|是|人脸分类结果|
|faces\_detail|list|是|包含人脸详细信息的列表|
|image\_id|int|是|图像的唯一标识符|
|threshold|float|是|用于人脸匹配的阈值|

**输出参数**

|**参数名称**|**类型**|**描述**|
| :- | :- | :- |
|无|无|无返回值|

Eg. 

account\_sha256 = "example\_account\_sha256"

result = { "1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." }

Face\_Classification = [[0, 1], [2, 3]]

faces\_detail = [

`    `{'bbox': [10, 20, 30, 40], 'normed\_embedding': [0.1, 0.2, 0.3, 0.4]},

`    `{'bbox': [50, 60, 70, 80], 'normed\_embedding': [0.5, 0.6, 0.7, 0.8]}

]

image\_id = 123

threshold = 0.75

Faces\_To\_Images\_Save(account\_sha256, result, Face\_Classification, faces\_detail, image\_id, threshold)

1. def get\_similarity(base64\_img1, base64\_img2)

接口名称: get\_similarity

功能: 计算两个输入图像在特定面部特征上的相似度

输入参数

参数名称	类型	必填	描述

base64\_img1	string	是	第一个输入图像的 Base64 编码字符串

base64\_img2	string	是	第二个输入图像的 Base64 编码字符串

输出参数

参数名称	类型	描述

返回值	list	包含各特征相似度得分及特征图像的 Base64 编码字符串 

E.g. # 示例Base64编码图像字符串

base64\_img1 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."

base64\_img2 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."

\# 调用 get\_similarity 函数

similarity\_results = get\_similarity(base64\_img1, base64\_img2)
# **5、数据库设计** 
描述所使用的数据库系统,及数据库和数据表设计。如果系统不以数据库方式存储数据则可省略。 

**用户注册表（临时表）**

id：主键，唯一标识每个用户。

account：用户名，不能重复，不允许为空。

Password：密码，不允许为空。

email：用户邮箱，唯一，不允许为空。

verify\_number：验证码，6位数字，输入正确后数据都传入用户账户信息表。

expire\_time：验证码发送时间，验证码五分钟有效期。

pub\_key：篡改校验。

pri\_key：解密密钥。

**用户账户信息表**

account\_sha256：用户名。

password\_sha256：密码。

email：登陆邮箱。

SignUp\_timestamp：用户注册时间

pub\_key：篡改校验。

pri\_key：解密密钥。

sign\_in\_expire\_time：登录过期时间，选择保存账户密码，登录15天过期，不选择，登录5天过期。

**图片存储表**




# **6、系统出错处理** 
**6.1、 出错信息**

用一览表的方式说明每种可能的错误和故障，以及系统输出信息的形式、含义和处理方式。

|**错误类型**|**系统输出信息示例**|**含义**|**处理建议**|
| :-: | :-: | :-: | :-: |
|用户名或密码错误|"Account or Password Error"|输入的用户名未注册或与密码不匹配|重新检查输入信息，使用“忘记密码”功能重置密码（如果适用）|
|用户已存在|"The account is already in use"|尝试注册的用户名已经被其他用户使用|提供不同的用户名选项或提示用户使用邮箱找回已有账户|
|验证码错误|"Email Verify Number [Invaild] "|用户输入的验证码与系统生成的验证码不匹配|重新获取验证码并准确输入|
|邮箱验证未通过|"Email verification link is invalid"|用户未完成邮箱验证过程或验证链接失效|重新发送验证邮件，检查垃圾邮件箱，遵循邮件中的指引完成验证|
|图片数量超出限制|You can only upload a maximum of 50 photos|用户尝试上传的照片数量超过了50张的限制|减少所选照片数量至50张以内再重新上传|

**6.2、 补救措施**

说明故障出现后可能采取的补救措施，如恢复、再启动技术等。
# **7、其他设计**
`	`如系统安全设计、性能设计等。
