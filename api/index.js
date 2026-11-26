import { createApp } from '../server/app.mjs';
import {newsSourceHandler} from '../server/news-source.mjs';

// Vercel serves dist/ as static assets and routes /api/* to this function.
// Unlike server/index.mjs, this entry point must not bind to a TCP port.
const app=createApp();
export default function handler(req,res){
  if(new URL(req.url,'https://unigate-web.vercel.app').pathname==='/api/news-source')return newsSourceHandler(req,res);
  return app(req,res);
}
