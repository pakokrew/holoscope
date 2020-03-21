import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import "normalize.css";
import "./styles.css";

const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;

const views = ['sv-1', 'sv-2', 'sv-3', 'sv-4']

class Engine {
	constructor() {


		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
		this.camera.position.z = 1;

		this.renderers = views.map(view => {
			const container = document.getElementById(view);

			const renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setSize( container.clientWidth, container.clientHeight );

			container.appendChild( renderer.domElement );
			return renderer;
		});

		this.objects = {};

		this.createScene();

	}

	animate() {

		requestAnimationFrame( this.animate.bind(this) );

		this.objects['cube'].rotation.x += 0.01;
		this.objects['cube'].rotation.y += 0.02;

		this.objects['car'].rotation.y += 0.01;
		//this.objects['car'].rotation.y = 1.7;

		this.renderers.forEach(renderer => renderer.render( this.scene, this.camera ))

	}

	createScene() {
		this.scene = new THREE.Scene();
	  this.scene.background = new THREE.Color('black');

	  {
	    const skyColor = 0xB1E1FF;  // light blue
	    const groundColor = 0xB97A20;  // brownish orange
	    const intensity = 1;
	    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	    this.scene.add(light);
	  }

		{
		 const color = 0xFFFFFF;
		 const intensity = 2;
		 const light = new THREE.DirectionalLight(color, intensity);
		 light.position.set(-10, 5, 4);
		 this.scene.add(light);
		 this.scene.add(light.target);
	 	}


		{
			const loader = new GLTFLoader();
		  loader.load( 'assets/pony_cartoon/scene.gltf', ( gltf ) => {
				const root = gltf.scene;
				this.objects['car'] = root;
		    this.scene.add(this.objects['car']);

				const box = new THREE.Box3().setFromObject(root);
		    const boxSize = box.getSize(new THREE.Vector3()).length();
		    const boxCenter = box.getCenter(new THREE.Vector3());
				this.frameArea(boxSize * 1, boxSize, boxCenter, this.camera);

		  }, undefined, console.error);
		}

		{
			const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
			const material = new THREE.MeshNormalMaterial();

			this.objects['cube'] = new THREE.Mesh( geometry, material );
			this.scene.add( this.objects['cube'] );
		}
	}

	frameArea(sizeToFitOnScreen, boxSize, boxCenter) {
	    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	    const halfFovY = THREE.MathUtils.degToRad(this.camera.fov * .5);
	    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
	    // compute a unit vector that points in the direction the camera is now
	    // in the xz plane from the center of the box
	    const direction = (new THREE.Vector3())
	        .subVectors(this.camera.position, boxCenter)
	        .multiply(new THREE.Vector3(1, 0, 1))
	        .normalize();

	    // move the camera to a position distance units way from the center
	    // in whatever direction the camera was from the center already
	    this.camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

	    // pick some near and far values for the frustum that
	    // will contain the box.
	    this.camera.near = boxSize / 100;
	    this.camera.far = boxSize * 100;

	    this.camera.updateProjectionMatrix();

	    // point the camera to look at the center of the box
	    this.camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
	  }
}


new Engine().animate();
