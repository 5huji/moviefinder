import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverParams, mediaResults, ratings, requestJSON} from '../core.js';
test('电影榜单评分降序且过滤500票以下',()=>{
 const p=discoverParams('war','movie',2); assert.equal(p.sort_by,'vote_average.desc');assert.equal(p['vote_count.gte'],500);assert.equal(p.with_genres,10752);assert.equal(p.page,2);
});
test('英美剧地区及剧集类型过滤',()=>{
 assert.equal(discoverParams('british','tv',1).with_origin_country,'GB');assert.equal(discoverParams('american','tv',1).with_origin_country,'US');assert.equal(discoverParams('scifi','tv',1).with_genres,10765);assert.equal(discoverParams('action','tv',1).with_genres,10759);assert.equal(discoverParams('war','tv',1).with_genres,10768);assert.equal(discoverParams('top','tv',1)['vote_count.gte'],200);
});
test('混合搜索保留电影剧集并排除人物',()=>assert.deepEqual(mediaResults([{id:1,media_type:'person'},{id:2,media_type:'tv'},{id:3,media_type:'movie'}]).map(x=>x.id),[2,3]));
test('评分不存在不能伪造',()=>{
 assert.deepEqual(ratings({Response:'False'}),{imdb:'暂无',rotten:'暂无'});
 assert.deepEqual(ratings({imdbRating:'8.7',Ratings:[{Source:'Rotten Tomatoes',Value:'73%'}]}),{imdb:'8.7 / 10',rotten:'73%'});
 assert.equal(ratings({imdbRating:'N/A'}).imdb,'暂无');
});
test('HTTP和业务错误返回安全提示',async()=>{
 await assert.rejects(requestJSON('https://example.test',undefined,async()=>({ok:false,status:401})),/401/);
 await assert.rejects(requestJSON('https://example.test',undefined,async()=>({ok:true,json:async()=>({success:false})})),/接口/);
});
test('所有电影分类及分页只推荐2010年起上映的作品，剧集不限制年份',()=>{
 for(const category of ['war','scifi','action','top']){
  for(const page of [1,2])assert.equal(discoverParams(category,'movie',page)['primary_release_date.gte'],'2010-01-01');
  assert.equal(discoverParams(category,'tv',1)['primary_release_date.gte'],undefined);
 }
});
test('搜索结果保留2010年以前的电影',()=>{
 const classic={id:278,media_type:'movie',release_date:'1994-09-23'};
 assert.deepEqual(mediaResults([classic]),[classic]);
});
