exports.id=825,exports.ids=[825],exports.modules={28301:()=>{},53005:(e,t,i)=>{Promise.resolve().then(i.bind(i,4244))},39163:(e,t,i)=>{Promise.resolve().then(i.t.bind(i,13724,23)),Promise.resolve().then(i.t.bind(i,35365,23)),Promise.resolve().then(i.t.bind(i,44900,23)),Promise.resolve().then(i.t.bind(i,44714,23)),Promise.resolve().then(i.t.bind(i,45392,23)),Promise.resolve().then(i.t.bind(i,8898,23))},4244:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>NotFound});var a=i(30784),s=i(11440),r=i.n(s);function NotFound(){return(0,a.jsxs)("div",{style:{minHeight:"100vh",background:"linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px",textAlign:"center"},children:[a.jsx("div",{style:{width:"80px",height:"80px",background:"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"24px"},children:a.jsx("i",{className:"ri-error-warning-line",style:{color:"white",fontSize:"36px"}})}),a.jsx("h1",{style:{fontSize:"48px",fontWeight:"700",color:"#1f2937",marginBottom:"16px"},children:"404"}),a.jsx("h2",{style:{fontSize:"24px",fontWeight:"600",color:"#1f2937",marginBottom:"8px"},children:"P\xe1gina no encontrada"}),a.jsx("p",{style:{fontSize:"16px",color:"#6b7280",marginBottom:"32px"},children:"La p\xe1gina que buscas no existe o ha sido movida."}),a.jsx(r(),{href:"/",style:{background:"linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",color:"white",padding:"12px 24px",borderRadius:"12px",textDecoration:"none",fontWeight:"500",transition:"transform 0.2s"},className:"!rounded-button",children:"Volver al inicio"})]})}},35345:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>RootLayout,metadata:()=>o,viewport:()=>n});var a=i(4656),s=i(2999),r=i.n(s);i(67272);let o={title:"ProFitness - Nutrici\xf3n y Fitness",description:"Nutre tu progreso, domina tus resultados. Aplicaci\xf3n completa de nutrici\xf3n y fitness.",manifest:"/manifest.json",keywords:["nutrici\xf3n","fitness","salud","dieta","ejercicio","wellness"],authors:[{name:"ProFitness Team"}],creator:"ProFitness",publisher:"ProFitness",formatDetection:{email:!1,address:!1,telephone:!1},appleWebApp:{capable:!0,statusBarStyle:"default",title:"ProFitness"},applicationName:"ProFitness",category:"health",classification:"Health & Fitness",robots:"index, follow",openGraph:{title:"ProFitness - Nutrici\xf3n y Fitness",description:"Nutre tu progreso, domina tus resultados",type:"website",locale:"es_ES",siteName:"ProFitness"},twitter:{card:"summary_large_image",title:"ProFitness - Nutrici\xf3n y Fitness",description:"Nutre tu progreso, domina tus resultados"},icons:{icon:[{url:"https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/3996af3f516097f6140fa851c5b0df5f.png",sizes:"32x32",type:"image/png"},{url:"https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/7625649a127219bd3a34457055bff123.png",sizes:"152x152",type:"image/png"},{url:"https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/e0de0a483af0a27a07c5f5d0c4bdfb20.png",sizes:"192x192",type:"image/png"},{url:"https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/a9bb3a212a263e3f4d517d4f87414af6.png",sizes:"512x512",type:"image/png"}],apple:[{url:"https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/2834b0a0b957a555e9a866f31c9e4d63.png",sizes:"180x180",type:"image/png"}]},other:{"mobile-web-app-capable":"yes","apple-mobile-web-app-capable":"yes","apple-mobile-web-app-status-bar-style":"black-translucent","apple-mobile-web-app-title":"ProFitness","application-name":"ProFitness","msapplication-TileColor":"#3b82f6","msapplication-config":"/browserconfig.xml","theme-color":"#3b82f6"}},n={width:"device-width",initialScale:1,maximumScale:1,userScalable:!1,themeColor:"#3b82f6",colorScheme:"light",viewportFit:"cover"};function RootLayout({children:e}){return(0,a.jsxs)("html",{lang:"es",children:[(0,a.jsxs)("head",{children:[a.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),a.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),a.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Pacifico&display=swap",rel:"stylesheet"}),a.jsx("link",{href:"https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css",rel:"stylesheet"}),a.jsx("script",{src:"https://accounts.google.com/gsi/client",async:!0,defer:!0})]}),(0,a.jsxs)("body",{className:r().className,children:[e,a.jsx("script",{dangerouslySetInnerHTML:{__html:`
              // Registrar Service Worker para actualizaciones autom\xe1ticas
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered: ', registration);
                      
                      // Escuchar actualizaciones disponibles
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // Mostrar notificaci\xf3n de actualizaci\xf3n disponible
                              if (window.showUpdateNotification) {
                                window.showUpdateNotification();
                              }
                            }
                          });
                        }
                      });
                    })
                    .catch(registrationError => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Verificar si hay datos para restaurar despu\xe9s de una actualizaci\xf3n
              window.addEventListener('load', () => {
                const hasCloudSync = localStorage.getItem('google_access_token');
                const dataRestored = localStorage.getItem('dataRestored');
                
                // Si hay sincronizaci\xf3n habilitada pero no hay datos restaurados recientemente
                if (hasCloudSync && !dataRestored) {
                  // Verificar si hay pocos datos locales (posible p\xe9rdida por actualizaci\xf3n)
                  const userData = localStorage.getItem('userData');
                  const nutritionKeys = Object.keys(localStorage).filter(key => key.startsWith('nutrition_'));
                  
                  if (!userData || nutritionKeys.length === 0) {
                    // Posible p\xe9rdida de datos, ofrecer restauraci\xf3n
                    setTimeout(() => {
                      if (window.showDataRestorePrompt) {
                        window.showDataRestorePrompt();
                      }
                    }, 2000);
                  }
                }
              });
            `}})]})]})}},44293:(e,t,i)=>{"use strict";i.r(t),i.d(t,{$$typeof:()=>o,__esModule:()=>r,default:()=>l});var a=i(95153);let s=(0,a.createProxy)(String.raw`C:\Users\biges\OneDrive\Escritorio\profitnessapp\app\not-found.tsx`),{__esModule:r,$$typeof:o}=s,n=s.default,l=n},67272:()=>{}};