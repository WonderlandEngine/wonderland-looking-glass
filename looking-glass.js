import {Component, Property, ViewComponent} from '@wonderlandengine/api';
import {setXRRigidTransformLocal} from '@wonderlandengine/components/dist/utils/webxr.js';

/**
 * Looking Glass integration component
 *
 * Add one into your scene to allow rendering to Looking Glass
 * by entering VR.
 */
export class LookingGlassComponent extends Component {
    static TypeName = 'looking-glass';
    static Properties = {
        /** Object that acts as the center of the display */
        head: Property.object(),
        /** Looking Glass displays require rendering an array of tiles
         * that is interleaved */
        tileHeight: Property.int(512),
        /** Number of views to render. The more, the clearer the image, but
         * the more performance is required to render a frame */
        viewCount: Property.int(86),
        /** Diameter of the looking glass display */
        targetDiameter: Property.int(3),
        /** Vertical field of view to render */
        fovYDeg: Property.int(14),
        /** Depth separation factor. the more, the deeper the image appears,
         * but the higher potential artefacts might be. */
        depthiness: Property.float(1.1),
    };

    start() {
        this.viewObjects = [];
        this.spawnViews(45 - 2);

        /* Only activate in VR */
        this.engine.onXRSessionStart.add(() => {
            this.active = true;
            this.viewObjects.forEach((v) => (v.active = true));
        });
        this.engine.onXRSessionEnd.add(() => {
            this.active = false;
            this.viewObjects.forEach((v) => (v.active = false));
        });

        if (typeof document !== 'undefined') {
            var LookingGlassWebXRPolyfill =
                require('@lookingglass/webxr').LookingGlassWebXRPolyfill;
            new LookingGlassWebXRPolyfill({
                tileHeight: this.tileHeight,
                numViews: this.viewCount,
                targetY: 0,
                targetZ: 0,
                targetDiam: this.targetDiameter,
                fovy: (this.fovYDeg * Math.PI) / 180,
                depthiness: this.depthiness,
            });
        }

        this.active = false;
    }

    update() {
        const pose = this.engine.xr.frame.getViewerPose(
            this.engine.xr.currentReferenceSpace
        );
        const views = pose.views;
        if (views.length - 2 > this.viewObjects.length) {
            this.spawnViews(views.length - 2 - this.viewObjects.length, true);
        }

        for (let i = 2; i < views.length; ++i) {
            setXRRigidTransformLocal(this.viewObjects[i - 2], views[i].transform);
        }
    }

    spawnViews(viewCount, active = false) {
        const newViews = this.engine.scene.addObjects(viewCount, this.head, viewCount);
        newViews.forEach((v) => v.addComponent(ViewComponent, {active}));
        this.viewObjects.push(...newViews);
    }
}
