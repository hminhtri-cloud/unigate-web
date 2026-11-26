// A narrow relay for the official Ministry pages. It never accepts arbitrary
// hosts, forwards credentials, executes source HTML, or touches the database.
const entries=new Set(['/chuyen-de-giao-duc-va-dao-tao/giao-duc-dai-hoc','/tin-tuc/tin-tong-hop2']);
export function isMinistryUrl(input){
  try{const url=new URL(input),path=decodeURIComponent(url.pathname);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&!url.hash&&!url.search&&['moet.gov.vn','www.moet.gov.vn'].includes(url.hostname)&&(entries.has(path)||/^\/tin-tuc\/tin-tong-hop2\/[^/?#]+\.html$/.test(path));}catch{return false;}
}
export function createNewsSourceHandler(fetchPage=fetch){
  return async(req,res)=>{
    const send=(status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(body));};
    if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'method_not_allowed'});}
    const input=new URL(req.url,'https://unigate-web.vercel.app').searchParams.get('url');
    if(!input||input.length>1800||!isMinistryUrl(input))return send(400,{error:'unsupported_official_url'});
    let url=input;
    try{
      for(let step=0;step<5;step++){
        if(!isMinistryUrl(url))throw new Error('Unsupported redirect');
        const response=await fetchPage(url,{redirect:'manual',signal:AbortSignal.timeout(10000),headers:{'user-agent':'UniGate-News/1.0 (official admissions news index)','accept':'text/html,application/xhtml+xml'}});
        if([301,302,303,307,308].includes(response.status)){
          const location=response.headers.get('location');await response.body?.cancel();
          if(!location)throw new Error('Missing redirect');url=new URL(location,url).href;continue;
        }
        if(!response.ok||!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type')||'')){await response.body?.cancel();throw new Error('Not official HTML');}
        const chunks=[];let size=0;
        for await(const chunk of response.body){size+=chunk.length;if(size>2*1024*1024)throw new Error('Source too large');chunks.push(chunk);}
        const html=new TextDecoder().decode(Buffer.concat(chunks));
        res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=300');
        return send(200,{sourceUrl:url,retrievedAt:new Date().toISOString(),html});
      }
      throw new Error('Too many redirects');
    }catch{return send(502,{error:'official_source_unavailable'});}
  };
}
export const newsSourceHandler=createNewsSourceHandler();
