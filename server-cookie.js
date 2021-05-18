const express = require('express');
const ejs = require('ejs');
const db = require('./model/db.js');
const ObjectId=require('mongodb').ObjectID;
const app = express();

const cookieParser=require('cookie-parser');
app.use(cookieParser());

// 配置socket.io
const http=require('http').Server(app);
const io=require('socket.io')(http)
// const session=require('express-session');

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { 
// 	  maxAge:200000
//   }
// }))

// 处理post参数的模块
const bodyParser=require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine','ejs');

app.use('/public',express.static('./public/'));

app.use('/register',(req,res)=>{
	res.render('register',{});
})
// app.use('/product',(req,res)=>{
// 	res.render('product',{});
// })
//处理修改密码请求
app.post('/updpass',urlencodedParser,(req,res)=>{
	let username = req.body.username;
	let password = req.body.password;
	let newpassword = req.body.newPassword;
	if (password == "" || password == undefined){
		result = {Code:400,msg:'密码不能为空！'};
		res.send(result);
		return;
	}
	if (password.length <6){
		result = {Code:400,msg:'密码长度必须大于6位！'};
		res.send(result);
		return;
	}
	//1、查询用户是否存在
	let obj = {username:username,password:password};
	let updObj = {password:newpassword};
	let result = {};
	db.find('user','userinfo',obj,(data)=>{
		if (data.length <= 0){
			result = {Code:400,msg:'用户不存在'};
			res.send(result);
		} else {
			db.update('user','userinfo',obj,updObj,(data)=>{
				if (data.result.n == 1){
					res.cookie('username',undefined,{maxAge:7 * 24 * 3600 * 1000,httponly:true});
					result = {Code:200,msg:'密码修改成功'}
					res.send(result);
				}
			})
		}
	})
})
//处理登录请求
app.post('/login',urlencodedParser,(req,res)=>{
	//1、验证用户名和密码是否符合规范,如果不符合，返回不符合信息
	let result={};
	let username = req.body.username;
	let password = req.body.password;
	if (username == "" || username == undefined){
		result = {Code:400,msg:'用户名不能为空！'};
		res.send(result);
		return;
	}
	if (username.length<6 || username.length > 14){
		result = {Code:400,msg:'用户名的长度不在6到14之间'};
		res.send(result);
		return;
	}
	var regex=/^\w+$/;
	let checkFormat = regex.test(username);
	if (checkFormat == false){
		result = {Code:400,msg:'用户名只能是数字、字母或者下划线组成'};
		res.send(result);
		return;
	}
	if (password == "" || password == undefined){
		result = {Code:400,msg:'密码不能为空！'};
		res.send(result);
		return;
	}
	if (password.length <6){
		result = {Code:400,msg:'密码长度必须大于6位！'};
		res.send(result);
		return;
	}
	let obj = {username:req.body.username,password:req.body.password};
	db.find('user','userinfo',obj,(data)=>{
		// res.send(data);
		console.log(data);
		if (data.length > 0){
			//2、如果存在，记录cookie,返回登录成功
			res.cookie('username',req.body.username,{maxAge:7 * 24 * 3600 * 1000,httponly:true});
			result = {Code:200,msg:'登录成功！'};
			console.log(result);
			res.send(result);
		} else {
			//3、如果不存在返回用户名和密码错误
			result = {Code:401,msg:'用户名或密码错误!'};
			console.log(result);
			res.send(result);
			return;
		}
	})
})
//处理退出登录请求
app.use('/dellogin',(req,res)=>{
	//1、获取退出登录的用户名
	let username = req.query.username;	
	//2、设置cookie的值为undefined
	res.cookie('username',undefined,{maxAge:7 * 24 * 3600 * 1000,httponly:true});
	//3、返回登录界面
	// res.render('login');
	res.send({Code:200,msg:'退出登录成功'});
})
//处理注销用户请求
app.use('/removeuser',(req,res)=>{
	//1、获取注销用户的用户名
	let username = req.query.username;	
	//2、删除数据库
	let delData = {username:username};
	db.del('user','userinfo',delData,(data)=>{
		//3、设置cookie的值为undefined
		res.cookie('username',undefined,{maxAge:7 * 24 * 3600 * 1000,httponly:true});
		res.send({Code:200,msg:'注销用户成功'});
	})
	
})
//处理注册请求
app.post('/reg',urlencodedParser,(req,res)=>{
	// res.render('product');
	
	//1、验证用户名和密码是否符合规范,如果不符合，返回不符合信息
	let result={};
	let username = req.body.username;
	let password = req.body.password;
	if (username == "" || username == undefined){
		result = {Code:400,msg:'用户名不能为空！'};
		res.send(result);
		return;
	}
	if (username.length<6 || username.length > 12){
		result = {Code:400,msg:'用户名的长度不在6到12之间'};
		res.send(result);
		return;
	}
	var regex=/^\w+$/;
	let checkFormat = regex.test(username);
	if (checkFormat == false){
		result = {Code:400,msg:'用户名只能是数字、字母或者下划线组成'};
		res.send(result);
		return;
	}
	if (password == "" || password == undefined){
		result = {Code:400,msg:'密码不能为空！'};
		res.send(result);
		return;
	}
	// console.log(password,password.length);
	if (password.length <6){
		result = {Code:400,msg:'密码长度必须大于6位！'};
		res.send(result);
		return;
	}
	//2、验证用户名是否已经存在，如果存在，返回用户名已经存在信息
	let obj = {username:req.body.username};
	db.find('user','userinfo',obj,(data)=>{
		// res.send(data);
		if (data.length > 0){
			result = {Code:400,msg:'用户已经存在！'};
			res.send(result);
			return;
		} else {
			//3、记录数据库
			let insData = {username:req.body.username,password:req.body.password};
			db.insert('user','userinfo',insData,(data)=>{
				// res.send(data);
				if (data.result.n == 1){
					//4、记录cookie
					res.cookie('username',req.body.username,{maxAge:7 * 24 * 3600 * 1000,httponly:true});
					//5、返回注册成功
					result = {Code:200,msg:'注册成功！'};
					res.send(result);
				} else {
					//6、返回注册失败原因
					result = {Code:400,msg:'记录数据库失败！'};
					res.send(result);
					return;
				}
			})
		}
	})
	
})
//产品操作
//提取所有产品信息请求
app.use('/getproducts',(req,res)=>{
	//增加搜索功能
	let productName = req.query.partProductname;
	//console.log(productName);
	let obj = {};
	if (productName){
		obj={productName: { $regex: '.*' + productName + '.*' }};
	} 	
	// console.log(obj);
	db.find('product','productinfo',obj,(data)=>{
		res.send(data);
	})
})
//根据页面提取产品信息
app.use('/getpageproducts',(req,res)=>{
	let pageSize = parseInt(req.query.pageSize);
	let currPage = parseInt(req.query.currPage);
// 	console.log(currPage);
// 	console.log(pageSize);
	let productName = req.query.partProductname;
	let obj = {}
	if (productName){
		obj={productName: { $regex: '.*' + productName + '.*' }};
	} 	
	// console.log(obj);
	db.find('product','productinfo',obj,(result)=>{
		res.send(result);
	},{},(currPage-1) * pageSize,pageSize);
})
//搜索商品请求(通过getpageproducts实现)
// app.use('/findproducts',(req,res)=>{
// 	
// })
//添加商品请求
app.use('/addproduct',(req,res)=>{
	let productName = req.query.productName;
	let productSpec = req.query.productSpec;
	let productUnit = req.query.productUnit;
	let productPrice = req.query.productPrice;
	let productStock = req.query.productStock;
	let productCompany = req.query.productCompany;
	let obj = {
		productName:productName,
		productSpec:productSpec,
		productUnit:productUnit,
		productPrice:productPrice,
		productStock:productStock,
		productCompany:productCompany
	};
	db.insert('product','productinfo',obj,(data)=>{
		res.send(data);
	})
})
//删除商品请求
app.use('/delproduct',(req,res)=>{
	let productId = new ObjectId(req.query.productId);
	let obj = {_id:productId};
	db.del('product','productinfo',obj,(data)=>{
		res.send(data);
	})
})
//编辑商品请求
app.use('/updproduct',(req,res)=>{
	let productId = new ObjectId(req.query.productId);
	let productName = req.query.productName;
	let productSpec = req.query.productSpec;
	let productUnit = req.query.productUnit;
	let productPrice = req.query.productPrice;
	let productStock = req.query.productStock;
	let productCompany = req.query.productCompany;
	
	let obj = {_id:productId};
	let updObj = {
		productName:productName,
		productSpec:productSpec,
		productUnit:productUnit,
		productPrice:productPrice,
		productStock:productStock,
		productCompany:productCompany
	}
	
	db.update('product','productinfo',obj,updObj,(data)=>{
		res.send(data);
	})
})
//提取评论
app.use('/getcomments',(req,res)=>{
	let productId = req.query.productId;
	let obj = {productId:productId};
	db.find('comments','commentsinfo',obj,(data)=>{
		res.send(data);
	})
})
//增加评论
app.use('/addcomments',(req,res)=>{
	let productId = req.query.productId;
	let content = req.query.content;
	
	let date = new Date();
	let year = date.getFullYear();
	let month = (date.getMonth() + 1>9)?(''+(date.getMonth()+1)):('0'+(date.getMonth()+1));
	let day = (date.getDate()>9)?(''+date.getDate()):('0'+date.getDate());
	let hour = (date.getHours()>9)?(''+date.getHours()):('0'+date.getHours())
	let minute = (date.getMinutes()>9)?(''+date.getMinutes()):('0'+date.getMinutes());
	let second = (date.getSeconds()>9)?(''+date.getSeconds()):('0'+date.getSeconds());
	let commentTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	
	let obj = {productId:productId,content:content,commentTime:commentTime};
	db.insert('comments','commentsinfo',obj,(data)=>{
		res.send(data);
	})
})
//删除评论
app.use('/delcomments',(req,res)=>{
	let productId = req.query.productId;
	let obj = {productId:productId};
	db.del('comments','commentsinfo',obj,(data)=>{
		res.send(data);
	})
})
//添加点赞
app.use('/addperfetcts',(req,res)=>{
	let productId = req.query.productId;
	let userName = req.query.username;
	
	let date = new Date();
	let year = date.getFullYear();
	let month = (date.getMonth() + 1>9)?(''+(date.getMonth()+1)):('0'+(date.getMonth()+1));
	let day = (date.getDate()>9)?(''+date.getDate()):('0'+date.getDate());
	let hour = (date.getHours()>9)?(''+date.getHours()):('0'+date.getHours())
	let minute = (date.getMinutes()>9)?(''+date.getMinutes()):('0'+date.getMinutes());
	let second = (date.getSeconds()>9)?(''+date.getSeconds()):('0'+date.getSeconds());
	let perfectTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	
	let obj = {productId:productId,username:userName,perfectTime:perfectTime};
	db.insert('perfects','perfectsinfo',obj,(data)=>{
		res.send(data);
	})
})
//获取点赞
app.use('/getperfects',(req,res)=>{
	let productId = req.query.productId;
	let obj = {productId:productId};
	db.find('perfects','perfectsinfo',obj,(data)=>{
		res.send(data);
	})
})
//删除点赞
app.use('/delperfects',(req,res)=>{
	let productId = req.query.productId;
	let obj = {productId:productId};
	db.del('perfects','perfectsinfo',obj,(data)=>{
		res.send(data);
	})
})
app.use('/',(req,res)=>{
	//1、判断cookie是否已经登录过
	// console.log(req.cookies.username);
	// console.log(req.cookies.username == undefined);
	// console.log(req.cookies.username == "undefined");
	if(req.cookies.username && !(req.cookies.username == undefined) && !(req.cookies.username == "undefined")){
		res.render('product',{username:req.cookies.username});
	} else {
		//2、如果没有登录，打开登录
		res.render('login',{});
	}
})

io.on('connection',(socket)=>{
	socket.on('chat',(msg)=>{
		io.emit('send',msg);
	})
})

//app.listen(8989);
http.listen(8989);
