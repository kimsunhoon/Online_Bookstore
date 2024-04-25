const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const allBooks = (req,res)=>{
  let allBooksRes = {}; 
  const {category_id, newBook, limit, currentPage} = req.query;

  let offset = limit * (currentPage-1);
  let sql = 'SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes where liked_book_id=books.id) AS likes FROM books';
  let values = [];

  if(category_id && newBook){
    sql += ' WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(),INTERVAL 1 YEAR) AND NOW()';
    values.push(category_id);
  } else if(category_id){
    sql += ' WHERE category_id=?';
    values.push(category_id); 
  } else if(newBook) {
    sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(),INTERVAL 1 YEAR) AND NOW()';
  }

  sql+=' LIMIT ? OFFSET ?';
  values.push(parseInt(limit),offset);
  conn.query(sql,values, 
    (err,results)=>{
      if(err){
        console.log(err)
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      if(results.length){
        results.map(function(results) {
          results.pubDate = results.pub_date;
          delete results.pub_date;
        });
        allBooksRes.books = results;
      } else {
        return res.status(StatusCodes.NOT_FOUND).end();
      }
  });

    sql='SELECT FOUND_ROWS()';
    conn.query(sql, 
      (err,results)=>{
        if(err){
          console.log(err)
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        let pagenation = {};
        pagenation.currentPage = currentPage;
        pagenation.totalCount = results[0]["found_rows()"];

        allBooksRes.pagenation = pagenation;

        return res.status(StatusCodes.OK).json(allBooksRes);
    });
}

const booksDetail = (req,res)=>{

  let authorization = ensureAuthorization(req,res);

  if(authorization instanceof jwt.TokenExpiredError){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      'message' : "로그인 세션이 만료되었습니다"
    });
  } else if(authorization instanceof jwt.JsonWebTokenError){
    return res.status(StatusCodes.BAD_REQUEST).json({
      'message' : "잘못된 토큰 형식입니다"
    });
  } else if (authorization instanceof ReferenceError){
    let book_id = req.params.id;
    let sql = `SELECT *, 
              (SELECT count(*) FROM likes where liked_book_id=books.id) AS likes
              FROM books
              LEFT JOIN category 
              ON books.category_id = category.category_id
              WHERE books.id=?;`;
    let values = [book_id];
    conn.query(sql,values,
      (err,results)=>{  
        if(err){
          console.log(err)
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        if(results[0]){
          return res.status(StatusCodes.OK).json(results[0]);
        } else {
          return res.status(StatusCodes.NOT_FOUND).end();
        }
      });
  } else {
    let book_id = req.params.id;
    let sql = `SELECT *, 
              (SELECT EXISTS(SELECT * FROM likes where user_id=? AND liked_book_id=?)) AS liked,
              (SELECT count(*) FROM likes where liked_book_id=books.id) AS likes
              FROM books
              LEFT JOIN category 
              ON books.category_id = category.category_id
              WHERE books.id=?;`;
    let values = [authorization.id,book_id,book_id];
    conn.query(sql,values,
      (err,results)=>{  
        if(err){
          console.log(err)
          return res.status(StatusCodes.BAD_REQUEST).end();
        }
        if(results[0]){
          return res.status(StatusCodes.OK).json(results[0]);
        } else {
          return res.status(StatusCodes.NOT_FOUND).end();
        }
      });
  }
}

module.exports = {allBooks,booksDetail};