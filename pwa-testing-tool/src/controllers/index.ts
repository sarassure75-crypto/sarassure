import { Request, Response } from 'express';

export class IndexController {
    public home(req: Request, res: Response): void {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>PWA Testing Tool</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    h1 { color: #333; }
                    .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 5px; }
                    button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <h1>🚀 PWA Testing Tool</h1>
                <div class="card">
                    <h2>Bienvenue!</h2>
                    <p>Cet outil vous permet de tester votre application PWA sur navigateur et mobile.</p>
                </div>
                <div class="card">
                    <h2>✅ Fonctionnalités</h2>
                    <ul>
                        <li>Test de tactile sur mobile</li>
                        <li>Vérification du responsive design</li>
                        <li>Installation PWA</li>
                        <li>Test mode offline</li>
                    </ul>
                </div>
                <div class="card">
                    <h2>📱 Accès mobile</h2>
                    <p>Depuis votre téléphone sur le même réseau WiFi, accédez à:</p>
                    <p><strong>https://&lt;votre-ip&gt;:3000</strong></p>
                </div>
            </body>
            </html>
        `);
    }

    public testTouchFunctionality(req: Request, res: Response): void {
        res.send("Touch functionality test initiated.");
    }

    public visualizeApplication(req: Request, res: Response): void {
        res.send("Application visualization initiated.");
    }
}