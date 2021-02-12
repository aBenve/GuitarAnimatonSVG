
// _____________________________Preparativos_____________________________


const firstString = document.getElementById("_1").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
const secondString = document.getElementById("_2").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
const thirdString = document.getElementById("_3").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
const fouthString = document.getElementById("_4").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
const fifString = document.getElementById("_5").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
const sexString = document.getElementById("_6").getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)

var frets = []

for (var i =1 ; i < 14 ; i++)
{
    frets[i] = document.getElementById("-" + i ).getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
}

console.log(frets)

const strCount = 6


const coors = [firstString,secondString,thirdString,fouthString,fifString,sexString]
const longitude = []
const slope = []
const fretSlope = (frets[1][3] - frets[1][1])/(frets[1][2] - frets[1][0])


for(var i = 0; i < strCount ;i++)
{
    longitude[i] = Math.sqrt(Math.pow(coors[i][0] - coors[i][2], 2) + Math.pow(coors[i][1] - coors[i][3], 2)) -58
    slope[i] = -(coors[i][3] - coors[i][1])/(coors[i][2] - coors[i][0])
}


let t=0
const capoFret = 3


// ________________________________________________________________________

function getIntersectionPoint(note, fret)
{
    //  y = -slope[note-1]*x + b1
    // y2 = fretSlope*x + b2

    var b1 = coors[note-1][1] + slope[note-1]*coors[note-1][0]
    var b2 = frets[fret][1] - fretSlope*frets[fret][0]
    
    //if (fret == 1)
    {
        var x = (b1 - b2) / (slope[note-1] + fretSlope)
        var y = -slope[note-1] * x + b1
    }
    
    return [x,y]
}

// problema, deberia ser un paralelogramo y eso es una cagada de hacer en svg. CORREGIDO
function drawCapo(capoFret){

    if(capoFret == 0)
        return
    
    capoFret = 14 - capoFret
    
    var capo = document.createElementNS("http://www.w3.org/2000/svg", "polyline")

    var x = frets[capoFret][0] + 10 , y = frets[capoFret][1]- 10 // el +- 10 es para ajuste en el dibuje
    var a = frets[capoFret][2] + 17, b = frets[capoFret][3] + 0 // muy a ojo estos valorews, no me gusta

    var x2 = x+slope[1]*30 , y2 = -slope[1]*(x+slope[1]*30 - x) + y
    var a2 = a+slope[1]*30 , b2 = -slope[1]*(a+slope[1]*30 - a) + b


    console.log(x +" , " + y)
    console.log(a +" , " + b)
    var points = [[x,y],[x2, y2],[a,b],[a2,b2]]

    capo.setAttribute("points", points[1][0]+","+points[1][1] +","+points[0][0] +","+points[0][1]+","+points[2][0]+","+points[2][1]+","+points[3][0]+","+points[3][1])
    capo.setAttribute("class","capo")

    capo.style.filter = "url(#drop-shadow-capo)"
    document.getElementById("Capa_1").appendChild(capo)
    
}


function drawFinger(note, fret, duration)
{

    if(fret == 0 || fret - capoFret == 0)
        return 0

    var dot = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
    
    var rx = 4, ry = 4.5
    var cx, cy
    
    // Doy vuelta los trastes
    fret = 14 - fret 

    // Salvo el primer traste
    if(fret == 13)
            cx = (longitude[note-1] - (getIntersectionPoint(note,fret)[0]- coors[note-1][0]))/2 + getIntersectionPoint(note,fret)[0]
    else 
            cx = (getIntersectionPoint(note,fret+1)[0] - getIntersectionPoint(note,fret)[0])/2 + getIntersectionPoint(note,fret)[0]
    cy = coors[note-1][1] - slope[note-1]*(cx - coors[note-1][0])

    
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);

    dot.setAttribute("rx",rx);
    dot.setAttribute("ry",ry);
    dot.setAttribute("fill","white");

    dot.setAttribute("id",fret + "(" + note + ")")

    dot.setAttribute("transform-origin", cx + " " + cy)
    dot.setAttribute("transform"," rotate(" + -slope[note-1]*45/0.5 + ")")
    

    dot.style.filter = "url(#drop-shadow-dots)"

    dot.setAttribute("class","dots")
    dot.style.animationDuration = duration + "ms"

    document.getElementById("Capa_1").appendChild(dot)
    return dot
}


// Funciones animacion //
function circ(timeFraction) {
    return 1 - Math.sin(Math.acos(timeFraction));
}

function makeEaseOut(timing) {
    return function(timeFraction) {
      return 1 - timing(1 - timeFraction);
    }
  }
// /Funciones animacion //

function wave(note, progress)
{
    var stn = document.getElementById("_" + note)
    let coor = stn.getAttribute("d").match(/[+-]?\d+(?:\.\d+)?/g).map(Number)
    
    let xs = []
    for(var i = 0 ; i < longitude[note-1]  ; i++){
        xs.push(i);
    }

    var w,k,A,lamda,f,v,Fu,u,T,t,power
    
    power = 1 - progress
    if(!progress) power = 1
    
    t = progress 
    if(!progress) t = 1

    T = 0.1

    lamda = (2 * longitude[note-1]) / (7-note)
    A =   note/6 * (4*power)
    k = (2 * Math.PI) / lamda
    
    u = (note*10) / longitude[note-1]
    Fu =  Math.pow(lamda/T,2) * u
    v = Math.sqrt(Fu/u)

    f = ((7-note) * v) / (2* longitude[note-1])
    w = 2 * Math.PI * f
    
    let point = xs.map( x => {
        y =  A*Math.sin(k*x)*Math.cos(w*t)
        return [x + coor[0], (y + coor[1]) - slope[note-1] * x]
    })



    let newPath = "M" + point.map(p => {
        return p[0] + "," + p[1]
    }).join(" L")

    stn.setAttribute("d", newPath)
    //console.log("power = " + power)
    //console.log("progress = " + progress)

}

function shine(note ,progress)
{  
    var filterDots = document.getElementById("filterFloodDots")
    var filterFlood = document.getElementById("filterFloodStrings")
    var stn = document.getElementById("_" + note)
    
    if(!progress) progress = 0

    var start = [ [225 , 225, 225* (1 - progress)],[225 , 225* (1 - progress), 225* (1 - progress)],[225* (1 - progress) , 225, 225],[225 * (1 - progress), 225, 225* (1 - progress)],[225 , 225* (1 - progress), 225],[225 * (1 - progress), 225* (1 - progress), 225* (1 - progress)]  ]
    var end = [ [225, 225, 225 * (progress / 1)] ,[225, 225 * (progress), 225 * (progress)],[225* (progress) , 225, 225],[225 * (progress), 225, 225* (progress)],[225 , 225* (progress), 225],[225 * (progress), 225* (progress), 225* (progress)] ]

    stn.style.filter = "url(#drop-shadow-strings)"
    
    if (progress < 0.5)
    {
        filterDots.style.floodOpacity = (progress)  
        stn.style.stroke = "rgb(" + start[6 - note][0] + "," + start[6 - note][1] + "," + start[6 - note][2] + ")"
        filterFlood.style.floodColor = "rgb(" + start[6 - note][0] + "," + start[6 - note][1] + "," + start[6 - note][2] + ")"
        filterFlood.style.floodOpacity = (progress)
    }
    else
    {
        filterDots.style.floodOpacity = (1 - progress)  

        stn.style.stroke = "rgb(" + end[6-note][0] + "," + end[6-note][1] + "," + end[6-note][2] + ")"
        filterFlood.style.floodColor =  "rgb(" + end[6-note][0] + "," + end[6-note][1] + "," + end[6-note][2] + ")"
        filterFlood.style.floodOpacity = (1 - progress)  
    } 

    if(progress == 1)
        stn.style.stroke = "rgb(208,208,208)"

}
function playNote(note,fret, duration) {

    if (capoFret != 0 )
    {
        fret = fret + capoFret
    }
    duration *= 1000 // pongo la duracion en segundos
    function animate({timing, draw, duration}) {
        
        let start = performance.now();
        
        requestAnimationFrame(function animate(time) {
            // timeFraction goes from 0 to 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;
            
            // calculate the current animation state
            let progress = timing(timeFraction)
            
            draw(progress); // draw it
            
            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
            
        });
    }

    animate({
        duration: duration,
        timing:makeEaseOut(circ),
        draw(progress){
            wave(note, progress)
            drawFinger(note, fret, duration)
        }
    })
    animate({
        duration: 2 * duration,
        timing:makeEaseOut(circ),
        draw(progress){
            shine(note,progress)
        }
    })
    
}
// chord = [[6,1],[5,1],[4,3],[3,6],[2,3],[1,1]]
function playChord(chord,duration, diff){
    for(let i=0 ; i < strCount; i++)
    {
        if(chord[strCount-i-1] >= 0 )
            setTimeout(() => {playNote(i+1,chord[strCount-i-1],duration)},tiempo)
    }
    tiempo += duration*1000 + diff
}

/*
    6 - yellow
    5 - red
    4 - cyan
    3 - green
    2 - purple
    1 - silver
*/

/*
    1 - redonda
    1/2 - blanca
    1/4 - negra
    1/8 - corchea
    1/16 - semicorchea
    1/32 - fusa
    1/64 - semifusa
*/

/* el pulso define que tan largo es una nota
    Como se suele usar la negrita como la forma estandar de indicar cuantos pulsos por min hay
    pongo la negrita como 1 pulso
*/
const pulso = [4 , 2 , 1 , 1/2 , 1/4, 1/8, 1/16]
// tempo - pulsos por minuto
const tempo = 85
/* Entidad formada por el pulso asentuado mas los demas pulsos.
 Se lo puede dividir en 2 o en 3
    El compas se forma por 2 numeros
    por ejemplo : 2/4 3/4 4/4 (para el caso en donde subdividimos el pulso del compas en 2 )
    En donde el numerador indica la cantidad de pulsos por COMPAS
    Y el denominador indica que tipo de pulso es. sabiendo que una negra es 1/4,
    corchea 1/8, blanca 1/2 etc

    Notar que en un 3/4 entran cuatro pulsos negros por COMPAS 
    y en un 4/4 entran 4 pulsos negros por COMPAS

    Si cada pulso del compas esta subdividido en 3, como por ejemplo en el 6/8
    este quiere decir que tenemos 6 pulsos de corchea por COMPAS
*/
// se llama metrica el el conjunto de numero que define el compas
const metrica = [4,4]
// por ejemplo: si tempo es de 60 => una negra es de 1 seg, corchea de 0.5, etc
/* recordamos que existen las figuras comunes con un punto al final
esto implica que se le suma a la duracion de la nota en si la duracion de 
la nota un nivel de duiracion por debajo
*/
let duracionDePulso = [[],[]]
for(let i=0; i < 7;i++)
{
    duracionDePulso[0][i] = 60/tempo * pulso[i] 
    if(i < 6)
        duracionDePulso[1][i] = 60/tempo * pulso[i]  +  60/tempo * pulso[i+1]
}
const normal = 0, conPunto = 1

let tiempo = 1000 // arranco 1 seg despues de iniciado el programa para no tener problemas con que se ejecute prinmero la primer parte

mi = [0,2,2,0,0,-1]
doo= [0,3,2,0,1,-1] 
semiSol = [3,-1,0,0,0,-1]
semiRe = [-1,-1,0,2,3,-1]


drawCapo(capoFret)


function playNoteOnTime(note, fret, duration, diff)
{
    setTimeout(() => {playNote(note,fret,duration)},tiempo); 
    tiempo += duration*1000 + diff 
}



playNoteOnTime(6,2,duracionDePulso[normal][3],0)
playNoteOnTime(6,3,duracionDePulso[normal][3],0)
playNoteOnTime(4,0,duracionDePulso[normal][3],0)
playNoteOnTime(3,0,duracionDePulso[normal][3],0)
playChord([-1,-1,-1,-1,3,3],duracionDePulso[normal][3],0)
playNoteOnTime(3,0,duracionDePulso[normal][3],0)

playNoteOnTime(6,2,duracionDePulso[normal][3],0)
playNoteOnTime(6,0,duracionDePulso[normal][3],0)
playNoteOnTime(4,0,duracionDePulso[normal][3],0)
playNoteOnTime(3,0,duracionDePulso[normal][3],0)
playChord([-1,-1,-1,-1,3,3],duracionDePulso[normal][3],0)
playNoteOnTime(3,0,duracionDePulso[normal][3],0)


/*
playChord(mi,duracionDePulso[normal][3],0)
playChord(mi,duracionDePulso[normal][3],0)
playChord(mi,duracionDePulso[normal][3],0)

playChord(doo,duracionDePulso[normal][3],0)
playChord(doo,duracionDePulso[normal][3],0)
playChord(doo,duracionDePulso[normal][3],0)

playChord(semiSol,duracionDePulso[normal][3],0)
playChord(semiSol,duracionDePulso[normal][3],0)
playChord(semiSol,duracionDePulso[normal][3],0)

playChord(semiRe,duracionDePulso[normal][3],0)
playChord(semiRe,duracionDePulso[normal][3],0)
playChord(semiRe,duracionDePulso[normal][3],0)


setTimeout(() => {playNote(6,0,1)},10000); 
setTimeout(() => {playNote(4,2,1)},10000);

setTimeout(() => {playNote(6,0,0.5)},10500);
setTimeout(() => {playNote(4,2,0.5)},11000);
setTimeout(() => {playNote(3,0,0.5)},11500);
setTimeout(() => {playNote(2,0,0.5)},12000);
setTimeout(() => {playNote(2,0,0.5)},12500);

*/


/*
setTimeout(() => {playNote(6,1,1000)},2000);
setTimeout(() => {playNote(5,2,1000)},2000);
setTimeout(() => {playNote(4,2,1000)},2000);
setTimeout(() => {playNote(3,1,1000)},2000);
setTimeout(() => {playNote(2,1,1000)},2000);
setTimeout(() => {playNote(1,1,1000)},2000);

setTimeout(() => {playNote(6,1,1000)},3000);
setTimeout(() => {playNote(5,2,1000)},3000);
setTimeout(() => {playNote(4,2,1000)},3000);
setTimeout(() => {playNote(3,1,1000)},3000);
setTimeout(() => {playNote(2,1,1000)},3000);
setTimeout(() => {playNote(1,1,1000)},3000);
*/



/*

CORREGIR

power esta dando problemas, la animacion dura lo que tiene que durar pero la cueda queda
en cualquier lado por que power no llega a 0 

// 
Tenemos que hacer que el periodo de la onda estacionaria este controlado poara que siempre
vuelva al estado inicial con duraciones del pulso determinadas

El timpo esta mal
//


No esta implementado lo mismo para el brillo de la cuerda y no se como lo hare

                                            CORREGIDO

Terminamos la parte de la onda de las cuerdas y su cambio de color degradado.
Falta hacer que aparescan y desaparesca cada fingerDot de manera degrradada y en su lugar


Agregue las luces al mismo tiempo que cambian de color las cuerdas
Pude hacer aparecer los finderDots, pero falta ubicarlos


                                            CORREGIDO
                                            
Termine de ubicar los fingerDots pero por alguna razon no funcionan con la animacion para aparecer
y desaparecer.

Estaria bueno agregar un capo dibujado 


                                            CORREGIDO
Los fingerDots andan de 10. Estaria bueno quiza que cambien de color con el tiempo

                                            CORREGIDO
Los fingerdots seteados en blanco y las cuerdas tienen su color correspondiente
queda exelente
                                            CORREGIDO
Agregue el capo con una polylinea. Le cree su propio filtro de blur y queda exelente
Tambien agregue un pocod e toeira musical
Hay que ver bien como tratamos a el tiempo entre notas


Problemas entre notas, no se como funciona el tiempo entre notas


                                            CORREGIDO
Necesito dividir todo en compases y usar la metrica para determinar el tiempo entre notas
de manera optima, como hacerlo ni idea
*/