// Basic elements
var renderer, scene, camera, light;

// Basic values
var groundStartWidth = 3000, groundStartHeight = 100, groundStartDepth = 100;
var groundStartX = 0, groundStartY = 0, groundStartZ = 1500;

var panelWidth = 1, panelHeight = 1000, panelDepth = 1000;
var panelAStartX = 4000, panelAStartY = 0, panelAStartZ = 1500;
var panelBStartX = -1100, panelBStartY = 0, panelBStartZ = 1500;

var playerSize = groundStartHeight;
var playerStartX = groundStartWidth / 2 - playerSize / 2, playerStartY = 1.5 * playerSize, playerStartZ = groundStartZ;

var checkerWidth = playerSize / 2, checkerHeight = 1, checkerDepth = groundStartDepth;
var checkerStartX = playerStartX, checkerStartY = playerStartY - playerSize / 2 - checkerWidth, checkerStartZ = playerStartZ;

var cameraStartX = playerStartX, cameraStartY = playerStartY + 1000, cameraStartZ = playerStartZ - 1500;
var lightStartX = cameraStartX - 200, lightStartY = cameraStartY, lightStartZ = cameraStartZ;

// Grounds variables
var grounds = [], removeOutsideElements = false, addOutsideElements = true, groundToRemove;

// Meshes
var meshPlayer, meshChecker, meshGround, meshPanelA, meshPanelB;

// Materials
var materialGround, materialPlayer, materialChecker, materialPanels;

// Jump variables
var path, jumpingPlayerAngle = 0, jumpingPlayerPosition = 0, isJumping = false, playerSpeed = 200, movementVar = 6, jumpDistance = 300;

// Movement variables
var counter = 0, motion = Math.PI / playerSpeed / (movementVar / 2);

init();
animate();

function init() {
  // RENDERER
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor("#303030");
  renderer.setPixelRatio(window.devicePixelRation);
  renderer.setSize(window.innerWidth, window.innerHeight);
  var container = document.getElementById( 'container' );
  container.appendChild(renderer.domElement);

  // SCENE
  scene = new THREE.Scene();

  // MATERIALS
  materialGround = new THREE.MeshLambertMaterial({color: "#fac863"});
  materialPlayer = new THREE.MeshPhongMaterial({color: "#ec5f67"});
  materialPanels = new THREE.MeshLambertMaterial({color: "#42f450"});
  materialPanels.visible = false;
  materialChecker = new THREE.MeshLambertMaterial({color: "#68f442"});
  materialChecker.visible = false;

  // GEOMETRIES
  ground = new THREE.BoxGeometry(groundStartWidth, groundStartHeight, groundStartDepth);
  panelA = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
  panelB = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
  player = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
  checker = new THREE.BoxGeometry(checkerWidth, checkerHeight, checkerDepth);

  meshGround = new THREE.Mesh(ground, materialGround);
  meshGround.name = "ground1";
  meshPanelA = new THREE.Mesh(panelA, materialPanels);
  meshPanelB = new THREE.Mesh(panelB, materialPanels);
  meshPlayer = new THREE.Mesh(player, materialPlayer);
  meshChecker = new THREE.Mesh(checker, materialChecker);

  grounds.push(meshGround);

  // CAMERA AND LIGHTS
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  ambientLight = new THREE.AmbientLight("#ffffff", 0.25);
  light = new THREE.DirectionalLight("#ffffff", 0.65);
  light.target = meshPlayer;

  scene.add(meshPanelA);
  scene.add(meshPanelB);
  scene.add(meshPlayer);
  scene.add(meshChecker);
  scene.add(ambientLight);
  scene.add(light);

  setUpObjects();

  // EVENT HANDLERS
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("keydown", onDocumentKeyDown, false);
  document.onclick = function(event) { setUpJump(); };
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentKeyDown(event) {
    if (event.which == 32) // Space
      setUpJump();
}

function setUpObjects() {
  grounds.forEach(function(meshElement) { scene.remove(removeGroundFromArray(meshElement)); });
  grounds.push(meshGround);

  meshGround.position.x = groundStartX;
  meshGround.position.y = groundStartY;
  meshGround.position.z = groundStartZ;
  scene.add(meshGround);

  meshPanelA.position.x = panelAStartX;
  meshPanelA.position.y = panelAStartY;
  meshPanelA.position.z = panelAStartZ;

  meshPanelB.position.x = panelBStartX;
  meshPanelB.position.y = panelBStartY;
  meshPanelB.position.z = panelBStartZ;

  meshPlayer.position.x = playerStartX;
  meshPlayer.position.y = playerStartY;
  meshPlayer.position.z = playerStartZ;
  meshPlayer.rotation.z = 0;

  meshChecker.position.x = checkerStartX;
  meshChecker.position.y = checkerStartY;
  meshChecker.position.z = checkerStartZ;

  camera.position.x = cameraStartX;
  camera.position.y = cameraStartY;
  camera.position.z = cameraStartZ;
  camera.lookAt( meshPlayer.position );

  ambientLight.position.x = lightStartX;
  ambientLight.position.y = lightStartY;
  ambientLight.position.z = lightStartZ;

  light.position.x = lightStartX;
  light.position.y = lightStartY;
  light.position.z = lightStartZ;

  removeOutsideElements = false;
  addOutsideElements = true;
}

function setUpJump() {
  if(!isJumping && typeof onTheGround() !== 'undefined') {
    isJumping = true;
    // Create path
    path = new THREE.Path();
    path.moveTo(meshPlayer.position.x - 2 * jumpDistance, meshPlayer.position.y - playerSize / 2);
    path.absellipse(meshPlayer.position.x - jumpDistance, meshPlayer.position.y - playerSize / 2, jumpDistance, jumpDistance + 0.5 * jumpDistance, 0, Math.PI, false);
    path.lineTo(meshPlayer.position.x - 2 * jumpDistance, meshPlayer.position.y - playerSize / 2);
    // drawPath(); // Show jump path
    previousAngle = getAngle(jumpingPlayerPosition);
    previousPoint = path.getPointAt(jumpingPlayerPosition);
  }
}

function jump() {
  jumpingPlayerPosition += 0.005 * (movementVar / 1.5);
  var point = path.getPointAt(jumpingPlayerPosition);

  meshPanelA.position.x -= (meshPlayer.position.x - point.x);
  meshPanelB.position.x -= (meshPlayer.position.x - point.x);
  light.position.x -= (meshPlayer.position.x - point.x);
  ambientLight.position.x -= (meshPlayer.position.x - point.x);

  camera.position.x -= (meshPlayer.position.x - point.x);
  camera.position.y -= (meshPlayer.position.y - point.y);

  meshChecker.position.x -= (meshPlayer.position.x - point.x);
  meshChecker.position.y -= (meshPlayer.position.y - point.y);

  meshPlayer.position.x = point.x;
  meshPlayer.position.y = point.y;

  var jumpingPlayerAngle = getAngle(jumpingPlayerPosition);
  meshPlayer.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), jumpingPlayerAngle);

  previousPoint = point;
  previousAngle = jumpingPlayerAngle;

  var touchedGround = onTheGround();
  if(jumpingPlayerPosition > 0.5 && typeof touchedGround !== 'undefined') { // Entro la fine del salto tocco un terreno
    isJumping = false, jumpingPlayerPosition = 0;
    meshChecker.position.y = touchedGround.position.y + touchedGround.geometry.parameters.height / 2;
    meshPlayer.position.y = touchedGround.position.y + touchedGround.geometry.parameters.height / 2 + playerSize;
    meshPlayer.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
  } else if(jumpingPlayerPosition > 0.95) {
    isJumping = false, jumpingPlayerPosition = 0;
    meshPlayer.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
  }
}

function getAngle( jumpingPlayerPosition ) {
  var tangent = path.getTangent(jumpingPlayerPosition).normalize();
  jumpingPlayerAngle = - Math.atan(tangent.x / tangent.y);
  return jumpingPlayerAngle;
}

function drawPath() {
  var vertices = path.getSpacedPoints(20);

  for (var i = 0; i < vertices.length; i++) {
    point = vertices[i]
    vertices[i] = new THREE.Vector3(point.x, point.y, 1500);
  }

  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices = vertices;
  var lineMaterial = new THREE.LineBasicMaterial({ color: "#ffffff" });
  var line = new THREE.Line(lineGeometry, lineMaterial)
  scene.add(line);
}

function drawDot() {
  var meshLine = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshLambertMaterial({color: "#ffffff"}));
  meshLine.position.x = meshPlayer.position.x;
  meshLine.position.y = meshPlayer.position.y;
  meshLine.position.z = meshPlayer.position.z;
  scene.add(meshLine);
}

function onTheGround() {
  var result = undefined;
  grounds.forEach(function(meshElement) {
    if(typeof scene.getObjectByName(meshElement.name) !== 'undefined') {
      var checker = new THREE.Box3().setFromObject(meshChecker);
      var ground = new THREE.Box3().setFromObject(meshElement);
      if(checker.intersectsBox(ground))
        result = meshElement;
    }
  });
  return result;
}

function panelAColliding() {
  var result;
  grounds.forEach(function(meshElement) {
    if(typeof scene.getObjectByName(meshElement.name) !== 'undefined') {
      var panelA = new THREE.Box3().setFromObject(meshPanelA);
      var ground = new THREE.Box3().setFromObject(meshElement);
      if(panelA.intersectsBox(ground))
        result = meshElement;
    }
  });
  return result;
}

function panelBColliding() {
  var result = undefined;
  grounds.forEach(function(meshElement) {
    if(typeof scene.getObjectByName(meshElement.name) !== 'undefined') {
      var panelB = new THREE.Box3().setFromObject(meshPanelB);
      var ground = new THREE.Box3().setFromObject(meshElement);
      if(panelB.intersectsBox(ground))
        result = meshElement;
    }
  });
  return result;
}

function createRandomGround() {
  var blockWith = 100;
  var newGroundWidth = Math.random() * (blockWith * 15 - blockWith) + blockWith;

  var newGroundPositionX = Math.random() * ((1.75 * jumpDistance) - 0.5 * jumpDistance) + 0.5 * jumpDistance;
  var groundPositionY = Math.random() * (250 + 250) - 250;
  var groundPositionZ = groundStartZ;

  ground = new THREE.BoxGeometry(newGroundWidth, groundStartHeight, groundStartDepth);
  newMeshGround = new THREE.Mesh(ground, materialGround);
  newMeshGround.name = 'ground' + grounds.length;
  var prevElement = grounds[grounds.length - 1];
  newMeshGround.position.x = prevElement.position.x - prevElement.geometry.parameters.width / 2 - newGroundPositionX - newGroundWidth / 2;
  newMeshGround.position.y = groundPositionY;
  newMeshGround.position.z = groundPositionZ;
  grounds.push(newMeshGround);
  scene.add(newMeshGround);
}

function removeGroundFromArray(ground) {
  for(var i = 0; i < grounds.length; i++)
     if(grounds[i] == ground)
        return grounds.splice(i,1)[0];
}

function animate() {
  if(isJumping) {
    jump();
  } else if(!isJumping && typeof onTheGround() !== 'undefined') {
    counter += playerSpeed / 50 * (movementVar / 2);
    var increaseX = motion * counter;

    meshPanelA.position.x -= motion * playerSpeed * movementVar;
    meshPanelB.position.x -= motion * playerSpeed * movementVar;
    camera.position.x -= motion * playerSpeed * movementVar;
    light.position.x -= motion * playerSpeed * movementVar;
    ambientLight.position.x -= motion * playerSpeed * movementVar;

    meshPlayer.position.x -= motion * playerSpeed * movementVar;
    meshChecker.position.x -= motion * playerSpeed * movementVar;
    meshPlayer.position.y += Math.cos(increaseX);
    camera.position.y += Math.cos(increaseX);

    if(meshPlayer.rotation.z < 0)
      meshPlayer.rotation.z += 0.1;
    if(meshPlayer.rotation.z > 0)
      meshPlayer.rotation.z -= 0.1;
    if(meshPlayer.rotation.z > -0.1 && meshPlayer.rotation.z < 0.1)
      meshPlayer.rotation.z = 0;

    // drawDot();
  } else {
    meshPlayer.position.x -= movementVar * motion * playerSpeed;
    meshPlayer.position.y -= 2 * movementVar * motion * playerSpeed;
    camera.position.x -= movementVar * motion * playerSpeed;
    camera.position.y -= 2 * movementVar * motion * playerSpeed;
    meshPlayer.rotation.z += 0.05;

    meshChecker.position.x -= movementVar * motion * playerSpeed;
    meshChecker.position.y -= 2 * movementVar * motion * playerSpeed;

    if(meshPlayer.position.y < playerStartY - 1500)
      location.reload();
      // setUpObjects(); // TODO Da rivedere
  }

  // PANEL A
  var groundCollidingWithPanelA = panelAColliding();
  if(typeof groundCollidingWithPanelA !== 'undefined' && !removeOutsideElements) {
    groundToRemove = groundCollidingWithPanelA;
    removeOutsideElements = true;
  } else if(typeof groundCollidingWithPanelA == 'undefined' && removeOutsideElements) {
    scene.remove(removeGroundFromArray(groundToRemove));
    removeOutsideElements = false;
  }

  // PANEL B
  var groundCollidingWithPanelB = panelBColliding();
  if(typeof groundCollidingWithPanelB !== 'undefined' && addOutsideElements) {
    createRandomGround();
    addOutsideElements = false;
  } else if(typeof groundCollidingWithPanelB == 'undefined' && !addOutsideElements)
    addOutsideElements = true;

  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}
