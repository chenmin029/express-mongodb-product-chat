// 引入数据库
const MongoClient=require('mongodb').MongoClient;
// 数据库地址
const url="mongodb://localhost:27017";

// 把数据库连接的操作，封装起来
function _connect(callback){
	// 连接数据库
	MongoClient.connect(url,function(err,db){
		if(err) throw err;
		// callback函数 数据连接上以后会执行这个函数 db代表连接成功以后的数据
		callback(db)
		

	})
}

module.exports.insert=function(dbname,colname,obj,callback){
	_connect(function(db){

		if(!(obj instanceof Array)){
			obj=[obj]
		}
		db.db(dbname).collection(colname).insertMany(obj,(err,result)=>{
			if(err) throw err;
			console.log('插入数据成功');
			// 操作完毕，一般需要关闭数据文件
			db.close();
			// result返回的是插入成功的数据
			// res.send(result);
			callback(result)
		})
	})
}

module.exports.find=function(dbname,colname,obj,callback,sort={},skip=0,limit=0){
	_connect(function(db){
		db.db(dbname).collection(colname).find(obj).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
			if(err) throw err;
			db.close();
			callback(result)
		})
	})
}
module.exports.update=function(dbname,colname,obj,updateobj,callback){
	_connect(function(db){
		db.db(dbname).collection(colname).updateOne(obj,{$set:updateobj},function(err,res) {
	        if (err) throw err;
	       
	        db.close();
	        callback(res);
	    });
	})
	
}
module.exports.del=function(dbname,colname,obj,callback){
	_connect(function(db){
		db.db(dbname).collection(colname).deleteOne(obj,(err,result)=>{
			if(err) throw err;
			db.close();
			callback(result)
		})
	})
}
