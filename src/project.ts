// Deep imports keep the bundle small; the non-".pure" modules also register their side effects
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Light } from '@babylonjs/core/Lights/light';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ImportMeshAsync } from '@babylonjs/core/Loading/sceneLoader';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import '@babylonjs/core/Helpers/sceneHelpers'; // scene.createDefaultEnvironment
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent'; // scene.enablePhysics
import '@babylonjs/core/Physics/v2/physicsEngineComponent';
import '@babylonjs/loaders/glTF';
import HavokPhysics from '@babylonjs/havok';


export class Project {

    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene!: Scene;
    private _camera!: ArcRotateCamera;
    private _light!: Light;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new Engine(this._canvas, true);
    }

    /**
     * Creates the BABYLONJS Scene
     */
    async createScene(): Promise<void> {
        // create a basic BJS Scene object
        this._scene = new Scene(this._engine);
        // create an ArcRotateCamera orbiting around the origin
        this._camera = new ArcRotateCamera("Camera", 0, Math.PI / 3, 10, Vector3.Zero(), this._scene);
        this._camera.attachControl(this._canvas);
        this._camera.wheelPrecision = 100;
        this._camera.lowerRadiusLimit = 0.1;
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this._light = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
        const environment = this._scene.createDefaultEnvironment({createGround: true, createSkybox: true, setupImageProcessing: true});

        // Havok physics engine (loads its wasm module asynchronously)
        const havok = await HavokPhysics();
        this._scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok));
        if (environment?.ground) {
            new PhysicsAggregate(environment.ground, PhysicsShapeType.BOX, { mass: 0 }, this._scene);
        }

        const { meshes } = await ImportMeshAsync('/assets/mesh/princess.glb', this._scene);
        meshes[0].position.addInPlaceFromFloats(0, 0.06, 0);
        meshes[0].rotate(Vector3.Up(), Math.PI);

        // const xr = await this._scene.createDefaultXRExperienceAsync({floorMeshes: [environment.ground]});

        if (process.env.NODE_ENV !== 'production') {
            // Loaded on demand so the inspector stays out of the main bundle
            const { ShowInspector } = await import('@babylonjs/inspector');
            ShowInspector(this._scene);
        }
    }


    /**
     * Starts the animation loop.
     */
    animate(): void {
        this._scene.onBeforeRenderObservable.add(() => {
            let deltaTime: number = this._engine.getDeltaTime() / 1000;
        });

        // run the render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }


}
