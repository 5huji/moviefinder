const TMDB_KEY='af41952aa1ec31eea3afb84d2749d617';
const OMDB_KEY='e92fb359';
export function discoverParams(category,type,page){
 const p={sort_by:'vote_average.desc','vote_count.gte':type==='movie'?500:200,include_adult:false,page};
 const genres={war:[10752,10768],scifi:[878,10765],action:[28,10759]};
 if(genres[category])p.with_genres=genres[category][type==='movie'?0:1];
 if(category==='american'||category==='british'){p.with_origin_country=category==='american'?'US':'GB';p.with_original_language='en';}
 return p;
}
export function mediaResults(items){return items.filter(x=>['movie','tv'].includes(x.media_type));}
export function ratings(data){return {imdb:data?.imdbRating&&data.imdbRating!=='N/A'?`${data.imdbRating} / 10`:'暂无',rotten:data?.Ratings?.find(x=>x.Source==='Rotten Tomatoes')?.Value||'暂无'};}
export async function requestJSON(url,signal,fetcher=fetch){
 const response=await fetcher(url,{signal:signal||AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`接口请求失败（${response.status}），请稍后重试。`);
 const data=await response.json();
 if(data.success===false)throw new Error('接口暂不可用，请稍后重试。');
 return data;
}
export function tmdb(path,params={},signal){return requestJSON(`https://api.themoviedb.org/3/${path}?${new URLSearchParams({api_key:TMDB_KEY,language:'zh-CN',...params})}`,signal);}
const omdbCache=new Map();
export async function omdb(id,signal){
 if(omdbCache.has(id))return omdbCache.get(id);
 const data=await requestJSON(`https://www.omdbapi.com/?${new URLSearchParams({apikey:OMDB_KEY,i:id})}`,signal);
 if(data.Response==='False')throw new Error('补充评分暂不可用或该作品尚未收录。');
 omdbCache.set(id,data);return data;
}
