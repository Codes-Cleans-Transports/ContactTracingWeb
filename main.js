var macAddress = window.location.href;
var inContactWith = 0;

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
  getInformation();
  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    logo = new Image();
    logo.src = './images/logo.png';
    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screenSize(canvas.width, canvas.height);
        particleSystem.screenPadding(100)
        that.initMouseHandling()
      },
      
      redraw:function(){
        ctx.fillStyle = table.backGroundColor;
        ctx.strokeStyle = table.borderColor;
        ctx.fillRect(0,0, canvas.width, canvas.height)
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        particleSystem.eachEdge(function(edge, pt1, pt2){
          ctx.strokeStyle = edges.strokeStyle;
          ctx.lineWidth = edges.lineWidth;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        particleSystem.eachNode(function(node, pt){
          var rad = nodes.radius;
          if(node.name == graph.root){
            ctx.strokeStyle = nodes.root.strokeStyle;
            ctx.lineWidth = nodes.root.lineWidth;
            rad+=nodes.root.radIncrease;
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
          ctx.font = text.percentage.font;
          ctx.fillStyle = text.percentage.fillStyle;
          ctx.textAlign = text.percentage.align;
          ctx.fillText(`${node.data.riskFactor}`, pt.x, pt.y);
          ctx.drawImage(logo, logoInfo.x, logoInfo.y);
          drawText(ctx, canvas)
        })    	
       ;
		
      },
      
      initMouseHandling:function(){
        var dragged = null;
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
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
         $(canvas).mousedown(handler.clicked);

      },
      
    }
    return that
  }    
  $(document).ready(function(){
    var sys = arbor.ParticleSystem(250, 2500, 0.8  , 90)
    sys.parameters({gravity:true}) 
    sys.renderer = Renderer("#viewport") 

    var nodeCount = graph.nodes.length;
    var edgeCount = graph.edges.length;
    for(var i = 0; i < nodeCount; i++)
      sys.addNode(graph.nodes[i][0], {riskFactor: graph.nodes[i][1]});
    for(var i = 0; i < edgeCount; i++)
      sys.addEdge(graph.edges[i][0], graph.edges[i][1]);
  })

})(this.jQuery)

function getInformation(){
  var nodesCount = graph.nodes.length;
  var edgesCount = graph.edges.length;
  var root = graph.root[0];
  for(var i = 0; i < edgesCount; i++)
    if(graph.edges[i][0] == root || graph.edges[i][1] == root) 
      inContactWith++;
}

function drawText(ctx, canvas){
  ctx.textAlign = text.information.align;
  ctx.font = text.information.font;
  ctx.fillStyle = text.information.fillStyle;
  ctx.fillText(`In contact with: ${inContactWith} `, text.information.x, text.information.y);
  ctx.fillText(`Total people in graph: ${graph.nodes.length} `, text.information.x, text.information.y + text.information.spacing);
  ctx.stroke();
}