var macAddress;
var inContactWith = -1;

function getMac(){
  macAddress = window.location.href;
  var addressPos;
  console.log(macAddress.length);
  console.log(macAddress);
  for(var i = macAddress.length - 1; i >= 0; i--){
    if(macAddress == '/')
      addressPos = i;
  }
  macAddress = macAddress.substring(addressPos, macAddress);
  console.log('{', macAddress);
}

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

function fetchDataFromDB(){
    getMac();
    return fetch(`http://c3d39bd087a5.ngrok.io/contacts/${macAddress}/`)
    .then(response => {
       return response.json()
    })
}

(function($){
  var deviceType = getDeviceType();
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
          console.log(node.name, "{")
         

          console.log('}');
          ctx.beginPath();
          if(node.data.riskFactor <= 25)
            ctx.fillStyle = riskGradient[3];
          else if(node.data.riskFactor > 25 && node.data.riskFactor <= 50)
            ctx.fillStyle = riskGradient[2];
          else if(node.data.riskFactor <= 75 && node.data.riskFactor > 50 )
            ctx.fillStyle = riskGradient[1];
          else
            ctx.fillStyle = riskGradient[0];

          if(node.name == graph.root[0]){
            ctx.strokeStyle = nodes.root.strokeStyle;
            ctx.lineWidth = nodes.root.lineWidth;
            rad+=nodes.root.radIncrease;
          }
          ctx.arc(pt.x, pt.y, rad, 0, 2 * Math.PI);
          if(node.name == graph.root[0]){
            ctx.stroke(); 
          }
          ctx.fill();
         
          ctx.font = text.percentage.font;
          ctx.fillStyle = text.percentage.fillStyle;
          ctx.textAlign = text.percentage.align;
          ctx.fillText(`${node.data.riskFactor}`, pt.x, pt.y + text.percentage.padding);
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
            var touch, x, y;
            if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
                touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                x = touch.pageX;
                y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
                x = e.clientX;
                y = e.clientY;
            }


           var _mouseP = arbor.Point(x, y)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              dragged.node.fixed = true
            }
            if(deviceType == 'mobile'){
              $(canvas).bind('touchmove', handler.dragged)
              $(window).bind('touchend', handler.dropped)
            } else if(deviceType == 'desktop'){
              $(canvas).bind('mousemove', handler.dragged)
              $(window).bind('mouseup', handler.dropped)
            }

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var touch, x, y;
            if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
              touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
              x = touch.pageX;
              y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
                x = e.clientX;
                y = e.clientY;
            }
            var s = arbor.Point(x, y);

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
            if(deviceType == 'desktop'){
              $(canvas).unbind('mousemove', handler.dragged)
              $(window).unbind('mouseup', handler.dropped)
            } else if(deviceType == 'mobile'){
              $(canvas).unbind('touchmove', handler.dragged)
              $(window).unbind('touchstart', handler.dropped)
            }
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

    var sys = arbor.ParticleSystem(250, 2500, 0.8, 120)
    sys.parameters({gravity:true}) 
    sys.renderer = Renderer("#viewport") 
    fetchDataFromDB().then(data => {
      graph = data;
      var nodeCount = graph.nodes.length;
      var edgeCount = graph.edges.length;
      for(var i = 0; i < nodeCount; i++)
        sys.addNode(graph.nodes[i][0], {riskFactor: graph.nodes[i][1] * 100});
      for(var i = 0; i < edgeCount; i++)
        sys.addEdge(graph.edges[i][0], graph.edges[i][1])
        getInformation();
        console.log(graph);
      }
    )
    var nodeCount = graph.nodes.length;
      var edgeCount = graph.edges.length;
      for(var i = 0; i < nodeCount; i++)
        sys.addNode(graph.nodes[i][0], {riskFactor: graph.nodes[i][1] * 100});
      for(var i = 0; i < edgeCount; i++)
        sys.addEdge(graph.edges[i][0], graph.edges[i][1])
        getInformation();
        console.log(graph)
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
}