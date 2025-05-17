export const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
  };

  export const sendToken=(res,code,tokenData,token,message)=>{

    return res.status(code).cookie("access_token",token,cookieOptions).json({
        success:true,
        tokenData,
        message
    })
  };