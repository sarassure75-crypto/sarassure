-- Migration: Peupler les traductions du glossaire
-- Date: 2025-12-15
-- Description: Ajoute les traductions pour les termes du lexique

-- ====================================
-- TRADUCTIONS EN ANGLAIS
-- ====================================
INSERT INTO public.glossary_translations (glossary_id, language_code, translated_term, translated_definition, translated_example)
SELECT 
    g.id,
    'en',
    CASE g.term
        WHEN 'Scroll' THEN 'Scroll'
        WHEN 'Paramètres' THEN 'Settings'
        WHEN 'Icônes' THEN 'Icons'
        WHEN 'Glissement' THEN 'Swipe'
        WHEN 'Défilement' THEN 'Scrolling'
        WHEN 'Bouton Power' THEN 'Power Button'
        WHEN 'Volume' THEN 'Volume'
        WHEN 'Écran d''accueil' THEN 'Home Screen'
        WHEN 'Application' THEN 'Application'
        WHEN 'Notification' THEN 'Notification'
        ELSE g.term
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'The action of moving content on the screen up or down by sliding your finger.'
        WHEN 'Paramètres' THEN 'Menu where you can configure options and preferences of your phone or application.'
        WHEN 'Icônes' THEN 'Small images or symbols representing applications, actions or features.'
        WHEN 'Glissement' THEN 'The action of moving your finger across the screen in a direction (up, down, left, right).'
        WHEN 'Défilement' THEN 'Movement of content on screen to see more information beyond visible limits.'
        WHEN 'Bouton Power' THEN 'Physical button on the side of the phone used to turn the device on/off or lock the screen.'
        WHEN 'Volume' THEN 'Sound intensity of your phone, adjusted via the volume buttons on the side of the device.'
        WHEN 'Écran d''accueil' THEN 'First screen you see when you turn on your phone, displaying apps and widgets.'
        WHEN 'Application' THEN 'Software program installed on your phone that performs a specific function.'
        WHEN 'Notification' THEN 'Message or alert that appears on your screen to inform you of an event or update.'
        ELSE 'Translation needed'
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'Slide your finger down to scroll to the bottom of the page.'
        WHEN 'Paramètres' THEN 'Open Settings to change your screen brightness.'
        WHEN 'Icônes' THEN 'Tap the camera icon to take a photo.'
        WHEN 'Glissement' THEN 'Swipe right to return to the previous screen.'
        WHEN 'Défilement' THEN 'Use scrolling to see all messages.'
        WHEN 'Bouton Power' THEN 'Press the Power Button to lock your phone.'
        WHEN 'Volume' THEN 'Use the Volume buttons to increase the music sound.'
        WHEN 'Écran d''accueil' THEN 'Long press on the Home Screen to add a widget.'
        WHEN 'Application' THEN 'Open an Application to check your emails.'
        WHEN 'Notification' THEN 'A Notification will alert you when you receive a message.'
        ELSE NULL
    END
FROM public.glossary g
WHERE g.is_active = true
ON CONFLICT (glossary_id, language_code) DO UPDATE SET
    translated_term = EXCLUDED.translated_term,
    translated_definition = EXCLUDED.translated_definition,
    translated_example = EXCLUDED.translated_example;

-- ====================================
-- TRADUCTIONS EN ESPAGNOL
-- ====================================
INSERT INTO public.glossary_translations (glossary_id, language_code, translated_term, translated_definition, translated_example)
SELECT 
    g.id,
    'es',
    CASE g.term
        WHEN 'Scroll' THEN 'Desplazamiento'
        WHEN 'Paramètres' THEN 'Configuración'
        WHEN 'Icônes' THEN 'Iconos'
        WHEN 'Glissement' THEN 'Deslizar'
        WHEN 'Défilement' THEN 'Desplazamiento'
        WHEN 'Bouton Power' THEN 'Botón de Encendido'
        WHEN 'Volume' THEN 'Volumen'
        WHEN 'Écran d''accueil' THEN 'Pantalla de Inicio'
        WHEN 'Application' THEN 'Aplicación'
        WHEN 'Notification' THEN 'Notificación'
        ELSE g.term
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'La acción de mover contenido en la pantalla hacia arriba o hacia abajo deslizando el dedo.'
        WHEN 'Paramètres' THEN 'Menú donde puede configurar opciones y preferencias de su teléfono o aplicación.'
        WHEN 'Icônes' THEN 'Imágenes o símbolos pequeños que representan aplicaciones, acciones o características.'
        WHEN 'Glissement' THEN 'La acción de mover el dedo por la pantalla en una dirección (arriba, abajo, izquierda, derecha).'
        WHEN 'Défilement' THEN 'Movimiento de contenido en la pantalla para ver más información más allá de los límites visibles.'
        WHEN 'Bouton Power' THEN 'Botón físico en el lateral del teléfono utilizado para encender/apagar el dispositivo o bloquear la pantalla.'
        WHEN 'Volume' THEN 'Intensidad del sonido de su teléfono, ajustada a través de los botones de volumen en el lateral del dispositivo.'
        WHEN 'Écran d''accueil' THEN 'Primera pantalla que ve cuando enciende el teléfono, mostrando aplicaciones y widgets.'
        WHEN 'Application' THEN 'Programa de software instalado en su teléfono que realiza una función específica.'
        WHEN 'Notification' THEN 'Mensaje o alerta que aparece en su pantalla para informarle de un evento o actualización.'
        ELSE 'Traducción necesaria'
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'Deslice el dedo hacia abajo para desplazarse hasta el final de la página.'
        WHEN 'Paramètres' THEN 'Abra Configuración para cambiar el brillo de su pantalla.'
        WHEN 'Icônes' THEN 'Toque el icono de la cámara para tomar una foto.'
        WHEN 'Glissement' THEN 'Deslice hacia la derecha para volver a la pantalla anterior.'
        WHEN 'Défilement' THEN 'Use el desplazamiento para ver todos los mensajes.'
        WHEN 'Bouton Power' THEN 'Presione el Botón de Encendido para bloquear su teléfono.'
        WHEN 'Volume' THEN 'Use los botones de Volumen para aumentar el sonido de la música.'
        WHEN 'Écran d''accueil' THEN 'Mantenga presionada la Pantalla de Inicio para agregar un widget.'
        WHEN 'Application' THEN 'Abra una Aplicación para verificar sus correos electrónicos.'
        WHEN 'Notification' THEN 'Una Notificación le alertará cuando reciba un mensaje.'
        ELSE NULL
    END
FROM public.glossary g
WHERE g.is_active = true
ON CONFLICT (glossary_id, language_code) DO UPDATE SET
    translated_term = EXCLUDED.translated_term,
    translated_definition = EXCLUDED.translated_definition,
    translated_example = EXCLUDED.translated_example;

-- ====================================
-- TRADUCTIONS EN ALLEMAND
-- ====================================
INSERT INTO public.glossary_translations (glossary_id, language_code, translated_term, translated_definition, translated_example)
SELECT 
    g.id,
    'de',
    CASE g.term
        WHEN 'Scroll' THEN 'Scroll'
        WHEN 'Paramètres' THEN 'Einstellungen'
        WHEN 'Icônes' THEN 'Symbole'
        WHEN 'Glissement' THEN 'Wischen'
        WHEN 'Défilement' THEN 'Bildlauf'
        WHEN 'Bouton Power' THEN 'Power-Taste'
        WHEN 'Volume' THEN 'Lautstärke'
        WHEN 'Écran d''accueil' THEN 'Startbildschirm'
        WHEN 'Application' THEN 'Anwendung'
        WHEN 'Notification' THEN 'Benachrichtigung'
        ELSE g.term
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'Die Aktion, Inhalte auf dem Bildschirm nach oben oder unten zu bewegen, indem Sie mit dem Finger streichen.'
        WHEN 'Paramètres' THEN 'Menü, in dem Sie Optionen und Einstellungen Ihres Telefons oder Ihrer Anwendung konfigurieren können.'
        WHEN 'Icônes' THEN 'Kleine Bilder oder Symbole, die Anwendungen, Aktionen oder Funktionen darstellen.'
        WHEN 'Glissement' THEN 'Die Aktion, mit dem Finger in eine Richtung (oben, unten, links, rechts) über den Bildschirm zu wischen.'
        WHEN 'Défilement' THEN 'Bewegung von Inhalten auf dem Bildschirm, um mehr Informationen über die sichtbaren Grenzen hinaus zu sehen.'
        WHEN 'Bouton Power' THEN 'Physischer Knopf an der Seite des Telefons, mit dem das Gerät ein-/ausgeschaltet oder der Bildschirm gesperrt wird.'
        WHEN 'Volume' THEN 'Lautstärkeintensität Ihres Telefons, eingestellt über die Lautstärketasten an der Seite des Geräts.'
        WHEN 'Écran d''accueil' THEN 'Erster Bildschirm, den Sie sehen, wenn Sie Ihr Telefon einschalten, mit Apps und Widgets.'
        WHEN 'Application' THEN 'Softwareprogramm, das auf Ihrem Telefon installiert ist und eine bestimmte Funktion ausführt.'
        WHEN 'Notification' THEN 'Nachricht oder Warnung, die auf Ihrem Bildschirm erscheint, um Sie über ein Ereignis oder Update zu informieren.'
        ELSE 'Übersetzung erforderlich'
    END,
    CASE g.term
        WHEN 'Scroll' THEN 'Streichen Sie mit dem Finger nach unten, um zum Ende der Seite zu scrollen.'
        WHEN 'Paramètres' THEN 'Öffnen Sie Einstellungen, um die Helligkeit Ihres Bildschirms zu ändern.'
        WHEN 'Icônes' THEN 'Tippen Sie auf das Kamerasymbol, um ein Foto zu machen.'
        WHEN 'Glissement' THEN 'Wischen Sie nach rechts, um zum vorherigen Bildschirm zurückzukehren.'
        WHEN 'Défilement' THEN 'Verwenden Sie den Bildlauf, um alle Nachrichten zu sehen.'
        WHEN 'Bouton Power' THEN 'Drücken Sie die Power-Taste, um Ihr Telefon zu sperren.'
        WHEN 'Volume' THEN 'Verwenden Sie die Lautstärketasten, um die Musiklautstärke zu erhöhen.'
        WHEN 'Écran d''accueil' THEN 'Halten Sie auf dem Startbildschirm an, um ein Widget hinzuzufügen.'
        WHEN 'Application' THEN 'Öffnen Sie eine Anwendung, um Ihre E-Mails zu überprüfen.'
        WHEN 'Notification' THEN 'Eine Benachrichtigung warnt Sie, wenn Sie eine Nachricht erhalten.'
        ELSE NULL
    END
FROM public.glossary g
WHERE g.is_active = true
ON CONFLICT (glossary_id, language_code) DO UPDATE SET
    translated_term = EXCLUDED.translated_term,
    translated_definition = EXCLUDED.translated_definition,
    translated_example = EXCLUDED.translated_example;

-- Afficher les résultats
SELECT 'Traductions ajoutées/mises à jour:' as info;
SELECT language_code, COUNT(*) as count 
FROM public.glossary_translations 
GROUP BY language_code
ORDER BY language_code;
