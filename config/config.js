let env = process.env.NODE_ENV || 'development';

if (env === 'development' || env==='test'){
  let config=require('./config.json');
  let envConf=config[env];
  Object.keys(envConf).forEach((key)=>{
    process.env[key]=envConf[key];
  });
}