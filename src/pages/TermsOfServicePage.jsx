import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Vérifier au chargement si les CGU sont déjà acceptées
  useEffect(() => {
    const checkCGUStatus = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Vérifier dans les colonnes dédiées CGU du profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('cgu_accepted, cgu_accepted_date')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.warn('Erreur lors de la récupération du profil:', profileError);
        }

        const hasAcceptedCGU = profileData?.cgu_accepted === true;
        
        // Aussi vérifier le localStorage comme fallback
        const localAccepted = localStorage.getItem('cgu_accepted') === 'true';

        if (hasAcceptedCGU || localAccepted) {
          setAlreadyAccepted(true);
          setAccepted(true);
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification du statut CGU:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCGUStatus();
  }, [currentUser]);

  const handleAccept = async () => {
    if (!accepted || !currentUser) return;
    
    try {
      setAccepting(true);
      
      // Méthode 1: Mettre à jour les colonnes dédiées dans la table profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          cgu_accepted: true,
          cgu_accepted_date: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) {
        console.warn('Profile update failed:', profileError);
      }

      // Méthode 2: localStorage pour persistance locale
      localStorage.setItem('cgu_accepted', 'true');
      localStorage.setItem('cgu_accepted_date', new Date().toISOString());
      
      setAlreadyAccepted(true);
      
      toast({
        title: 'CGU acceptées',
        description: 'Vos conditions d\'utilisation ont été enregistrées avec succès.',
      });
      
      // Attendre un peu pour que l'utilisateur voie le message
      setTimeout(() => {
        navigate('/contributeur');
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'acceptation des CGU:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre acceptation. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Vérification du statut CGU...</span>
          </div>
        )}

        {/* Already Accepted State */}
        {!loading && alreadyAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">CGU déjà acceptées</h2>
            </div>
            <p className="text-green-700 mb-4">
              Vous avez déjà accepté les conditions d'utilisation pour contributeurs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/contributeur')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Retour au dashboard
              </button>
              <button
                onClick={() => setAlreadyAccepted(false)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Relire les conditions
              </button>
            </div>
          </div>
        )}

        {/* Normal CGU Display */}
        {!loading && !alreadyAccepted && (
          <>
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Conditions d'utilisation pour contributeurs
                </h1>
              </div>
          <p className="text-gray-600">
            Conditions Générales d'Utilisation (CGU) - Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="prose prose-sm max-w-none text-gray-700">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="mb-4">
                En soumettant un exercice ou une image sur la plateforme SarasSure, vous acceptez 
                l'intégralité de ces Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas 
                ces conditions, vous ne pouvez pas contribuer à la plateforme.
              </p>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                entreront en vigueur immédiatement après publication. Votre utilisation continue de la 
                plateforme constitue votre acceptation des modifications.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                2. Propriété intellectuelle et droits d'auteur
              </h2>
              <p className="mb-4">
                <strong>Vos droits:</strong> Vous conservez la propriété complète de vos créations 
                (exercices et images). Vous confirmez que vous êtes le propriétaire ou le détenteur 
                des droits d'auteur de tout contenu que vous soumettez.
              </p>
              <p className="mb-4">
                <strong>Licence accordée:</strong> En soumettant votre contenu, vous accordez à 
                SarasSure et à ses utilisateurs une licence perpétuelle, non exclusive, royalty-free, 
                mondiale pour utiliser, reproduire, modifier et distribuer votre contenu sur la plateforme.
              </p>
              <p>
                <strong>Pas de violation:</strong> Vous garantissez que votre contenu ne viole les droits 
                d'auteur, les brevets, les marques commerciales ou les droits de propriété intellectuelle 
                d'une tierce partie.
              </p>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                3. Modération et validation
              </h2>
              <p className="mb-4">
                Tout contenu soumis est sujet à une modération et une validation par notre équipe avant 
                d'être publié. Nous nous réservons le droit:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>De rejeter tout contenu jugé inapproprié, de faible qualité ou non conforme</li>
                <li>De modifier ou reformater votre contenu pour assurer la cohérence de la plateforme</li>
                <li>De supprimer votre contenu s'il viole ces conditions</li>
                <li>De suspendre votre compte en cas de violations répétées</li>
              </ul>
              <p>
                Les critères de validation incluent: la clarté, la pertinence pédagogique, le respect 
                des lignes directrices de format et l'absence de contenu offensant ou discriminatoire.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                4. Responsabilité et indemnisation
              </h2>
              <p className="mb-4">
                <strong>Votre responsabilité:</strong> Vous êtes responsable du contenu que vous 
                soumettez. Vous acceptez d'indemniser SarasSure contre toute réclamation, perte ou 
                dommage résultant de votre contenu ou de vos actions.
              </p>
              <p>
                <strong>Limitation de responsabilité:</strong> SarasSure ne peut être tenue responsable 
                des dommages indirects, accidentels ou consécutifs résultant de votre utilisation ou de 
                l'impossibilité d'utiliser la plateforme.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                5. Règles de contenu
              </h2>
              <p className="mb-4">Vous acceptez de ne pas soumettre de contenu:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Offensant, discriminatoire, harcelant ou menaçant</li>
                <li>Contenant des informations personnelles d'autres personnes sans consentement</li>
                <li>Violant les droits d'auteur ou la propriété intellectuelle</li>
                <li>Contenant du malware, des virus ou du code malveillant</li>
                <li>Publicitaire ou promotionnel sans autorisation</li>
                <li>Manifestement inexact ou trompeur</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                6. Rémunération et droits d'utilisation
              </h2>
              <p className="mb-4">
                <strong>Modèle de rémunération:</strong> Les contributeurs ne reçoivent pas de 
                compensation financière pour leurs contributions. Votre participation est volontaire 
                et basée sur la passion pour l'éducation et le partage de connaissances.
              </p>
              <p className="mb-4">
                <strong>Utilisation future:</strong> SarasSure se réserve le droit d'utiliser votre 
                contenu dans d'autres contextes éducatifs ou commerciaux, tant qu'il est clairement 
                attribué et utilisé conformément à votre licence.
              </p>
              <p>
                <strong>Retrait du contenu:</strong> Vous pouvez demander le retrait de votre contenu 
                à tout moment. Cependant, les copies déjà distribuées ne pourront pas être retirées.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                7. Confidentialité et données
              </h2>
              <p className="mb-4">
                Les informations personnelles que vous fournissez seront traitées conformément à notre 
                Politique de Confidentialité. Nous collectons uniquement les données nécessaires pour:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Maintenir votre compte contributeur</li>
                <li>Communiquer à propos de vos contributions</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                8. Résiliation et suspension
              </h2>
              <p className="mb-4">
                Nous pouvons suspendre ou résilier votre accès à la plateforme, avec ou sans préavis, 
                si:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Vous violez ces conditions</li>
                <li>Vous soumettez du contenu offensant ou de mauvaise qualité de manière répétée</li>
                <li>Vous engagez un comportement abusif envers d'autres utilisateurs</li>
                <li>Votre compte est utilisé à des fins inappropriées</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                9. Contact et support
              </h2>
              <p className="mb-4">
                Si vous avez des questions concernant ces conditions ou vos contributions, veuillez 
                nous contacter via le formulaire de contact disponible sur la plateforme.
              </p>
              <p>
                Pour signaler une violation de droits d'auteur ou une utilisation abusive, veuillez 
                envoyer un email détaillé à notre équipe de modération.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                10. Dispositions générales
              </h2>
              <p className="mb-4">
                Ces conditions constituent l'intégralité de l'accord entre vous et SarasSure concernant 
                les contributions. Si une disposition est jugée invalide, les autres dispositions 
                resteront en vigueur.
              </p>
              <p>
                Ces conditions sont régies par la législation applicable et tout différend sera résolu 
                selon les procédures légales en vigueur.
              </p>
            </section>
          </div>

          {/* Warning Banner */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">
                Lecture requise
              </p>
              <p className="text-sm text-amber-800">
                Veuillez lire et comprendre ces conditions avant de soumettre votre premier contenu. 
                Votre acceptation est obligatoire pour contribuer à la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Acceptation des conditions
              </h3>
              <p className="text-gray-700 mb-4">
                En acceptant ces conditions, vous confirmez:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Vous êtes propriétaire ou détenteur des droits d'auteur de votre contenu
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Vous accordez à SarasSure une licence pour utiliser votre contenu
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Vous avez lu et compris toutes les conditions ci-dessus
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Vous acceptez les règles de modération et de suppression de contenu
                  </span>
                </li>
              </ul>

              {/* Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg mb-6">
                <input
                  type="checkbox"
                  id="accept-cgu"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="accept-cgu" className="cursor-pointer text-gray-900">
                  <span className="font-medium">
                    J'accepte les conditions d'utilisation pour contributeurs
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Cette acceptation est requise pour soumettre du contenu
                  </p>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!accepted || accepting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    accepted && !accepting
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {accepting ? 'Enregistrement...' : 'Accepter et continuer'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Ces conditions s'appliquent à tous les contributeurs de la plateforme SarasSure
          </p>
          <p className="mt-2">
            Vous pouvez consulter notre <a href="#" className="text-blue-600 hover:underline">Politique de Confidentialité</a> pour 
            plus d'informations sur le traitement de vos données.
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
