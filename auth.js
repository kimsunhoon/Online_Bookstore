const jwt= require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const ensureAuthorization = (req,res) => {
  try {
    let getJwt  = req.headers["authorization"];

    if(getJwt) {
      let decodedJwt =  jwt.verify(getJwt,process.env.PRIVITE_KEY);
      return decodedJwt;
    } else {
      throw new ReferenceError("jwt must be provided");
    }
  } catch (error) {
    console.log(error.name);
    console.log(error.message);

    return error;
  }
}


module.exports = ensureAuthorization;