
const express=require('express');
const app=express();
app.get('/',(req,res)=>res.json({name:'FitFlow API'}));
app.listen(3000);
