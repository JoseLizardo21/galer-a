let contenedor, bd, botones, nue_punt;
let arreglo = [];
contenedor = document.getElementById("contenedor");
contenedor.innerHTML ="<p>DEBES DE AGREGAR UNA IMAGEN</p>"

function iniciar(){
  let caja_fav = document.getElementById("caja_fav")
  caja_fav.addEventListener("click", caja_img_fav);
  let btn_inicio = document.getElementById("btn_inicio");
  btn_inicio.addEventListener("click", ()=>location.reload());
   let btn_agr_ft = document.getElementById("btn_agr_ft");
   btn_agr_ft.addEventListener("click", cj_agr_img); 
   let solicitud = indexedDB.open("bd_fotos");
   solicitud.addEventListener("error", (evento)=>{
    alert(`Error: ${evento.code} ${evento.message}`);
   });
   solicitud.addEventListener("success", comenzar);
   solicitud.addEventListener("upgradeneeded", crearbd);
}
function caja_img_fav(){
  contenedor.innerHTML ="<p>DEBES DE AGREGAR UNA IMAGEN A FAVORITOS</p>"
  let transaccion = bd.transaction(["fotos"]);
  let almacen = transaccion.objectStore("fotos");
  puntero = almacen.openCursor();
  puntero.addEventListener("success", mostrar_img_favs)
}

function mostrar_img_favs(evento){
  let lector = new FileReader();
  let puntero = evento.target.result;
  if(puntero.value.fav===true){
    let datos1 = puntero.value.nombre;
    let datos2 = puntero.value.fecha;
    lector.readAsDataURL(puntero.value.archivo);
    if(contenedor.innerHTML === "<p>DEBES DE AGREGAR UNA IMAGEN A FAVORITOS</p>"){
      contenedor.innerHTML = "";
    }
    lector.addEventListener("load", (evento)=>{
      let resultado = evento.target.result;
      contenedor.innerHTML += `<div class="cajas_img"><img src="${resultado}" class="imgs_albun"> 
      <div class="caja_datos_fotos">
      
      <p style="margin-top:25px">${datos1}</p>
      <p>${datos2}</p>
      </div>
      </div>`;
    });
    puntero.continue();
  };
}

function comenzar(evento){
  bd = evento.target.result;
  let transaccion = bd.transaction(["fotos"]);
  let almacen = transaccion.objectStore("fotos");
  let puntero = almacen.openCursor();
  puntero.addEventListener("success", mostrarlista);
  botones = document.getElementsByClassName("btn_agr_fav");
  setTimeout(()=>{
    for (let index = 0; index < botones.length; index++) {
        let id = botones[index].id;
        botones[index].addEventListener("click",()=>{
            agr_fav(id,index);
        });
    }
  },1000)
};

function crearbd(evento){
  let basededatos = evento.target.result;
  let almacen = basededatos.createObjectStore("fotos",{keyPath: "id", autoIncrement: true});
  almacen.createIndex("BuscarFecha", "fecha",{unique: false});
};

function cj_agr_img(){
  contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = `
  
                <div id="previsualizador">
                 <div id="caja_formulario">
                   <form name="formulario">
                     <label for="archivos" style="cursor: pointer">Hacer click para agregar imagen</label>
                     <input type="file" id="archivos" name="archivos" style="width:0;">  
                     </form>
                  </div>
                </div>

                <div id="caja_datos_fotos"  style="width:300px; height: 300px;">
                <label for="título">Título de la foto</label>
                <input type="text" id="titulo" name="titulo" style="border: 0; text-align: center;" placeholder="Escribe aquí...">
                <label for="btn_subir_img" style="height:30px">Escribe un recordatorio o un comentario</label>
                <textarea style="border: 0; height:240px; resize:none; text-align: center;" placeholder="Escribe aquí..." class="area-text"></textarea>
                <button type="button" id="btn_subir_img">Subir foto</button>
                </div>`;
  let archivos = document.getElementById("archivos");
  archivos.addEventListener("change", previ_sbr);
};
function previ_sbr(evento){
  let archivos = evento.target.files;
  let archivo = archivos[0];
  let lector = new FileReader();
  lector.addEventListener("load", mostrar_prev);
  lector.readAsDataURL(archivo);
  let boton = document.getElementById("btn_subir_img");
  boton.addEventListener("click", ()=>{
    let titulo = document.getElementById("titulo").value
    if(titulo != ""){
      let fecha = new Date();
      let transaccion = bd.transaction(["fotos"],"readwrite");
      let almacen = transaccion.objectStore("fotos");
      transaccion.addEventListener("complete", ()=> {
        
        location.reload()});
        almacen.add({nombre: titulo,archivo,fav:false, fecha: fecha.toLocaleDateString()});
    }else{
      alert("Debe de llenar el apartado de título");
    }
    });
};

function mostrar_prev(evento){
  let imagen = evento.target.result;
  let cj_prev = document.getElementById("previsualizador");
  cj_prev.innerHTML = `<img src="${imagen}" id="imagen_prev">`
};
function mostrarlista(evento){
  let lector = new FileReader();
  let puntero = evento.target.result;
  if(puntero){
    let obj_img = puntero.value;
    arreglo.push(obj_img);
    let datos1 = puntero.value.nombre;
    let datos2 = puntero.value.fecha;
    lector.readAsDataURL(puntero.value.archivo);
    if(contenedor.innerHTML === "<p>DEBES DE AGREGAR UNA IMAGEN</p>"){
      contenedor.innerHTML = "";
    }
    lector.addEventListener("load", (evento)=>{
      let objs_img = puntero.value; 
      let resultado = evento.target.result;
      contenedor.innerHTML += `<div class="cajas_img"><img src="${resultado}" class="imgs_albun"> 
      <div class="caja_datos_fotos">
      
      <p style="margin-top:25px">${datos1}</p>
      <p>${datos2}</p>
      <div class="caja_btns" style="margin-top:10px">
      <button type="button" class="btn_del_img btn_agr_fav" id="${obj_img.id}">
      <img src="${function(obj){
        if(obj===false){
          return "/imagenes/icono_corazon.png";
        }
        if(obj===true){
          return "/imagenes/icono_corazon2.png";
        }
      }(obj_img.fav)}" class="icon_bas">
      </button>

      <button type="button" onclick="remover_imagen(\ ${objs_img.id} \)" class="btn_del_img">
      <img src="/imagenes/icon_bas.png" class="icon_bas">
      </button>
      </div>
      </div>
      </div>`;
    });
    puntero.continue();
  };
};
function remover_imagen(clave){
  if(confirm("¿Estas seguro?")){
    let transaccion = bd.transaction(["fotos"], "readwrite");
    let almacen =  transaccion.objectStore("fotos");
    almacen.delete(clave);
    transaccion.addEventListener("complete", ()=> location.reload());
  }
};
function agr_fav(id, index){
    let solicitud = indexedDB.open("bd_fotos");
    solicitud.addEventListener("success",(evento)=>{inciciar_cam(evento,id, index)})
}
function inciciar_cam(evento,id, index){
    let obj_mod = arreglo[index];
    obj_mod.fav = true;
    bd = evento.target.result;
        let transaccion = bd.transaction(["fotos"],"readwrite");
        let almacen = transaccion.objectStore("fotos");
        almacen.put(obj_mod);
        transaccion.addEventListener("complete", ()=>{ alert("Se agregó a favoritos");location.reload()});
}
window.addEventListener("load", iniciar);