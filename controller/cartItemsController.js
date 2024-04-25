const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const addCart = (req,res)=>{
  const {book_id,quantity} = req.body;
  let authorization = ensureAuthorization(req,res);

  if(authorization instanceof jwt.TokenExpiredError){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      'message' : "로그인 세션이 만료되었습니다"
    });
  } else if(authorization instanceof jwt.JsonWebTokenError){
    return res.status(StatusCodes.BAD_REQUEST).json({
      'message' : "잘못된 토큰 형식입니다"
    });
  } else {
    let sql = 'INSERT INTO cartItems (book_id,quantity,user_id) VALUES (?,?,?);';
    let values = [book_id,quantity,authorization.id];
    conn.query(sql,values,
      (err,results)=>{
        if(err){
          console.log(err);
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        return res.status(StatusCodes.OK).json(results);
      }); 
    }
};

const getCartItems = (req,res)=>{
  let authorization = ensureAuthorization(req,res);
  const {selected} = req.body;

  if(authorization instanceof jwt.TokenExpiredError){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      'message' : "로그인 세션이 만료되었습니다"
    });
  } else if(authorization instanceof jwt.JsonWebTokenError){
    return res.status(StatusCodes.BAD_REQUEST).json({
      'message' : "잘못된 토큰 형식입니다"
    });
  } else {
    let sql = `SELECT cartItems.id,book_id,title,summary,quantity,price
            FROM cartItems LEFT JOIN books 
            ON books.id = cartItems.book_id
            WHERE user_id=?`;
            
    let values = [authorization.id];

    if(selected) {
      sql += ` AND cartItems.id IN (?)`;
      values.push(selected);
    } 
    conn.query(sql,values,
      (err,results)=>{
        if(err){
          console.log(err);
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        return res.status(StatusCodes.OK).json(results);
      }); 
    }
};

const removeCartItems = (req,res)=>{
  let authorization = ensureAuthorization(req,res);

  if(authorization instanceof jwt.TokenExpiredError){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      'message' : "로그인 세션이 만료되었습니다"
    });
  } else if(authorization instanceof jwt.JsonWebTokenError){
    return res.status(StatusCodes.BAD_REQUEST).json({
      'message' : "잘못된 토큰 형식입니다"
    });
  } else {
    const cartItemsId = req.params.id;

    let sql = `DELETE FROM cartItems WHERE id=?`;

    conn.query(sql,cartItemsId,
      (err,results)=>{
        if(err){
          console.log(err);
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        return res.status(StatusCodes.OK).json(results);
      });
    }
};

module.exports = {addCart, getCartItems, removeCartItems};