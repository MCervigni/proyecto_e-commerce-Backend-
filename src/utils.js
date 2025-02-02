export const processServerError=(res, error)=>{
    console.log(error)
    if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" , message: error.message });
      }
}