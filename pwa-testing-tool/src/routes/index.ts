import { Router, Application } from 'express';
import { IndexController } from '../controllers';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: Application): void {
    app.use('/', router);

    router.get('/', (req, res) => indexController.home(req, res));
    router.get('/test-touch', (req, res) => indexController.testTouchFunctionality(req, res));
    router.get('/visualize', (req, res) => indexController.visualizeApplication(req, res));
}