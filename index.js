var macAddress = window.location.href;

var JSONConfig = {
  nodes:[
    ['a', 25],
    ['b', 100],
    ['c', 75],
    ['d', 55],
    ['e', 45],
    ['f', 75],
    ['root', 10]
  ],

  edges:[
    ['a', 'b'],
    ['b', 'd'],
    ['d', 'a'],
    ['a', 'c'],
    ['c', 'f'],
    ['a', 'b'],
    ['c', 'e'],
    ['f', 'b'],
    ['e', 'b'],
    ['e', 'a'],
    ['f', 'e'],
    ['root', 'e']
  ],
  root:['root']
}
var riskGradient = [
  '#ff0000',
  '#fcca00',
  '#fc6900',
  '#00ff00'
]


function removeCharacter(address){
    address.replace('https://hubenov.org/', '');
    return address;
}

function fetchDataFromDB(){
   /* macAddress = removeCharacter(macAddress);
    fetch("http://37cddd59b076.ngrok.io/users/Ivan")
    .then(response => {
       return response.json()
    })
    .then(data=> console.log(data));*/
}

fetchDataFromDB();

(function($){
  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    base_image = new Image();
    base_image.src = './images/logo.png';
    ctx.drawImage(base_image, 100, 100);
    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height);
        particleSystem.screenPadding(100) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 

        ctx.fillStyle = "black"
        ctx.fillRect(0,0, canvas.width, canvas.height)
        ctx.set
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          var rad = 20;
          if(node.name == JSONConfig.root){
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 7;
            rad+=10;
          }
          ctx.beginPath();
          if(node.data.riskFactor <= 25)
            ctx.fillStyle = riskGradient[3];
          else if(node.data.riskFactor > 25 && node.data.riskFactor <= 50)
            ctx.fillStyle = riskGradient[2];
          else if(node.data.riskFactor <= 75 && node.data.riskFactor > 50 )
            ctx.fillStyle = riskGradient[1];
          else
            ctx.fillStyle = riskGradient[0];

          ctx.arc(pt.x, pt.y - 5, rad, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          ctx.font = "bold 15px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.fillText(`${node.data.riskFactor}`, pt.x, pt.y);
        })    	
        ctx.drawImage(base_image, 50, 50);
		
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    
  $(document).ready(function(){
    var sys = arbor.ParticleSystem(25, 2500, 0.8  , 90) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    var nodeCount = JSONConfig.nodes.length;
    var edgeCount = JSONConfig.edges.length;
    for(var i = 0; i < nodeCount; i++)
      sys.addNode(JSONConfig.nodes[i][0], {riskFactor: JSONConfig.nodes[i][1]});
    for(var i = 0; i < edgeCount; i++)
      sys.addEdge(JSONConfig.edges[i][0], JSONConfig.edges[i][1]);
  })

})(this.jQuery)