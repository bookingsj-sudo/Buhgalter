/* Офлайн-доступ. Стратегия «сеть вперёд, кэш в запасе»:
   когда сеть есть — всегда свежая версия, без неё — последняя сохранённая.
   Кэш-первым здесь нельзя: приложение правится часто, и владелец
   месяцами сидел бы на старой версии, не понимая почему. */
var CACHE='dengi-v2';
var FILES=['./','./index.html','./icon.png'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(FILES).catch(function(){});
  }));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){
      return k===CACHE?null:caches.delete(k);
    }));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r&&r.status===200&&r.type==='basic'){
        var copy=r.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,copy);});
      }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m||caches.match('./index.html');
      });
    })
  );
});
